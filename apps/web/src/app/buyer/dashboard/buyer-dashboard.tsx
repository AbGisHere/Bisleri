"use client";

import { useState } from "react";
import {
  Store,
  Heart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import ShoppingCartIcon from "@/components/ui/shopping-cart-icon";
import ScanHeartIcon from "@/components/ui/scan-heart-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function BuyerDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isChartHovered, setIsChartHovered] = useState(false);
  const firstName = session.user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <div className="pb-10 border-b border-border/50 mb-10">
        <p className="text-sm text-muted-foreground mb-1">{greeting}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold">
          {firstName}
        </h1>
      </div>

      {/* Browse CTA */}
      <Link
        href="#"
        className="group flex items-center justify-between p-6 sm:p-8 rounded-3xl bg-primary text-primary-foreground mb-10 hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xl font-semibold">Browse Products</div>
            <div className="text-primary-foreground/65 text-sm mt-0.5">
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
          {[
            {
              icon: ShoppingCartIcon,
              title: "My Orders",
              desc: "Track your purchases",
              tag: "0 orders",
              color: "text-terracotta bg-terracotta-light",
              isCart: true,
            },
            {
              icon: Heart,
              title: "Wishlist",
              desc: "Saved products",
              tag: "0 saved",
              color: "text-clay bg-saffron-light",
              isHeart: true,
            },
            {
              icon: Store,
              title: "Marketplace",
              desc: "Browse all products",
              tag: "Explore",
              color: "text-terracotta bg-terracotta-light",
            },
            {
              icon: TrendingUp,
              title: "Demand Insights",
              desc: "Trends & forecasts",
              tag: "Ready",
              color: "text-forest bg-forest-light",
              isChart: true,
            },
          ].map((mod) => (
            <Link
              key={mod.title}
              href="#"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all"
              onMouseEnter={() => {
                if (mod.isCart) setIsCartHovered(true);
                if (mod.isHeart) setIsHeartHovered(true);
                if (mod.isChart) setIsChartHovered(true);
              }}
              onMouseLeave={() => {
                if (mod.isCart) setIsCartHovered(false);
                if (mod.isHeart) setIsHeartHovered(false);
                if (mod.isChart) setIsChartHovered(false);
              }}
            >
              <div
                className={`w-11 h-11 rounded-xl ${mod.color} flex items-center justify-center shrink-0`}
              >
                {mod.isCart ? (
                  <ShoppingCartIcon hovered={isCartHovered} className="w-5 h-5" />
                ) : mod.isHeart ? (
                  <ScanHeartIcon hovered={isHeartHovered} className="w-5 h-5" />
                ) : mod.isChart ? (
                  <ChartLineIcon hovered={isChartHovered} className="w-5 h-5" />
                ) : (
                  <mod.icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{mod.title}</div>
                <div className="text-xs text-muted-foreground">{mod.desc}</div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {mod.tag}
              </span>
            </Link>
          ))}
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
