"use client";

import { Plus } from "lucide-react";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import TruckElectricIcon from "@/components/ui/truck-electric-icon";
import ScanBarcodeIcon from "@/components/ui/scan-barcode-icon";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: ScanBarcodeIcon,
    title: "Marketplace",
    desc: "Products, orders, payouts",
    tag: "0 listed",
    color: "primary",
    href: "/marketplace",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI Pricing",
    desc: "Smart price suggestions",
    tag: "Ready",
    color: "primary",
  },
  {
    icon: ChartLineIcon,
    title: "Demand Insights",
    desc: "Trends & forecasts",
    tag: "Ready",
    color: "primary",
  },
  {
    icon: TruckElectricIcon,
    title: "Logistics",
    desc: "Shipping & delivery",
    tag: "0 active",
    color: "primary",
    href: "/seller/logistics",
  },
];

export default function SellerDashboard({ session }: { session: Session }) {
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
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. List your first product to get started."
    />
  );
}
