"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import type { Route } from "next";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

export default function BuyerDashboard({ session }: { session: Session }) {
  const { t } = useLocale();
  const [stats, setStats] = useState<{ orders: number; wishlist: number; cart: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const workspaceItems: WorkspaceItem[] = [
    {
      icon: ShoppingCartIcon,
      title: t("buyer.myOrders"),
      desc: t("buyer.myOrdersDesc"),
      tag: stats ? `${stats.orders} ${t("buyer.orders")}` : "…",
      color: "primary",
      href: "/buyer/orders",
    },
    {
      icon: ScanHeartIcon,
      title: t("buyer.wishlist"),
      desc: t("buyer.wishlistDesc"),
      tag: stats ? `${stats.wishlist} ${t("buyer.saved")}` : "…",
      color: "accent",
      href: "/buyer/wishlist",
    },
    {
      icon: Store,
      title: t("buyer.marketplace"),
      desc: t("buyer.marketplaceDesc"),
      tag: t("seller.explore"),
      color: "primary",
      href: "/marketplace",
    },
  ];

  return (
    <DashboardLayout
      session={session}
      accentColor="bg-saffron"
      cta={{
        icon: Store,
        title: t("buyer.browseProducts"),
        desc: t("buyer.browseProductsDesc"),
        href: "/marketplace" as Route,
      }}
      workspaceItems={workspaceItems}
      emptyActivityMessage={t("buyer.emptyActivity")}
    />
  );
}
