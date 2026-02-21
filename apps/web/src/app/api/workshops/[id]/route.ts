import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { workshop } from "@bisleri/db/schema/workshops";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/workshops/[id] — NGO only, must own
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ngo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [existing] = await db
      .select({ id: workshop.id, ngoId: workshop.ngoId })
      .from(workshop)
      .where(eq(workshop.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }
    if (existing.ngoId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(workshop).where(eq(workshop.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/workshops/[id]]", err);
    return NextResponse.json({ error: "Failed to delete workshop" }, { status: 500 });
  }
}
