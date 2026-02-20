"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import type { Route } from "next";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";
import { getWishlist } from "@/app/buyer/wishlist/page";

export default function BuyerDashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<{ orders: number } | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    setWishlistCount(getWishlist().length);
  }, []);

  const workspaceItems: WorkspaceItem[] = [
    {
      icon: ShoppingCartIcon,
      title: "My Orders",
      desc: "Track your purchases",
      tag: stats ? `${stats.orders} orders` : "…",
      color: "primary",
      href: "/buyer/orders",
    },
    {
      icon: ScanHeartIcon,
      title: "Wishlist",
      desc: "Saved products",
      tag: `${wishlistCount} saved`,
      color: "accent",
      href: "/buyer/wishlist",
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
      workspaceItems={workspaceItems}
      emptyActivityMessage="No activity yet. Browse the marketplace to get started."
    />
  );
}
