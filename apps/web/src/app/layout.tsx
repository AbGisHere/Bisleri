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
          </div>
        </Providers>
      </body>
    </html>
  );
}
