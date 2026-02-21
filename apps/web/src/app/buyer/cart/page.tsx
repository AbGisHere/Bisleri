"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, MapPin, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n";

interface CartItem {
  cartId: string;
  quantity: number;
  id: string;
  name: string;
  description: string | null;
  price: string;
  location: string;
  category: string | null;
  demandScale: number | null;
  imageUrl: string | null;
  stock: number;
  sellerId: string;
  sellerName: string | null;
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

function CartItemRow({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, qty: number) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const { t } = useLocale();

  const changeQty = async (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.stock) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id, quantity: newQty }),
      });
      if (!res.ok) throw new Error();
      onQuantityChange(item.id, newQty);
    } catch {
      toast.error(t("toast.quantityFailed"));
    } finally {
      setUpdating(false);
    }
  };

  const remove = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id }),
      });
      if (!res.ok) throw new Error();
      onRemove(item.id);
    } catch {
      toast.error(t("toast.removeFailed"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`flex gap-4 py-5 border-b border-border last:border-0 ${updating ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Thumbnail */}
      <Link href={`/marketplace/${item.id}` as never} className="shrink-0">
        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${gradientFor(item.id)} flex items-center justify-center overflow-hidden`}>
          {item.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-foreground/20 select-none">{item.name[0]}</span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/marketplace/${item.id}` as never}>
          <p className="text-sm font-medium hover:text-primary transition-colors truncate">{item.name}</p>
        </Link>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          {item.location}
        </p>
        {item.sellerName && (
          <p className="text-xs text-muted-foreground mt-0.5">by {item.sellerName}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeQty(-1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-full border border-primary/25 bg-primary/10 backdrop-blur-xl flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 hover:scale-95 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
            <button
              onClick={() => changeQty(1)}
              disabled={item.quantity >= item.stock}
              className="w-7 h-7 rounded-full border border-primary/25 bg-primary/10 backdrop-blur-xl flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 hover:scale-95 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price + remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              ₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}
            </span>
            <button
              onClick={remove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 py-5 border-b border-border last:border-0 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="flex justify-between mt-4">
          <div className="h-7 bg-muted rounded-full w-24" />
          <div className="h-4 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.id !== productId));

  const handleQuantityChange = (productId: string, qty: number) =>
    setItems((prev) => prev.map((i) => i.id === productId ? { ...i, quantity: qty } : i));

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/cart/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      toast.success(
        data.skipped > 0
          ? `${data.placed} order(s) placed, ${data.skipped} item(s) skipped (out of stock)`
          : `${data.placed} order(s) placed!`,
      );
      router.push("/buyer/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.checkoutFailed"));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
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
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight">Cart</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-saffron" />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border px-4 sm:px-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-24 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-medium text-sm">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add products from the marketplace to get started.</p>
          </div>
          <Link
            href="/marketplace"
            className="mt-2 px-5 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Browse marketplace
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border px-4 sm:px-6 mb-6">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-forest font-medium">Free</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-display text-2xl tracking-tight">
                  ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full h-12 rounded-full backdrop-blur-xl bg-primary/90 border border-white/10 text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)' }}
            >
              {checkingOut ? "Placing orders…" : `Place ${items.length > 1 ? `${items.length} Orders` : "Order"}`}
            </button>
            <Link
              href="/marketplace"
              className="block text-center text-sm font-medium rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl text-primary/80 hover:text-primary hover:border-primary/30 hover:bg-primary/15 py-3 transition-all duration-200"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)' }}
            >
              Continue shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
