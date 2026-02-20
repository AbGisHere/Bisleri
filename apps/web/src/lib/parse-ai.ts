export function cleanAiText(raw: string): string {
  return raw
    .replace(/^---+$/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/^based on my research.*?[.:]\s*/im, "")
    .replace(/^here is .*?[.:]\s*/im, "")
    .trim();
}

export function cleanAiLines(raw: string): string[] {
  return cleanAiText(raw)
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

export function extractPrice(raw: string): string | null {
  const suggested = raw.match(/SUGGESTED_PRICE:\s*₹\s*([\d,]+)/i);
  if (suggested) return `₹${suggested[1]}`;
  const first = raw.match(/₹\s*([\d,]+)/);
  return first ? `₹${first[1]}` : null;
}

export function extractDemandScore(raw: string): number {
  const explicit = raw.match(/DEMAND_SCORE:\s*(\d{1,3})\s*\/\s*100/i);
  if (explicit) return Math.min(100, Math.max(0, parseInt(explicit[1])));

  const generic = raw.match(/(\d{1,3})\s*\/\s*100/);
  if (generic) return Math.min(100, Math.max(0, parseInt(generic[1])));

  const lower = raw.toLowerCase();
  if (lower.includes("very high demand") || lower.includes("very_high")) return 85;
  if (lower.includes("high demand") || lower.includes("strong demand")) return 72;
  if (lower.includes("moderate demand") || lower.includes("medium demand")) return 50;
  if (lower.includes("low demand") || lower.includes("weak demand")) return 25;
  return 50;
}

export function getDemandColor(score: number): string {
  if (score >= 70) return "text-forest dark:text-forest-light";
  if (score >= 40) return "text-foreground";
  return "text-terracotta dark:text-terracotta-light";
}

export function getDemandLabel(score: number): string {
  if (score >= 70) return "High Demand";
  if (score >= 40) return "Moderate";
  if (score > 0) return "Low Demand";
  return "";
}

export function getMeterColor(score: number): string {
  if (score >= 70) return "bg-forest";
  if (score >= 40) return "bg-saffron";
  return "bg-terracotta";
}
