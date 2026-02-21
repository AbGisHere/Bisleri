import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { message } from "@bisleri/db/schema/messages";
import { user } from "@bisleri/db/schema/auth";
import { eq, and, or, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/messages/[userId] — get message thread with a user, marks unread as read
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: otherUserId } = await params;

  try {
    // Fetch the other user's info
    const [otherUser] = await db
      .select({ id: user.id, name: user.name, image: user.image, role: user.role })
      .from(user)
      .where(eq(user.id, otherUserId));

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch messages between the two users
    const messages = await db
      .select()
      .from(message)
      .where(
        or(
          and(
            eq(message.senderId, session.user.id),
            eq(message.receiverId, otherUserId),
          ),
          and(
            eq(message.senderId, otherUserId),
            eq(message.receiverId, session.user.id),
          ),
        ),
      )
      .orderBy(desc(message.createdAt))
      .limit(100);

    // Mark unread messages from the other user as read
    await db
      .update(message)
      .set({ read: true })
      .where(
        and(
          eq(message.senderId, otherUserId),
          eq(message.receiverId, session.user.id),
          eq(message.read, false),
        ),
      );

    return NextResponse.json({
      user: otherUser,
      messages: messages.reverse(), // oldest first
    });
  } catch (err) {
    console.error("[GET /api/messages/[userId]]", err);
    return NextResponse.json({ messages: [] });
  }
}
