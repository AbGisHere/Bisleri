import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { wishlist } from "@bisleri/db/schema/wishlist";
import { product } from "@bisleri/db/schema/products";
import { user } from "@bisleri/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/wishlist — returns the current user's wishlisted products
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        location: product.location,
        demandScale: product.demandScale,
        imageUrl: product.imageUrl,
        sellerName: user.name,
        sellerLocation: user.location,
      })
      .from(wishlist)
      .innerJoin(product, eq(wishlist.productId, product.id))
      .leftJoin(user, eq(product.sellerId, user.id))
      .where(eq(wishlist.userId, session.user.id));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to load wishlist" }, { status: 500 });
  }
}

const toggleSchema = z.object({ productId: z.string().min(1) });

// POST /api/wishlist — toggle a product in/out of the wishlist
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { productId } = parsed.data;

  try {
    const [existing] = await db
      .select({ id: wishlist.id })
      .from(wishlist)
      .where(and(eq(wishlist.userId, session.user.id), eq(wishlist.productId, productId)));

    if (existing) {
      await db.delete(wishlist).where(eq(wishlist.id, existing.id));
      return NextResponse.json({ wishlisted: false });
    } else {
      await db.insert(wishlist).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        productId,
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
