"use client";

import { useState, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { LoadingIcon } from "./loading-icon";
import { toast } from "sonner";
import { useAiStream } from "@/lib/use-ai-stream";
import { useLocale } from "@/lib/i18n";
import {
  cleanAiLines,
  extractDemandScore,
  getDemandColor,
  getDemandLabel,
  getMeterColor,
} from "@/lib/parse-ai";

interface DemandMeterProps {
  productName?: string;
  onDemandChange?: (demandScore: number) => void;
}

export function DemandMeter({ productName, onDemandChange }: DemandMeterProps) {
  const { t } = useLocale();
  const [demandScore, setDemandScore] = useState(0);
  const [insightLines, setInsightLines] = useState<string[]>([]);
  const stream = useAiStream("/api/ai/demand");

  const analyzeDemand = useCallback(async () => {
    if (!productName) {
      toast.error(t("toast.enterProductNameFirst"));
      return;
    }

    const result = await stream.run({
      product_name: productName,
      location: "India",
    });

    if (result) {
      const score = extractDemandScore(result);
      setDemandScore(score);
      setInsightLines(cleanAiLines(result).slice(0, 6));
      onDemandChange?.(score);
    }
  }, [productName, stream, onDemandChange, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">{t("seller.demandAnalysis")}</span>
        </div>
        <button
          type="button"
          onClick={analyzeDemand}
          disabled={stream.isLoading}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
        >
          {stream.isLoading && <LoadingIcon size={12} className="text-terracotta dark:text-foreground" />}
          {stream.isLoading ? stream.status || t("seller.analyzing") : t("seller.analyze")}
        </button>
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
        <div className="space-y-1.5 pt-1">
          {insightLines.map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
