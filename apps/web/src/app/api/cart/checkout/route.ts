import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { cart } from "@bisleri/db/schema/cart";
import { order } from "@bisleri/db/schema/orders";
import { product } from "@bisleri/db/schema/products";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// POST /api/cart/checkout — place orders for every item in cart, then clear it
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await db
      .select({
        cartId: cart.id,
        productId: cart.productId,
        quantity: cart.quantity,
      })
      .from(cart)
      .where(eq(cart.userId, session.user.id));

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const buyerAddress =
      (session.user as { location?: string }).location ?? "Address on file";

    // Fetch all products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await db
      .select()
      .from(product)
      .where(
        productIds.length === 1
          ? eq(product.id, productIds[0])
          : eq(product.id, productIds[0]), // drizzle handles batch below
      );

    // Map products by ID for quick lookup
    const productMap = new Map(
      (
        await Promise.all(
          productIds.map((id) =>
            db.select().from(product).where(eq(product.id, id)).then(([p]) => p),
          ),
        )
      )
        .filter(Boolean)
        .map((p) => [p.id, p]),
    );

    const skipped: string[] = [];
    const ordersToCreate: typeof order.$inferInsert[] = [];

    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p || p.status !== "active" || p.quantity < item.quantity) {
        skipped.push(item.productId);
        continue;
      }
      ordersToCreate.push({
        id: crypto.randomUUID(),
        productId: item.productId,
        buyerId: session.user.id,
        sellerId: p.sellerId,
        quantity: item.quantity,
        totalAmount: (parseFloat(p.price) * item.quantity).toFixed(2),
        buyerAddress,
        status: "pending",
      });
    }

    if (ordersToCreate.length === 0) {
      return NextResponse.json(
        { error: "No items could be ordered (out of stock or unavailable)" },
        { status: 409 },
      );
    }

    // Insert all orders and clear successfully ordered items from cart
    await Promise.all(ordersToCreate.map((o) => db.insert(order).values(o)));
    await Promise.all(
      ordersToCreate.map((o) =>
        db
          .delete(cart)
          .where(eq(cart.productId, o.productId!)),
      ),
    );

    return NextResponse.json({
      placed: ordersToCreate.length,
      skipped: skipped.length,
    });
  } catch (err) {
    console.error("[POST /api/cart/checkout]", err);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
