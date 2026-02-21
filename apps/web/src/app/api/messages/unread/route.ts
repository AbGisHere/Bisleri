import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { message } from "@bisleri/db/schema/messages";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/messages/unread — total unread message count
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [result] = await db
      .select({ count: count() })
      .from(message)
      .where(
        and(
          eq(message.receiverId, session.user.id),
          eq(message.read, false),
        ),
      );

    return NextResponse.json({ unread: result?.count ?? 0 });
  } catch (err) {
    console.error("[GET /api/messages/unread]", err);
    return NextResponse.json({ unread: 0 });
  }
}
