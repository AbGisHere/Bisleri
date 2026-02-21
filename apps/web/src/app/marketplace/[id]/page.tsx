"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MapPin, Package, User, Tag, ShoppingCart } from "lucide-react";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getWishlistedIds, toggleWishlist } from "@/app/buyer/wishlist/page";

const thankYouMessages = [
  "She made it for you",
  "Your cart changed a life",
  "From her hands to yours",
  "Real craft. Real impact",
  "You chose her today",
  "No middlemen. Just her",
  "Thank you for seeing her",
  "Small buy. Big difference",
  "She'll smile when this ships",
  "Good hands made this",
  "You paid her fairly",
  "Craft over convenience",
  "She was waiting for you",
  "Her work. Your choice",
  "You made her day"
];

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
  status: string;
  sellerId: string;
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

function SkeletonPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto animate-pulse">
      <div className="h-4 bg-muted rounded w-32 mb-10" />
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="aspect-square bg-muted rounded-3xl" />
        <div className="space-y-5 py-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
            <div className="h-3 bg-muted rounded w-4/6" />
          </div>
          <div className="h-12 bg-muted rounded-full w-full mt-8" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [cartUpdating, setCartUpdating] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const wishlistIconRef = useRef<AnimatedIconHandle>(null);

  // Set random thank you message when cart quantity changes
  useEffect(() => {
    const randomMessage = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
    setThankYouMessage(randomMessage);
  }, [cartQuantity]);

  useEffect(() => {
    if (!id || !session) return;
    getWishlistedIds().then((ids) => setIsWishlisted(ids.includes(id)));
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        const item = (data.items ?? []).find((i: { id: string; quantity: number }) => i.id === id);
        if (item) setCartQuantity(item.quantity);
      })
      .catch(() => {});
  }, [id, session]);

  const handleWishlist = async () => {
    if (!session) {
      toast.error("Sign in to save products");
      router.push("/login");
      return;
    }
    wishlistIconRef.current?.startAnimation();
    setTimeout(() => wishlistIconRef.current?.stopAnimation(), 400);
    try {
      const added = await toggleWishlist(id!);
      setIsWishlisted(added);
      toast.success(added ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setProduct(data.product ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Sign in to add to cart");
      router.push("/login");
      return;
    }
    setCartUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add to cart");
      setCartQuantity(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCartUpdating(false);
    }
  };

  const handleCartQtyChange = async (delta: number) => {
    const newQty = cartQuantity + delta;
    setCartUpdating(true);
    try {
      if (newQty <= 0) {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product!.id }),
        });
        if (!res.ok) throw new Error();
        setCartQuantity(0);
      } else {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product!.id, quantity: newQty }),
        });
        if (!res.ok) throw new Error();
        setCartQuantity(newQty);
      }
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setCartUpdating(false);
    }
  };

  const handleOrder = async () => {
    if (!session) {
      toast.error("Sign in to place an order");
      router.push("/login");
      return;
    }
    if (session.user.role === "seller" && product?.sellerId === session.user.id) {
      toast.error("You cannot order your own product");
      return;
    }
    setIsOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product!.id,
          quantity: 1,
          buyerAddress: (session.user as { location?: string }).location ?? "Address on file",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      toast.success("Order placed!");
      router.push("/buyer/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) return <SkeletonPage />;

  if (notFound || !product) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to marketplace
        </Link>
        <div className="rounded-2xl border border-dashed border-border py-24 text-center">
          <p className="text-muted-foreground text-sm">Product not found.</p>
          <Link href="/marketplace" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const level = demandLevel(product.demandScale);
  const demand = DEMAND_STYLES[level];
  const isSeller = session?.user?.id === product.sellerId;
  const isLoggedIn = !!session;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to marketplace
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Image */}
        <div className={`aspect-square rounded-3xl bg-gradient-to-br ${gradientFor(product.id)} flex items-center justify-center`}>
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <span className="font-display text-[8rem] text-foreground/15 select-none leading-none">
              {product.name[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Location & category */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {product.location}
            </p>
            {product.category && (
              <>
                <span className="text-border">·</span>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="w-3 h-3 shrink-0" />
                  {product.category}
                </p>
              </>
            )}
          </div>

          {/* Name */}
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Price + demand */}
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl tracking-tight">
              ₹{parseFloat(product.price).toLocaleString("en-IN")}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${demand.className}`}>
              {demand.label}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Seller */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{product.sellerName ?? "Artisan"}</p>
              {product.sellerLocation && (
                <p className="text-xs text-muted-foreground">{product.sellerLocation}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="w-3.5 h-3.5" />
            {product.quantity > 0
              ? `${product.quantity} in stock`
              : "Out of stock"}
          </div>

          {/* CTA */}
          {isSeller ? (
            <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground text-center mt-2">
              This is your listing
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              {/* Left slot: counter when in cart, otherwise Add to Cart */}
              {cartQuantity > 0 ? (
                <div className={`flex-1 flex items-center justify-center gap-4 transition-opacity ${cartUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                  <button
                    onClick={() => handleCartQtyChange(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-primary backdrop-blur-xl transition-all duration-200 hover:bg-primary/20 hover:border-primary/40 hover:scale-95 active:scale-90"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>-</span>
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{cartQuantity}</span>
                  <button
                    onClick={() => handleCartQtyChange(1)}
                    disabled={cartQuantity >= product.quantity}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-primary backdrop-blur-xl transition-all duration-200 hover:bg-primary/20 hover:border-primary/40 hover:scale-95 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={cartUpdating || product.quantity === 0}
                  className="flex-1 h-12 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-xl text-primary font-semibold text-sm hover:bg-primary/15 hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartUpdating ? "Adding…" : "Add to Cart"}
                </button>
              )}

              {/* Thank you note — shown when counter is active, takes more space when wishlist is hidden */}
              {cartQuantity > 0 && (
                <div
                  className={`min-w-0 h-12 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-xl flex items-center justify-center gap-1.5 px-4 overflow-hidden ${
                    cartQuantity > 0 ? "flex-1" : "flex-1"
                  }`}
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <span className="text-sm flex-shrink-0">🌸</span>
                  <span className="text-sm font-medium text-primary text-center leading-tight">{thankYouMessage}</span>
                </div>
              )}

              {/* Place Order — hidden when counter is active */}
              {cartQuantity === 0 && (
                <button
                  onClick={handleOrder}
                  disabled={isOrdering || product.quantity === 0}
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-primary/75 border border-primary/30 text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.15)' }}
                >
                  {isOrdering
                    ? "Placing…"
                    : product.quantity === 0
                      ? "Out of stock"
                      : isLoggedIn
                        ? "Place Order"
                        : "Sign in to Order"}
                </button>
              )}

              {/* Wishlist - hidden when item is in cart */}
              {cartQuantity === 0 && (
                <button
                  onClick={handleWishlist}
                  onMouseEnter={() => wishlistIconRef.current?.startAnimation()}
                  onMouseLeave={() => wishlistIconRef.current?.stopAnimation()}
                  title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 backdrop-blur-xl transition-all duration-200 ${
                    isWishlisted
                      ? "border-red-400/50 bg-red-500/15 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:border-red-300/70 hover:bg-red-500/8 hover:text-red-400"
                  }`}
                  style={{
                    boxShadow: isWishlisted
                      ? 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 8px rgba(239,68,68,0.2)'
                      : 'inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <ScanHeartIcon
                    ref={wishlistIconRef}
                    size={18}
                    color="currentColor"
                    strokeWidth={isWishlisted ? 2.5 : 2}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
