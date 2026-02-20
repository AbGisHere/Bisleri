import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { product } from "@bisleri/db/schema/products";
import { order } from "@bisleri/db/schema/orders";
import { wishlist } from "@bisleri/db/schema/wishlist";
import { cart } from "@bisleri/db/schema/cart";
import { workshop, enrollment } from "@bisleri/db/schema/workshops";
import { program } from "@bisleri/db/schema/programs";
import { eq, and, count, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/stats — role-aware counts for the dashboard
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    if (session.user.role === "ngo") {
      const [[workshopsResult], [programsResult]] = await Promise.all([
        db.select({ count: count() }).from(workshop).where(eq(workshop.ngoId, session.user.id)),
        db.select({ count: count() }).from(program).where(eq(program.ngoId, session.user.id)),
      ]);

      // Count distinct enrolled sellers across all NGO's workshops
      const enrollees = await db
        .selectDistinct({ userId: enrollment.userId })
        .from(enrollment)
        .innerJoin(workshop, eq(enrollment.workshopId, workshop.id))
        .where(eq(workshop.ngoId, session.user.id));

      return NextResponse.json({
        workshops: workshopsResult?.count ?? 0,
        programs: programsResult?.count ?? 0,
        enrollees: enrollees.length,
      });
    }

    // buyer
    const [[ordersResult], [wishlistResult], [cartResult]] = await Promise.all([
      db.select({ count: count() }).from(order).where(eq(order.buyerId, session.user.id)),
      db.select({ count: count() }).from(wishlist).where(eq(wishlist.userId, session.user.id)),
      db.select({ count: count() }).from(cart).where(eq(cart.userId, session.user.id)),
    ]);

    return NextResponse.json({
      orders: ordersResult?.count ?? 0,
      wishlist: wishlistResult?.count ?? 0,
      cart: cartResult?.count ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ products: 0, activeOrders: 0, orders: 0 });
  }
}
