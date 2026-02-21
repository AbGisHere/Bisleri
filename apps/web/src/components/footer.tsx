"use client";

import { useLocale } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-10 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-brand text-lg font-semibold tracking-[-0.01em] text-foreground">
              <span className="text-primary">R</span>angaayan
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t("footer.about")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("footer.contact")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("footer.help")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
