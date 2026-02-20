import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { cart } from "@bisleri/db/schema/cart";
import { product } from "@bisleri/db/schema/products";
import { user } from "@bisleri/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/cart — return all cart items for the current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await db
      .select({
        cartId: cart.id,
        quantity: cart.quantity,
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        location: product.location,
        category: product.category,
        demandScale: product.demandScale,
        imageUrl: product.imageUrl,
        stock: product.quantity,
        sellerId: product.sellerId,
        sellerName: user.name,
      })
      .from(cart)
      .innerJoin(product, eq(cart.productId, product.id))
      .leftJoin(user, eq(product.sellerId, user.id))
      .where(eq(cart.userId, session.user.id));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/cart]", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

// POST /api/cart — add or update quantity for a product
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  try {
    const [p] = await db.select().from(product).where(eq(product.id, productId));
    if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (p.sellerId === session.user.id)
      return NextResponse.json({ error: "Cannot add your own product to cart" }, { status: 400 });
    if (quantity > p.quantity)
      return NextResponse.json({ error: `Only ${p.quantity} in stock` }, { status: 409 });

    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, session.user.id), eq(cart.productId, productId)));

    if (existing) {
      await db
        .update(cart)
        .set({ quantity })
        .where(eq(cart.id, existing.id));
    } else {
      await db.insert(cart).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        productId,
        quantity,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/cart]", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

const removeSchema = z.object({ productId: z.string().min(1) });

// DELETE /api/cart — remove a product from the cart
export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await db
      .delete(cart)
      .where(and(eq(cart.userId, session.user.id), eq(cart.productId, parsed.data.productId)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/cart]", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
