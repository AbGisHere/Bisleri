"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import TruckElectricIcon from "@/components/ui/truck-electric-icon";
import ScanBarcodeIcon from "@/components/ui/scan-barcode-icon";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

export default function SellerDashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<{ products: number; activeOrders: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const workspaceItems: WorkspaceItem[] = [
    {
      icon: ScanBarcodeIcon,
      title: "Marketplace",
      desc: "Products, orders, payouts",
      tag: stats ? `${stats.products} listed` : "…",
      color: "primary",
      href: "/marketplace",
    },
    {
      icon: BrainCircuitIcon,
      title: "AI Pricing",
      desc: "Smart price suggestions",
      tag: "Ready",
      color: "primary",
      href: "/seller/ai-pricing",
    },
    {
      icon: ChartLineIcon,
      title: "Demand Insights",
      desc: "Trends & forecasts",
      tag: "Ready",
      color: "primary",
      href: "/seller/demand-insights",
    },
    {
      icon: TruckElectricIcon,
      title: "Logistics",
      desc: "Shipping & delivery",
      tag: stats ? `${stats.activeOrders} active` : "…",
      color: "primary",
      href: "/seller/logistics",
    },
  ];

  return (
    <DashboardLayout
      session={session}
      accentColor="bg-terracotta"
      cta={{
        icon: Plus,
        title: "List a new product",
        desc: "Upload a photo and let AI do the rest",
        href: "/seller/add-product" as Route,
      }}
      workspaceItems={workspaceItems}
      emptyActivityMessage="No activity yet. List your first product to get started."
    />
  );
}
