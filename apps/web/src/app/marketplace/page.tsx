"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = ["All", "Weaving", "Pottery", "Embroidery", "Food", "Jewellery", "Painting", "Basket Weaving", "Tailoring"];

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  quantity: number;
  location: string;
  demandScale: number | null;
  imageUrl: string | null;
  sellerName: string | null;
  sellerLocation: string | null;
  createdAt: string;
}

const DEMAND_STYLES = {
  high: { label: "High demand", className: "bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest" },
  medium: { label: "Trending", className: "bg-saffron/20 text-accent-foreground dark:bg-saffron/15 dark:text-saffron" },
  low: { label: "Low demand", className: "bg-muted text-muted-foreground" },
};

function demandLevel(score: number | null): keyof typeof DEMAND_STYLES {
  if (!score) return "low";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// Stable gradient per product based on id
const GRADIENTS = [
  "from-terracotta/20 to-saffron/10",
  "from-clay/30 to-terracotta/10",
  "from-forest/15 to-forest/5",
  "from-saffron/20 to-saffron/5",
  "from-forest/20 to-saffron/10",
  "from-primary/15 to-accent/10",
  "from-muted/60 to-saffron/10",
  "from-saffron/25 to-terracotta/10",
  "from-clay/20 to-muted/30",
];
function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function ProductCard({ product }: { product: Product }) {
  const level = demandLevel(product.demandScale);
  const demand = DEMAND_STYLES[level];
  return (
    <Link
      href={`/marketplace/${product.id}` as never}
      className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 transition-all"
    >
      <div className={`aspect-[4/3] bg-gradient-to-br ${gradientFor(product.id)} flex items-center justify-center`}>
        <span className="font-display text-5xl text-foreground/20 select-none">
          {product.name[0]}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {product.location}
          </p>
          <h3 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.sellerName && (
            <p className="text-xs text-muted-foreground mt-0.5">by {product.sellerName}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-semibold text-base">
            ₹{parseFloat(product.price).toLocaleString("en-IN")}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${demand.className}`}>
            {demand.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()) ||
          (p.sellerName ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="sm:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Browse</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Marketplace</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-primary" />
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products, sellers, or locations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted/40 border border-border/40 text-sm focus:outline-none focus:bg-background focus:border-border transition-colors placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-0 border-b border-border mb-10 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              category === cat
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">No products found.</p>
          {(search || category !== "All") && (
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="text-primary text-sm font-medium mt-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
