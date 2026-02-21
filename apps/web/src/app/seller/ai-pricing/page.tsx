"use client";

import { Search, MapPin, Sparkles, IndianRupee } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIcon } from "@/components/ui/loading-icon";
import { CategoryPicker } from "@/components/ui/category-picker";
import { PageHeader } from "@/components/ui/page-header";
import { useAiStream } from "@/lib/use-ai-stream";
import { cleanAiLines, extractPrice } from "@/lib/parse-ai";

export default function AIPricingPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [analysisLines, setAnalysisLines] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const stream = useAiStream("/api/ai/pricing");

  const handleAnalyze = async () => {
    if (!productName) {
      toast.error("Enter a product name");
      return;
    }
    setAnalysisLines([]);
    setSuggestedPrice("");
    const result = await stream.run({
      product_name: productName,
      category: category || undefined,
      location: location || undefined,
    });
    if (result) {
      setAnalysisLines(cleanAiLines(result));
      setSuggestedPrice(extractPrice(result) || "");
    }
  };

  const hasResults = (suggestedPrice || analysisLines.length > 0) && !stream.isLoading;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <PageHeader title="AI Pricing" />

      {/* Form card */}
      <div
        className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 sm:p-8"
        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="space-y-5">
          {/* Product name + location row */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">Product name</Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="product"
                  placeholder="e.g., Handwoven Cotton Basket"
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
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="location"
                  placeholder="State or district"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-xl pl-10 pr-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
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
            {stream.isLoading ? (stream.status || "Analyzing…") : "Analyze Pricing"}
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
          <p className="text-sm text-muted-foreground">{stream.status || "Analyzing…"}</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="mt-6 space-y-4">
          {/* Price card */}
          {suggestedPrice && (
            <div
              className="rounded-2xl border border-primary/20 backdrop-blur-xl bg-primary/5 p-6 sm:p-8"
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Suggested Price
                </span>
              </div>
              <p className="font-display text-5xl sm:text-6xl tracking-tight text-primary">{suggestedPrice}</p>
            </div>
          )}

          {/* Analysis breakdown */}
          {analysisLines.length > 0 && (
            <div
              className="rounded-2xl border border-border backdrop-blur-xl bg-background/40 p-6 sm:p-8"
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                Market Analysis
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
