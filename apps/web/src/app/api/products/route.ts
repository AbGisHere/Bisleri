import { auth } from "@bisleri/auth";
import { db } from "@bisleri/db";
import { product } from "@bisleri/db/schema/products";
import { user } from "@bisleri/db/schema/auth";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

// GET /api/products — public product listing for the marketplace
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sellerId = searchParams.get("sellerId"); // for seller's own listings

  const conditions = [eq(product.status, "active")];
  if (sellerId) conditions.push(eq(product.sellerId, sellerId));
  if (category && category !== "All") conditions.push(eq(product.category, category));

  const products = await db
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
    .where(and(...conditions))
    .orderBy(desc(product.createdAt))
    .limit(60);

  // Apply search filter after fetch (simple in-memory for now)
  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()) ||
          (p.sellerName ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  return NextResponse.json({ products: filtered });
}

const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  quantity: z.coerce.number().int().min(1),
  location: z.string().min(2),
  demandScale: z.coerce.number().min(0).max(100).optional(),
});

// POST /api/products — create a new product (seller only)
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "seller") {
    return NextResponse.json({ error: "Only sellers can list products" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, description, category, price, quantity, location, demandScale } = parsed.data;

  const [created] = await db
    .insert(product)
    .values({
      id: crypto.randomUUID(),
      name,
      description: description ?? null,
      category: category ?? null,
      price,
      quantity,
      location,
      demandScale: demandScale ?? null,
      sellerId: session.user.id,
      status: "active",
    })
    .returning({ id: product.id });

  return NextResponse.json({ product: created }, { status: 201 });
}
