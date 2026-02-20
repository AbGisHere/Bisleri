import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { workshop, enrollment } from "@bisleri/db/schema/workshops";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// POST /api/workshops/[id]/enroll — seller only, toggles enrollment
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "seller") {
    return NextResponse.json({ error: "Only sellers can enroll" }, { status: 403 });
  }

  const { id: workshopId } = await params;

  try {
    // Check if already enrolled
    const [existing] = await db
      .select({ id: enrollment.id })
      .from(enrollment)
      .where(and(eq(enrollment.workshopId, workshopId), eq(enrollment.userId, session.user.id)))
      .limit(1);

    if (existing) {
      // Un-enroll
      await db.delete(enrollment).where(eq(enrollment.id, existing.id));
      return NextResponse.json({ enrolled: false });
    }

    // Check workshop exists and get maxAttendees
    const [workshopData] = await db
      .select({ maxAttendees: workshop.maxAttendees, status: workshop.status })
      .from(workshop)
      .where(eq(workshop.id, workshopId))
      .limit(1);

    if (!workshopData) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }
    if (workshopData.status !== "upcoming") {
      return NextResponse.json({ error: "Workshop is not open for enrollment" }, { status: 409 });
    }

    // Check capacity
    const [countResult] = await db
      .select({ count: count() })
      .from(enrollment)
      .where(eq(enrollment.workshopId, workshopId));

    if ((countResult?.count ?? 0) >= workshopData.maxAttendees) {
      return NextResponse.json({ error: "Workshop is full" }, { status: 409 });
    }

    // Enroll
    await db.insert(enrollment).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      workshopId,
    });

    return NextResponse.json({ enrolled: true });
  } catch (err) {
    console.error("[POST /api/workshops/[id]/enroll]", err);
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }
}
