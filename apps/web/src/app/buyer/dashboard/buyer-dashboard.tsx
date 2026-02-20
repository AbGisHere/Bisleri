"use client";

import {
  Store,
  ArrowRight,
} from "lucide-react";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import Link from "next/link";
import type { Session } from "@/lib/types";

export default function BuyerDashboard({
  session,
}: {
  session: Session;
}) {
  const firstName = (session.user.name || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="text-muted-foreground text-base sm:text-lg font-light">
          {greeting},
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight mt-0.5 text-foreground">
          {firstName}.
        </h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-saffron" />
      </div>

      {/* Browse CTA */}
      <Link
        href="#"
        className="group flex items-center justify-between p-6 sm:p-8 rounded-3xl bg-primary text-primary-foreground dark:bg-primary/10 dark:text-foreground dark:border dark:border-primary/25 mb-10 hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 dark:bg-primary/15 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xl font-semibold">Browse Products</div>
            <div className="text-primary-foreground/65 dark:text-muted-foreground text-sm mt-0.5">
              Discover products from rural artisans and SHGs
            </div>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>

      <div className="mb-10">
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Your Workspace
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="#"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl text-primary bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
              <ShoppingCartIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">My Orders</div>
              <div className="text-xs text-muted-foreground">Track your purchases</div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">0 orders</span>
          </Link>

          <Link
            href="#"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl text-accent-foreground bg-accent/10 dark:text-accent dark:bg-accent/15 flex items-center justify-center shrink-0">
              <ScanHeartIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Wishlist</div>
              <div className="text-xs text-muted-foreground">Saved products</div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">0 saved</span>
          </Link>

          <Link
            href="#"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl text-primary bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Marketplace</div>
              <div className="text-xs text-muted-foreground">Browse all products</div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">Explore</span>
          </Link>

          <Link
            href="#"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-xl text-accent-foreground bg-accent/10 dark:text-accent dark:bg-accent/15 flex items-center justify-center shrink-0">
              <ChartLineIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Demand Insights</div>
              <div className="text-xs text-muted-foreground">Trends & forecasts</div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">Ready</span>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Recent Activity
        </h2>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No activity yet. Browse the marketplace to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
