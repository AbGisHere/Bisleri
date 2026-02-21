"use client";

import { CATEGORIES } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";

const CATEGORY_I18N: Record<string, string> = {
  Weaving: "category.weaving",
  Pottery: "category.pottery",
  Embroidery: "category.embroidery",
  Food: "category.food",
  Jewellery: "category.jewellery",
  Painting: "category.painting",
  "Basket Weaving": "category.basketWeaving",
  Tailoring: "category.tailoring",
};

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
  size?: "sm" | "md";
}

export function CategoryPicker({ value, onChange, size = "md" }: CategoryPickerProps) {
  const { t } = useLocale();
  const sizeClasses = size === "sm"
    ? "px-3 py-1.5 text-xs"
    : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(value === cat ? "" : cat)}
          className={`${sizeClasses} rounded-full font-medium border backdrop-blur-xl transition-all duration-200 ${
            value === cat
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-primary/15 bg-primary/5 text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
          }`}
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }}
        >
          {t(CATEGORY_I18N[cat] ?? cat)}
        </button>
      ))}
    </div>
  );
}
