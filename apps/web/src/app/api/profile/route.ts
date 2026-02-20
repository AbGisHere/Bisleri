import { auth, ROLES, type Role } from "@bisleri/auth";
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

  if (role && !ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  if (
    role &&
    session.user.onboardingComplete &&
    role !== session.user.role
  ) {
    return NextResponse.json(
      { error: "Cannot change role after onboarding" },
      { status: 400 },
    );
  }

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
