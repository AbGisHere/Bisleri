import { db } from "@bisleri/db";
import { user } from "@bisleri/db/schema/auth";
import { workshop } from "@bisleri/db/schema/workshops";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/ngos — public, no auth required
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ngoId = searchParams.get("id");

  try {
    if (ngoId) {
      const [ngo] = await db
        .select({
          id: user.id,
          name: user.name,
          location: user.location,
          focusArea: user.focusArea,
          districtCoverage: user.districtCoverage,
          shgName: user.shgName,
          memberCount: user.memberCount,
        })
        .from(user)
        .where(and(eq(user.id, ngoId), eq(user.role, "ngo")))
        .limit(1);

      if (!ngo) {
        return NextResponse.json({ error: "NGO not found" }, { status: 404 });
      }

      return NextResponse.json({ ngo });
    }

    // All NGOs with upcoming workshop count
    const ngos = await db
      .select({
        id: user.id,
        name: user.name,
        location: user.location,
        focusArea: user.focusArea,
        districtCoverage: user.districtCoverage,
        shgName: user.shgName,
        memberCount: user.memberCount,
      })
      .from(user)
      .where(eq(user.role, "ngo"));

    const ngosWithCount = await Promise.all(
      ngos.map(async (ngo) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(workshop)
          .where(and(eq(workshop.ngoId, ngo.id), eq(workshop.status, "upcoming")));

        return { ...ngo, upcomingWorkshops: countResult?.count ?? 0 };
      }),
    );

    return NextResponse.json({ ngos: ngosWithCount });
  } catch (err) {
    console.error("[GET /api/ngos]", err);
    return NextResponse.json({ error: "Failed to load NGOs" }, { status: 500 });
  }
}
