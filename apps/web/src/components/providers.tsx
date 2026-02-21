"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { LocaleProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider>
        {children}
        <Toaster richColors />
      </LocaleProvider>
    </ThemeProvider>
  );
}
