import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { program } from "@bisleri/db/schema/programs";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/programs — role-aware
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);
  const ngoId = searchParams.get("ngoId");

  try {
    // NGO view: own programs
    if (session?.user?.role === "ngo" && !ngoId) {
      const programs = await db
        .select()
        .from(program)
        .where(eq(program.ngoId, session.user.id))
        .orderBy(desc(program.createdAt));

      return NextResponse.json({ programs });
    }

    // By NGO id (seller/public view)
    if (ngoId) {
      const programs = await db
        .select()
        .from(program)
        .where(and(eq(program.ngoId, ngoId)))
        .orderBy(desc(program.createdAt));

      return NextResponse.json({ programs });
    }

    // Public: all active
    const programs = await db
      .select()
      .from(program)
      .where(eq(program.status, "active"))
      .orderBy(desc(program.createdAt))
      .limit(50);

    return NextResponse.json({ programs });
  } catch (err) {
    console.error("[GET /api/programs]", err);
    return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
  }
}

const createProgramSchema = z.object({
  title: z.string().min(2).max(200),
  skills: z.string().min(1),
  durationWeeks: z.coerce.number().int().min(1).optional(),
  description: z.string().optional(),
});

// POST /api/programs — NGO only
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ngo") {
    return NextResponse.json({ error: "Only NGOs can create programs" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createProgramSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? "Invalid data";
    return NextResponse.json({ error: firstError, issues: fieldErrors }, { status: 400 });
  }

  const { title, skills, durationWeeks, description } = parsed.data;

  try {
    const [created] = await db
      .insert(program)
      .values({
        id: crypto.randomUUID(),
        ngoId: session.user.id,
        title,
        description: description ?? null,
        skills,
        durationWeeks: durationWeeks ?? null,
        status: "active",
      })
      .returning({ id: program.id });

    return NextResponse.json({ program: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/programs]", err);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
