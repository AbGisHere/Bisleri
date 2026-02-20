"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, MapPin, Heart, Store } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Exported so product detail page can use the same toggle logic
export async function toggleWishlist(productId: string): Promise<boolean> {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to update wishlist");
  return data.wishlisted as boolean;
}

export async function getWishlistedIds(): Promise<string[]> {
  const res = await fetch("/api/wishlist");
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map((p: { id: string }) => p.id);
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
  const [removing, setRemoving] = useState(false);
  const level = demandLevel(product.demandScale);
  const demand = DEMAND_STYLES[level];

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await toggleWishlist(product.id);
      onRemove(product.id);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemoving(false);
    }
  };

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
          onClick={handleRemove}
          disabled={removing}
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-full border border-red-300/30 bg-red-500/8 backdrop-blur-xl text-xs font-medium text-red-500/70 hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-500 transition-all duration-200 disabled:opacity-50"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)' }}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          {removing ? "Removing…" : "Remove from wishlist"}
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setProducts(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemove = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/buyer/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to dashboard</span>
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
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
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
