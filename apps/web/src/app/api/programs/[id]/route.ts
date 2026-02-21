import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { program } from "@bisleri/db/schema/programs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE /api/programs/[id] — NGO only, must own
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
      .select({ id: program.id, ngoId: program.ngoId })
      .from(program)
      .where(eq(program.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    if (existing.ngoId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(program).where(eq(program.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/programs/[id]]", err);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
