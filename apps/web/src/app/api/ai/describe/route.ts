import { NextRequest, NextResponse } from "next/server";

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Weaving: ["weav", "loom", "handloom", "saree", "sari", "fabric", "textile", "cloth", "cotton", "silk", "shawl", "stole", "dupatta"],
  Pottery: ["pot", "clay", "ceramic", "terracotta", "earthen", "mud", "pottery", "vase", "diya", "matka"],
  Embroidery: ["embroider", "stitch", "kantha", "chikan", "phulkari", "zardozi", "mirror work", "thread work", "needlework"],
  Food: ["food", "pickle", "achaar", "spice", "masala", "papad", "jam", "honey", "ghee", "oil", "snack", "sweet", "murabba"],
  Jewellery: ["jewel", "jewelry", "necklace", "bangle", "earring", "ring", "bracelet", "ornament", "tribal", "beaded", "oxidized"],
  Painting: ["paint", "art", "madhubani", "warli", "pattachitra", "miniature", "canvas", "mural"],
  "Basket Weaving": ["basket", "bamboo", "cane", "wicker", "jute", "grass", "moonj"],
  Tailoring: ["tailor", "dress", "blouse", "kurti", "kurta", "garment", "stitch", "sew", "alter"],
};

function suggestCategory(productName: string): string | null {
  const lower = productName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { product_name, category } = await req.json();

  if (!product_name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  const keywordCategory = category || suggestCategory(product_name);

  const res = await fetch(`${AI_URL}/api/describe/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_name,
      category: keywordCategory,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }

  const data = await res.json();

  // Use keyword match first, then AI suggestion as fallback
  const suggested_category = keywordCategory || data.category || null;

  return NextResponse.json({
    description: data.description,
    suggested_category,
  });
}
