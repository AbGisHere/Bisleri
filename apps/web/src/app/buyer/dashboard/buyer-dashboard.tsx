"use client";

import { Store } from "lucide-react";
import type { Route } from "next";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: ShoppingCartIcon,
    title: "My Orders",
    desc: "Track your purchases",
    tag: "0 orders",
    color: "primary",
  },
  {
    icon: ScanHeartIcon,
    title: "Wishlist",
    desc: "Saved products",
    tag: "0 saved",
    color: "accent",
  },
  {
    icon: Store,
    title: "Marketplace",
    desc: "Browse all products",
    tag: "Explore",
    color: "primary",
    href: "/marketplace",
  },
  {
    icon: ChartLineIcon,
    title: "Demand Insights",
    desc: "Trends & forecasts",
    tag: "Ready",
    color: "accent",
  },
];

export default function BuyerDashboard({ session }: { session: Session }) {
  return (
    <DashboardLayout
      session={session}
      accentColor="bg-saffron"
      cta={{
        icon: Store,
        title: "Browse Products",
        desc: "Discover products from rural artisans and SHGs",
        href: "/marketplace" as Route,
      }}
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. Browse the marketplace to get started."
    />
  );
}
