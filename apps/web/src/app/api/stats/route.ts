import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { product } from "@bisleri/db/schema/products";
import { order } from "@bisleri/db/schema/orders";
import { eq, and, count, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/stats — role-aware counts for the dashboard
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "seller") {
    const [productsResult] = await db
      .select({ count: count() })
      .from(product)
      .where(and(eq(product.sellerId, session.user.id), eq(product.status, "active")));

    const [activeOrdersResult] = await db
      .select({ count: count() })
      .from(order)
      .where(
        and(
          eq(order.sellerId, session.user.id),
          ne(order.status, "delivered"),
          ne(order.status, "returned"),
        ),
      );

    return NextResponse.json({
      products: productsResult?.count ?? 0,
      activeOrders: activeOrdersResult?.count ?? 0,
    });
  }

  // buyer
  const [ordersResult] = await db
    .select({ count: count() })
    .from(order)
    .where(eq(order.buyerId, session.user.id));

  return NextResponse.json({
    orders: ordersResult?.count ?? 0,
  });
}
