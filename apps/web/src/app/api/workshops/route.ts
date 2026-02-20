import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { workshop, enrollment } from "@bisleri/db/schema/workshops";
import { user } from "@bisleri/db/schema/auth";
import { eq, and, desc, asc, count } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/workshops — role-aware
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);
  const ngoId = searchParams.get("ngoId");

  try {
    // NGO view: own workshops with enrolled sellers info
    if (session?.user?.role === "ngo" && !ngoId) {
      const workshops = await db
        .select({
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          skillArea: workshop.skillArea,
          scheduledAt: workshop.scheduledAt,
          location: workshop.location,
          maxAttendees: workshop.maxAttendees,
          status: workshop.status,
          createdAt: workshop.createdAt,
        })
        .from(workshop)
        .where(eq(workshop.ngoId, session.user.id))
        .orderBy(desc(workshop.scheduledAt));

      const workshopsWithEnrollments = await Promise.all(
        workshops.map(async (w) => {
          const enrolledSellers = await db
            .select({
              userId: enrollment.userId,
              name: user.name,
              location: user.location,
              skills: user.skills,
            })
            .from(enrollment)
            .leftJoin(user, eq(enrollment.userId, user.id))
            .where(eq(enrollment.workshopId, w.id));

          return {
            ...w,
            enrolledCount: enrolledSellers.length,
            enrolledSellers,
          };
        }),
      );

      return NextResponse.json({ workshops: workshopsWithEnrollments });
    }

    // Seller/public view by NGO id
    if (ngoId) {
      const workshops = await db
        .select({
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          skillArea: workshop.skillArea,
          scheduledAt: workshop.scheduledAt,
          location: workshop.location,
          maxAttendees: workshop.maxAttendees,
          status: workshop.status,
          createdAt: workshop.createdAt,
        })
        .from(workshop)
        .where(and(eq(workshop.ngoId, ngoId), eq(workshop.status, "upcoming")))
        .orderBy(asc(workshop.scheduledAt));

      const workshopsWithEnrolled = await Promise.all(
        workshops.map(async (w) => {
          const [countResult] = await db
            .select({ count: count() })
            .from(enrollment)
            .where(eq(enrollment.workshopId, w.id));

          let enrolled = false;
          if (session?.user) {
            const [existing] = await db
              .select({ id: enrollment.id })
              .from(enrollment)
              .where(and(eq(enrollment.workshopId, w.id), eq(enrollment.userId, session.user.id)))
              .limit(1);
            enrolled = !!existing;
          }

          return {
            ...w,
            enrolledCount: countResult?.count ?? 0,
            enrolled,
          };
        }),
      );

      return NextResponse.json({ workshops: workshopsWithEnrolled });
    }

    // Public: all upcoming
    const workshops = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        skillArea: workshop.skillArea,
        scheduledAt: workshop.scheduledAt,
        location: workshop.location,
        maxAttendees: workshop.maxAttendees,
        status: workshop.status,
      })
      .from(workshop)
      .where(eq(workshop.status, "upcoming"))
      .orderBy(asc(workshop.scheduledAt))
      .limit(50);

    return NextResponse.json({ workshops });
  } catch (err) {
    console.error("[GET /api/workshops]", err);
    return NextResponse.json({ error: "Failed to load workshops" }, { status: 500 });
  }
}

const createWorkshopSchema = z.object({
  title: z.string().min(2).max(200),
  skillArea: z.string().min(1),
  scheduledAt: z.string(),
  location: z.string().min(2),
  maxAttendees: z.coerce.number().int().min(1).optional(),
  description: z.string().optional(),
});

// POST /api/workshops — NGO only
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ngo") {
    return NextResponse.json({ error: "Only NGOs can create workshops" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createWorkshopSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? "Invalid data";
    return NextResponse.json({ error: firstError, issues: fieldErrors }, { status: 400 });
  }

  const { title, skillArea, scheduledAt, location, maxAttendees, description } = parsed.data;

  try {
    const [created] = await db
      .insert(workshop)
      .values({
        id: crypto.randomUUID(),
        ngoId: session.user.id,
        title,
        description: description ?? null,
        skillArea,
        scheduledAt: new Date(scheduledAt),
        location,
        maxAttendees: maxAttendees ?? 20,
        status: "upcoming",
      })
      .returning({ id: workshop.id });

    return NextResponse.json({ workshop: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workshops]", err);
    return NextResponse.json({ error: "Failed to create workshop" }, { status: 500 });
  }
}
