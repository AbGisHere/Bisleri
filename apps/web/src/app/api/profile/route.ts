import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { user } from "@bisleri/db/schema/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role, age, location, skills } = body;

  await db
    .update(user)
    .set({
      role: role || "seller",
      age: age ? Number(age) : null,
      location: location || null,
      skills: Array.isArray(skills) ? skills.join(",") : skills || null,
      onboardingComplete: true,
    })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}
