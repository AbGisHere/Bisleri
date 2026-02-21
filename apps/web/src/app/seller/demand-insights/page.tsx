"use client";

import { TrendingUp, Search, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIcon } from "@/components/ui/loading-icon";
import { CategoryPicker } from "@/components/ui/category-picker";
import { PageHeader } from "@/components/ui/page-header";
import { useAiStream } from "@/lib/use-ai-stream";
import {
  cleanAiLines,
  extractDemandScore,
  getDemandColor,
  getDemandLabel,
  getMeterColor,
} from "@/lib/parse-ai";
import { useLocale } from "@/lib/i18n";

export default function DemandInsightsPage() {
  const { t } = useLocale();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [analysisLines, setAnalysisLines] = useState<string[]>([]);
  const [demandScore, setDemandScore] = useState(0);
  const stream = useAiStream("/api/ai/demand");

  const handleAnalyze = async () => {
    if (!productName) {
      toast.error(t("toast.enterProductName"));
      return;
    }
    setAnalysisLines([]);
    setDemandScore(0);
    const result = await stream.run({
      product_name: productName,
      category: category || undefined,
      location: location || "India",
    });
    if (result) {
      setDemandScore(extractDemandScore(result));
      setAnalysisLines(cleanAiLines(result));
    }
  };

  const hasResults = demandScore > 0 && !stream.isLoading;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <PageHeader title={t("demand.title")} />

      {/* Form card */}
      <div
        className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 sm:p-8"
        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="space-y-5">
          {/* Product name + location row */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">{t("demand.productName")}</Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="product"
                  placeholder={t("demand.productPlaceholder")}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && productName.trim()) handleAnalyze();
                  }}
                  className="h-12 rounded-xl pl-10 pr-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">{t("demand.location")}</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="location"
                  placeholder={t("demand.locationPlaceholder")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-xl pl-10 pr-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("demand.category")}</Label>
            <CategoryPicker value={category} onChange={setCategory} size="sm" />
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={stream.isLoading || !productName.trim()}
            className="w-full sm:w-auto h-11 px-8 rounded-full backdrop-blur-xl bg-primary/90 border border-white/10 text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)" }}
          >
            {stream.isLoading ? (
              <LoadingIcon size={14} className="text-primary-foreground" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {stream.isLoading ? (stream.status || t("demand.analyzing")) : t("demand.analyzeDemand")}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {stream.isLoading && (
        <div
          className="mt-6 rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-10 flex flex-col items-center gap-3"
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <LoadingIcon size={24} className="text-primary" />
          <p className="text-sm text-muted-foreground">{stream.status || t("demand.analyzing")}</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="mt-6 space-y-4">
          {/* Score card */}
          <div
            className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 sm:p-8"
            style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                {t("demand.demandScore")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Score number */}
              <div className="shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className={`font-display text-6xl tracking-tight tabular-nums ${getDemandColor(demandScore)}`}>
                    {demandScore}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <span className={`text-sm font-medium ${getDemandColor(demandScore)}`}>
                  {getDemandLabel(demandScore)}
                </span>
              </div>

              {/* Meter bar */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="h-3 bg-cream dark:bg-clay rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getMeterColor(demandScore)}`}
                    style={{ width: `${demandScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1.5 px-0.5">
                  <span>{t("demand.low")}</span>
                  <span>{t("demand.moderate")}</span>
                  <span>{t("demand.high")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis breakdown */}
          {analysisLines.length > 0 && (
            <div
              className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 sm:p-8"
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                {t("demand.analysis")}
              </p>
              <div className="space-y-2.5">
                {analysisLines.map((line, i) => (
                  <p key={i} className="text-sm text-foreground/90 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
