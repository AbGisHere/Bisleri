"use client";

import { useLocale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "hi" : "en")}
      className="w-9 h-9 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl flex items-center justify-center transition-all duration-200 relative cursor-pointer hover:bg-primary/15 hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 1px 3px rgba(0,0,0,0.06)' }}
      title={t("lang.toggle")}
    >
      <span className="text-xs font-bold text-foreground/70 select-none">
        {locale === "en" ? "हिं" : "EN"}
      </span>
    </button>
  );
}
