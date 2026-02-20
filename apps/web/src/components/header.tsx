"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
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

  const role = session?.user?.role || "seller";
  const dashboardHref =
    !session
      ? "/dashboard"
      : role === "buyer"
        ? "/buyer/dashboard"
        : role === "shg"
          ? "/shg/dashboard"
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
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Rangaayan
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
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
