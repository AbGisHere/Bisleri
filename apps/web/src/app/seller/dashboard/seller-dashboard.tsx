"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Users, TrendingUp, Search } from "lucide-react";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import TruckElectricIcon from "@/components/ui/truck-electric-icon";
import ScanBarcodeIcon from "@/components/ui/scan-barcode-icon";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";
import { CategoryPicker } from "@/components/ui/category-picker";
import { Input } from "@/components/ui/input";
import { LoadingIcon } from "@/components/ui/loading-icon";
import { useAiStream } from "@/lib/use-ai-stream";
import {
  cleanAiLines,
  extractDemandScore,
  getDemandColor,
  getDemandLabel,
  getMeterColor,
} from "@/lib/parse-ai";

export default function SellerDashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<{ products: number; activeOrders: number } | null>(null);
  const [demandProduct, setDemandProduct] = useState("");
  const [demandCategory, setDemandCategory] = useState("");
  const [demandScore, setDemandScore] = useState(0);
  const [insightLines, setInsightLines] = useState<string[]>([]);
  const stream = useAiStream("/api/ai/demand");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const analyzeDemand = useCallback(async () => {
    if (!demandProduct.trim()) return;
    setDemandScore(0);
    setInsightLines([]);

    const result = await stream.run({
      product_name: demandProduct.trim(),
      category: demandCategory || undefined,
      location: "India",
    });

    if (result) {
      const score = extractDemandScore(result);
      setDemandScore(score);
      setInsightLines(cleanAiLines(result).slice(0, 6));
    }
  }, [demandProduct, demandCategory, stream]);

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
    >
      <div className="mb-10">
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Quick Demand Check
        </h2>
        <div
          className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 space-y-5"
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Product name, e.g. Handwoven silk saree"
              value={demandProduct}
              onChange={(e) => setDemandProduct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && demandProduct.trim()) analyzeDemand();
              }}
              className="flex-1"
            />
            <button
              type="button"
              onClick={analyzeDemand}
              disabled={!demandProduct.trim() || stream.isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:translate-y-px disabled:opacity-40 transition-all shrink-0"
            >
              {stream.isLoading ? (
                <LoadingIcon size={14} className="text-primary-foreground" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              {stream.isLoading ? stream.status || "Analyzing…" : "Analyze"}
            </button>
          </div>

          <CategoryPicker value={demandCategory} onChange={setDemandCategory} size="sm" />

          {(demandScore > 0 || stream.isLoading) && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Demand Analysis</span>
              </div>

              <div className="relative">
                <div className="h-2.5 bg-cream dark:bg-clay rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getMeterColor(demandScore)}`}
                    style={{ width: `${demandScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1.5 px-0.5">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              {demandScore > 0 && !stream.isLoading && (
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold tabular-nums ${getDemandColor(demandScore)}`}>
                    {demandScore}
                  </span>
                  <span className={`text-sm font-medium ${getDemandColor(demandScore)}`}>
                    {getDemandLabel(demandScore)}
                  </span>
                </div>
              )}

              {insightLines.length > 0 && !stream.isLoading && (
                <div className="space-y-1.5">
                  {insightLines.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
