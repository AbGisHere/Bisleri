"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { LoadingIcon } from "./loading-icon";

interface DemandMeterProps {
  productName?: string;
  description?: string;
  price?: string;
  onDemandChange?: (demandScore: number) => void;
}

export function DemandMeter({ 
  productName, 
  description, 
  price, 
  onDemandChange 
}: DemandMeterProps) {
  const [demandScore, setDemandScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate AI demand analysis based on product details
  const analyzeDemand = async () => {
    if (!productName || !description || !price) {
      setDemandScore(0);
      onDemandChange?.(0);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple algorithm to simulate demand analysis
    // In real implementation, this would call your AI service
    let score = 50; // Base score
    
    // Price factor (lower price = higher demand for rural products)
    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    if (priceNum < 100) score += 20;
    else if (priceNum < 500) score += 10;
    else if (priceNum > 1000) score -= 15;
    
    // Description length factor (detailed descriptions suggest quality)
    if (description.length > 100) score += 10;
    else if (description.length < 20) score -= 10;
    
    // Keywords that suggest high demand
    const highDemandKeywords = ['handmade', 'organic', 'natural', 'traditional', 'authentic', 'local'];
    const foundKeywords = highDemandKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword) || 
      productName.toLowerCase().includes(keyword)
    );
    score += foundKeywords.length * 8;
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    // Add some randomness to simulate AI variance
    score = Math.round(score + (Math.random() * 10 - 5));
    score = Math.max(0, Math.min(100, score));
    
    setDemandScore(score);
    onDemandChange?.(score);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    analyzeDemand();
  }, [productName, description, price]);

  const getDemandColor = (score: number) => {
    if (score >= 70) return "text-forest dark:text-forest-light";
    if (score >= 40) return "text-foreground";
    return "text-terracotta dark:text-terracotta-light";
  };

  const getDemandLabel = (score: number) => {
    if (score >= 70) return "High Demand";
    if (score >= 40) return "Medium Demand";
    return "Low Demand";
  };

  const getMeterColor = (score: number) => {
    if (score >= 70) return "bg-forest";
    if (score >= 40) return "bg-muted";
    return "bg-terracotta";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Demand Analysis</span>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoadingIcon size={12} className="text-terracotta dark:text-foreground" />
            Analyzing...
          </div>
        )}
      </div>
      
      {/* Demand Meter */}
      <div className="relative">
        <div className="h-2 bg-cream dark:bg-clay rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getMeterColor(demandScore)}`}
            style={{ width: `${demandScore}%` }}
          />
        </div>
        
        {/* Scale markers */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
      
      {/* Demand Score and Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getDemandColor(demandScore)}`}>
            {demandScore}
          </span>
          <span className={`text-sm font-medium ${getDemandColor(demandScore)}`}>
            {getDemandLabel(demandScore)}
          </span>
        </div>
        
        {!isAnalyzing && (productName || description || price) && (
          <button
            onClick={analyzeDemand}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        )}
      </div>
      
      {/* Insight Message */}
      {!isAnalyzing && demandScore > 0 && (
        <div className="text-xs text-muted-foreground">
          {demandScore >= 70 && "This product shows strong market potential based on current trends."}
          {demandScore >= 40 && demandScore < 70 && "This product has moderate market demand."}
          {demandScore < 40 && "Consider adjusting price or description to improve demand."}
        </div>
      )}
    </div>
  );
}
