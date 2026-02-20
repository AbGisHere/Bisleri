"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Heart, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WISHLIST_KEY = "rangaayan_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx === -1) {
    list.push(productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return true; // added
  } else {
    list.splice(idx, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return false; // removed
  }
}

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
}

const DEMAND_STYLES = {
  high: { label: "High demand", className: "bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest" },
  medium: { label: "Trending", className: "bg-saffron/20 text-accent-foreground dark:bg-saffron/15 dark:text-saffron" },
  low: { label: "Low demand", className: "bg-muted text-muted-foreground" },
};

function demandLevel(score: number | null) {
  if (!score) return "low" as const;
  if (score >= 70) return "high" as const;
  if (score >= 40) return "medium" as const;
  return "low" as const;
}

const GRADIENTS = [
  "from-terracotta/20 to-saffron/10",
  "from-clay/30 to-terracotta/10",
  "from-forest/15 to-forest/5",
  "from-saffron/20 to-saffron/5",
  "from-forest/20 to-saffron/10",
  "from-primary/15 to-accent/10",
];
function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function WishlistCard({ product, onRemove }: { product: Product; onRemove: (id: string) => void }) {
  const level = demandLevel(product.demandScale);
  const demand = DEMAND_STYLES[level];

  return (
    <div className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 transition-all">
      <Link href={`/marketplace/${product.id}` as never}>
        <div className={`aspect-[4/3] bg-gradient-to-br ${gradientFor(product.id)} flex items-center justify-center`}>
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-5xl text-foreground/20 select-none">{product.name[0]}</span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {product.location}
          </p>
          <Link href={`/marketplace/${product.id}` as never}>
            <h3 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
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
        <button
          onClick={() => onRemove(product.id)}
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-full border border-border text-xs font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          Remove from wishlist
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
        </div>
        <div className="h-9 bg-muted rounded-full w-full" />
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = getWishlist();
    setIds(saved);

    if (saved.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch each product by ID
    Promise.all(
      saved.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => data?.product ?? null)
          .catch(() => null),
      ),
    )
      .then((results) => setProducts(results.filter(Boolean) as Product[]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setIds((prev) => prev.filter((id) => id !== productId));
  };

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
        <Link
          href="/buyer/dashboard"
          className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight">Wishlist</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-saffron" />
      </div>

      {!loading && (
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">
          {products.length} {products.length === 1 ? "product" : "products"} saved
        </p>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: ids.length || 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <WishlistCard key={p.id} product={p} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-24 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Heart className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-medium text-sm">Nothing saved yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap the heart on any product to save it here.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 mt-2 px-5 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Store className="w-4 h-4" />
            Browse marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
