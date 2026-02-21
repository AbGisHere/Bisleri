import type { Metadata } from "next";

import { Plus_Jakarta_Sans, DM_Serif_Display, Playfair_Display } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: "Rangaayan - Rural Women's Marketplace",
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
      className={`${jakarta.variable} ${dmSerif.variable} ${playfair.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <div className="min-h-svh flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="px-4 sm:px-6 lg:px-8 py-10 border-t border-border">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="font-brand text-lg font-semibold tracking-[-0.01em] text-foreground">
                      Rangaayan
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Empowering rural women entrepreneurs across India
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">About</a>
                    <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    <a href="#" className="hover:text-foreground transition-colors">Help</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
