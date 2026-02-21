"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
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
      desc: "Research products & pricing",
      tag: "Explore",
      color: "primary",
      href: "/marketplace",
    },
    {
      icon: TruckElectricIcon,
      title: "Logistics",
      desc: "Shipping & delivery",
      tag: stats ? `${stats.activeOrders} active` : "…",
      color: "primary",
      href: "/seller/logistics",
    },
    {
      icon: Users,
      title: "NGO Connect",
      desc: "Browse workshops & skill programs",
      tag: "Explore",
      color: "accent",
      href: "/seller/ngos" as Route,
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
