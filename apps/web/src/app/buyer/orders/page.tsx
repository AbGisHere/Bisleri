"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package, MapPin, CheckCircle2, Clock, Truck, RotateCcw, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type OrderStatus = "pending" | "shipped" | "delivered" | "returned";

interface Order {
  id: string;
  status: OrderStatus;
  quantity: number;
  totalAmount: string;
  buyerAddress: string | null;
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string | null;
  productLocation: string | null;
  buyerId: string;
  buyerName: string | null;
  sellerId: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
    icon: Circle,
  },
  shipped: {
    label: "On the way",
    className: "bg-saffron/20 text-accent-foreground dark:bg-saffron/15 dark:text-saffron",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    className: "bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest",
    icon: CheckCircle2,
  },
  returned: {
    label: "Returned",
    className: "bg-destructive/10 text-destructive",
    icon: RotateCcw,
  },
};

function OrderRow({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const dateStr = (() => {
    try { return format(new Date(order.createdAt), "dd MMM yyyy"); } catch { return ""; }
  })();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium truncate">{order.productName ?? "Product"}</p>
          <span className="text-xs text-muted-foreground shrink-0 font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {order.productLocation ?? "—"}
          <span className="text-border mx-1">·</span>
          Qty {order.quantity}
        </p>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-medium">₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.className}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="h-6 bg-muted rounded-full w-24 shrink-0" />
    </div>
  );
}

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter((o) => o.status === "pending" || o.status === "shipped");
  const completed = orders.filter((o) => o.status === "delivered" || o.status === "returned");

  const totalSpend = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  // Calculate loyalty points: ₹100 spent = 100 points
  const totalPoints = Math.floor(totalSpend); // Every ₹1 = 1 point
  const redeemableValue = Math.floor(totalPoints / 20); // Every 20 points = ₹1 discount
  const remainingPoints = totalPoints % 20; // Points that can't be redeemed yet

  const STATS = [
    { label: "Total", value: orders.length.toString(), sub: "orders placed" },
    { label: "In Transit", value: active.length.toString(), sub: "in progress" },
    { label: "Delivered", value: completed.filter(o => o.status === "delivered").length.toString(), sub: "received" },
    { label: "Points", value: totalPoints.toLocaleString("en-IN"), sub: `₹${redeemableValue} discount available` },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
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
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight">My Orders</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-saffron" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              {stat.label}
            </p>
            <p className="font-display text-4xl tracking-tight">{loading ? "—" : stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Points Breakdown */}
      {!loading && totalPoints > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            Your Loyalty Points
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <p className="text-2xl font-bold text-primary">{totalPoints.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground">Total Points Earned</p>
              <p className="text-xs text-muted-foreground mt-1">From ₹{totalSpend.toLocaleString("en-IN")} spent</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <p className="text-2xl font-bold text-terracotta">{redeemableValue}</p>
              <p className="text-sm text-muted-foreground">Available Discount</p>
              <p className="text-xs text-muted-foreground mt-1">₹{redeemableValue} off next order</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border border-border">
              <p className="text-2xl font-bold text-saffron">{remainingPoints}</p>
              <p className="text-sm text-muted-foreground">Points Needed</p>
              <p className="text-xs text-muted-foreground mt-1">{20 - remainingPoints} more for ₹1 discount</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>How it works:</strong> ₹100 spent = 100 points • 20 points = ₹1 discount • Points are earned on delivered orders
            </p>
          </div>
        </div>
      )}

      {/* Active orders */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            In Transit
          </h2>
          {!loading && <span className="text-xs text-muted-foreground">{active.length} orders</span>}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border px-4 sm:px-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : active.length > 0 ? (
          <div className="rounded-2xl border border-border px-4 sm:px-6">
            {active.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">No active orders.</p>
            <Link href="/marketplace" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
              Browse marketplace
            </Link>
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Order History
          </h2>
          {!loading && <span className="text-xs text-muted-foreground">{completed.length} orders</span>}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border px-4 sm:px-6">
            {Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : completed.length > 0 ? (
          <div className="rounded-2xl border border-border px-4 sm:px-6">
            {completed.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">No completed orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
