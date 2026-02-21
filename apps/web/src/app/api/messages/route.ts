import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { message } from "@bisleri/db/schema/messages";
import { user } from "@bisleri/db/schema/auth";
import { eq, or, and, desc, count, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

// GET /api/messages — list conversations grouped by other user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get latest message per conversation partner using a subquery
    // We identify conversations by the "other" user id
    const allMessages = await db
      .select({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt,
      })
      .from(message)
      .where(
        or(eq(message.senderId, userId), eq(message.receiverId, userId)),
      )
      .orderBy(desc(message.createdAt));

    // Group by conversation partner
    const conversationMap = new Map<
      string,
      {
        otherUserId: string;
        lastMessage: typeof allMessages[0];
        unreadCount: number;
      }
    >();

    for (const msg of allMessages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages sent to us by this user
      if (msg.receiverId === userId && !msg.read) {
        const conv = conversationMap.get(otherUserId)!;
        conv.unreadCount++;
      }
    }

    // Fetch user info for all conversation partners
    const otherUserIds = [...conversationMap.keys()];

    if (otherUserIds.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const users = await db
      .select({ id: user.id, name: user.name, image: user.image, role: user.role })
      .from(user)
      .where(sql`${user.id} IN ${otherUserIds}`);

    const userMap = new Map(users.map((u) => [u.id, u]));

    const conversations = [...conversationMap.values()]
      .sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime(),
      )
      .map((conv) => ({
        user: userMap.get(conv.otherUserId) ?? {
          id: conv.otherUserId,
          name: "Unknown",
          image: null,
          role: null,
        },
        lastMessage: {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isOwn: conv.lastMessage.senderId === userId,
        },
        unreadCount: conv.unreadCount,
      }));

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET /api/messages]", err);
    return NextResponse.json({ conversations: [] });
  }
}

const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

// POST /api/messages — send a message
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { receiverId, content } = parsed.data;

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 },
      );
    }

    // Verify receiver exists
    const [receiver] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, receiverId));

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [newMessage] = await db
      .insert(message)
      .values({
        senderId: session.user.id,
        receiverId,
        content,
      })
      .returning();

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages]", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
