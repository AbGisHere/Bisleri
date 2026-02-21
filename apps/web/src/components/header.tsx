"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { useTheme } from "next-themes";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { theme } = useTheme();
  const mobileNavRef = useRef<HTMLElement>(null);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobileMenu();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  const [cartCount, setCartCount] = useState(0);
  const role = session?.user?.role || "seller";
  const isBuyerRoute = pathname.startsWith("/buyer");
  const showCart = role === "buyer" || isBuyerRoute;

  useEffect(() => {
    if (!showCart || !session) return;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCartCount(d.cart ?? 0))
      .catch(() => {});
  }, [showCart, session]);

  const dashboardHref =
    !session
      ? "/dashboard"
      : role === "buyer"
        ? "/buyer/dashboard"
        : role === "ngo"
          ? "/ngo/dashboard"
          : "/seller/dashboard";

  const links: { to: Route; label: string }[] = [
    { to: "/" as Route, label: "Home" },
    { to: dashboardHref as Route, label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src={theme === "dark" ? "/rangaayan-logo-dark.svg" : "/rangaayan-logo-light.svg"} 
                alt="Rangaayan" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="text-primary">R</span>angaayan
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => {
              const active =
                to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(to);
              return (
                <Link
                  key={label}
                  href={to}
                  className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl border transition-all duration-200 ${
                    active
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted/40 hover:border-border/30 hover:text-foreground"
                  }`}
                  style={{
                    boxShadow: active
                      ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 4px rgba(0,0,0,0.06)'
                      : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {showCart && (
              <Link
                href="/buyer/cart"
                className="relative w-10 h-10 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:bg-primary/15 hover:border-primary/30"
                title="Cart"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}
            <ModeToggle />
            <UserMenu />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden w-10 h-10 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:bg-primary/15 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.06)' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-nav"
            ref={mobileNavRef}
            role="navigation"
            aria-label="Mobile navigation"
            className="md:hidden pb-4 flex flex-col gap-1"
          >
            {links.map(({ to, label }) => {
              const active =
                to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(to);
              return (
                <Link
                  key={label}
                  href={to}
                  onClick={closeMobileMenu}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium backdrop-blur-xl border transition-all duration-200 ${
                    active
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted/40 hover:border-border/30 hover:text-foreground"
                  }`}
                  style={{
                    boxShadow: active
                      ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 4px rgba(0,0,0,0.06)'
                      : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
