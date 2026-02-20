"use client";

import { Store, Truck, Brain, TrendingUp, Plus } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: Store,
    title: "Marketplace",
    desc: "Products, orders, payouts",
    tag: "0 listed",
    color: "primary",
  },
  {
    icon: Brain,
    title: "AI Pricing",
    desc: "Smart price suggestions",
    tag: "Ready",
    color: "primary",
  },
  {
    icon: TrendingUp,
    title: "Demand Insights",
    desc: "Trends & forecasts",
    tag: "Ready",
    color: "accent",
  },
  {
    icon: Truck,
    title: "Logistics",
    desc: "Shipping & delivery",
    tag: "0 active",
    color: "accent",
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
        href: "#" as Route,
      }}
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. List your first product to get started."
    />
  );
}
