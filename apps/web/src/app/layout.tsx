import type { Metadata } from "next";

import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Bisleri - Rural Women's Marketplace",
  description:
    "Empowering rural women entrepreneurs through a micromarketplace, SHG networks, AI-powered pricing, and demand prediction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${dmSerif.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <div className="min-h-svh flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-border/50">
              <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-display font-semibold text-foreground">
                  Bisleri
                </span>
                <span>Empowering rural women across India</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
