"use client";

import { ArrowLeft, MapPin, Package, CheckCircle2, Clock, Truck, RotateCcw, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ShipmentStatus = "pending" | "transit" | "out_for_delivery" | "delivered" | "returned";

interface Shipment {
  id: string;
  orderId: string;
  product: string;
  buyer: string;
  destination: string;
  status: ShipmentStatus;
  date: string;
  amount: number;
}

const ACTIVE: Shipment[] = [
  {
    id: "s1",
    orderId: "ORD-8821",
    product: "Handwoven Dhurrie Rug",
    buyer: "Ananya Sharma",
    destination: "Mumbai, Maharashtra",
    status: "transit",
    date: "Est. 22 Feb",
    amount: 2400,
  },
  {
    id: "s2",
    orderId: "ORD-8817",
    product: "Bamboo Storage Basket",
    buyer: "Rahul Mehta",
    destination: "Bengaluru, Karnataka",
    status: "out_for_delivery",
    date: "Today",
    amount: 180,
  },
  {
    id: "s3",
    orderId: "ORD-8810",
    product: "Block Print Kurta",
    buyer: "Priya Singh",
    destination: "Pune, Maharashtra",
    status: "pending",
    date: "Pickup tomorrow",
    amount: 850,
  },
];

const COMPLETED: Shipment[] = [
  {
    id: "s4",
    orderId: "ORD-8804",
    product: "Madhubani Wall Painting",
    buyer: "Vikram Nair",
    destination: "Delhi, NCR",
    status: "delivered",
    date: "17 Feb",
    amount: 1200,
  },
  {
    id: "s5",
    orderId: "ORD-8799",
    product: "Silver Filigree Earrings",
    buyer: "Kavya Reddy",
    destination: "Hyderabad, Telangana",
    status: "delivered",
    date: "14 Feb",
    amount: 680,
  },
  {
    id: "s6",
    orderId: "ORD-8791",
    product: "Terracotta Wind Chimes",
    buyer: "Arjun Patel",
    destination: "Ahmedabad, Gujarat",
    status: "returned",
    date: "10 Feb",
    amount: 340,
  },
];

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; icon: typeof Clock; className: string; dotColor: string }> = {
  pending: {
    label: "Pending pickup",
    icon: Circle,
    className: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground/40",
  },
  transit: {
    label: "In transit",
    icon: Truck,
    className: "bg-saffron/20 text-accent-foreground dark:bg-saffron/15 dark:text-saffron",
    dotColor: "bg-saffron",
  },
  out_for_delivery: {
    label: "Out for delivery",
    icon: Truck,
    className: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest",
    dotColor: "bg-forest",
  },
  returned: {
    label: "Returned",
    icon: RotateCcw,
    className: "bg-destructive/10 text-destructive",
    dotColor: "bg-destructive",
  },
};

function ShipmentRow({ shipment }: { shipment: Shipment }) {
  const cfg = STATUS_CONFIG[shipment.status];
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-xl bg-primary/8 dark:bg-primary/12 flex items-center justify-center shrink-0">
        <Package className="w-4.5 h-4.5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium truncate">{shipment.product}</p>
          <span className="text-xs text-muted-foreground shrink-0">{shipment.orderId}</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {shipment.destination}
          <span className="text-border mx-1">·</span>
          {shipment.buyer}
        </p>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-medium">₹{shipment.amount.toLocaleString("en-IN")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{shipment.date}</p>
      </div>

      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.className}`}>
        {cfg.label}
      </span>
    </div>
  );
}

const delivered = COMPLETED.filter((s) => s.status === "delivered").length;
const returned = COMPLETED.filter((s) => s.status === "returned").length;
const totalRevenue = COMPLETED.filter((s) => s.status === "delivered").reduce((acc, s) => acc + s.amount, 0);

const STATS = [
  { label: "Active", value: ACTIVE.length.toString(), sub: "in progress" },
  { label: "Delivered", value: delivered.toString(), sub: "this month" },
  { label: "Returned", value: returned.toString(), sub: "this month" },
  { label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "from deliveries" },
];

export default function LogisticsPage() {
  const router = useRouter();
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
          href="/seller/dashboard"
          className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight">Logistics</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-terracotta" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              {stat.label}
            </p>
            <p className="font-display text-4xl tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Active Shipments */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Active Shipments
          </h2>
          <span className="text-xs text-muted-foreground">{ACTIVE.length} orders</span>
        </div>

        {ACTIVE.length > 0 ? (
          <div className="rounded-2xl border border-border px-4 sm:px-6 divide-y-0">
            {ACTIVE.map((s) => (
              <ShipmentRow key={s.id} shipment={s} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">No active shipments.</p>
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Recent Activity
          </h2>
          <span className="text-xs text-muted-foreground">{COMPLETED.length} orders</span>
        </div>

        <div className="rounded-2xl border border-border px-4 sm:px-6 divide-y-0">
          {COMPLETED.map((s) => (
            <ShipmentRow key={s.id} shipment={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
