import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { order } from "@bisleri/db/schema/orders";
import { product } from "@bisleri/db/schema/products";
import { user } from "@bisleri/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/orders — returns orders for the current user (as buyer or seller)
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await db
      .select({
        id: order.id,
        status: order.status,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        buyerAddress: order.buyerAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        productId: order.productId,
        productName: product.name,
        productLocation: product.location,
        buyerId: order.buyerId,
        buyerName: user.name,
        sellerId: order.sellerId,
      })
      .from(order)
      .leftJoin(product, eq(order.productId, product.id))
      .leftJoin(user, eq(order.buyerId, user.id))
      .where(
        session.user.role === "seller"
          ? eq(order.sellerId, session.user.id)
          : eq(order.buyerId, session.user.id),
      )
      .orderBy(desc(order.createdAt))
      .limit(50);

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

const createOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  buyerAddress: z.string().min(5, "Please provide a delivery address"),
});

// POST /api/orders — place an order (buyer only)
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid data";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { productId, quantity, buyerAddress } = parsed.data;

  try {
    const [p] = await db.select().from(product).where(eq(product.id, productId));

    if (!p) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (p.status !== "active") {
      return NextResponse.json({ error: "Product is no longer available" }, { status: 409 });
    }
    if (p.sellerId === session.user.id) {
      return NextResponse.json({ error: "Cannot order your own product" }, { status: 400 });
    }
    if (p.quantity < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 409 });
    }

    const totalAmount = (parseFloat(p.price) * quantity).toFixed(2);

    const [created] = await db
      .insert(order)
      .values({
        id: crypto.randomUUID(),
        productId,
        buyerId: session.user.id,
        sellerId: p.sellerId,
        quantity,
        totalAmount,
        buyerAddress,
        status: "pending",
      })
      .returning({ id: order.id });

    return NextResponse.json({ order: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}
