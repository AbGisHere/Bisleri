"use client";

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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      <PageHeader title="AI Pricing" />

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product" className="text-sm font-medium">Product name</Label>
            <Input
              id="product"
              placeholder="e.g., Handwoven Cotton Basket"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <CategoryPicker value={category} onChange={setCategory} size="sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location (optional)</Label>
            <Input
              id="location"
              placeholder="Village, District, or State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 rounded-xl px-4 bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={stream.isLoading}
            className="w-full h-12 rounded-full backdrop-blur-xl bg-primary/90 border border-white/10 text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)' }}
          >
            {stream.isLoading && <LoadingIcon size={16} />}
            {stream.isLoading ? (stream.status || "Analyzing...") : "Analyze Pricing"}
          </button>
        </div>

        <div className="space-y-6">
          {suggestedPrice && !stream.isLoading && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                Suggested Price
              </p>
              <p className="font-display text-5xl tracking-tight text-primary">{suggestedPrice}</p>
            </div>
          )}

          {stream.isLoading && (
            <div className="rounded-2xl border border-border p-8 flex flex-col items-center gap-3">
              <LoadingIcon size={24} className="text-primary" />
              <p className="text-sm text-muted-foreground">{stream.status || "Analyzing..."}</p>
            </div>
          )}

          {analysisLines.length > 0 && !stream.isLoading && (
            <div className="rounded-2xl border border-border p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                Market Analysis
              </p>
              <div className="space-y-2">
                {analysisLines.map((line, i) => (
                  <p key={i} className="text-sm text-foreground/90 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}

          {analysisLines.length === 0 && !stream.isLoading && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Enter a product name and run the analysis to get AI-powered pricing recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
