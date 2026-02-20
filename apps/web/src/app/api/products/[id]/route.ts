import { db } from "@bisleri/db";
import { product } from "@bisleri/db/schema/products";
import { user } from "@bisleri/db/schema/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [row] = await db
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
        status: product.status,
        sellerId: product.sellerId,
        sellerName: user.name,
        sellerLocation: user.location,
        createdAt: product.createdAt,
      })
      .from(product)
      .leftJoin(user, eq(product.sellerId, user.id))
      .where(eq(product.id, id));

    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: row });
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
