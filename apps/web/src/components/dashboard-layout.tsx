"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { Session } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import TruckElectricIcon from "@/components/ui/truck-electric-icon";
import ScanBarcodeIcon from "@/components/ui/scan-barcode-icon";

export interface WorkspaceItem {
  icon: LucideIcon | ((props: { className?: string }) => ReactNode);
  title: string;
  desc: string;
  tag: string;
  color: "primary" | "accent";
  href?: Route;
}

interface DashboardCTA {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: Route;
}

interface DashboardLayoutProps {
  session: Session;
  accentColor: string;
  cta: DashboardCTA;
  workspaceItems: WorkspaceItem[];
  emptyActivityMessage: string;
  children?: ReactNode;
}

export default function DashboardLayout({
  session,
  accentColor,
  cta,
  workspaceItems,
  emptyActivityMessage,
  children,
}: DashboardLayoutProps) {
  const firstName = (session.user.name || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const iconRefs = useRef<{ [key: string]: any }>({});

  const handleMouseEnter = (title: string) => {
    const iconRef = iconRefs.current[title];
    if (iconRef) {
      iconRef.startAnimation();
    }
  };

  const handleMouseLeave = (title: string) => {
    const iconRef = iconRefs.current[title];
    if (iconRef) {
      iconRef.stopAnimation();
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="text-muted-foreground text-base sm:text-lg font-light">
          {greeting},
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight mt-0.5 text-foreground">
          {firstName}.
        </h1>
        <div className={`mt-5 h-[3px] w-10 rounded-full ${accentColor}`} />
      </div>

      <Link
        href={cta.href}
        className="group flex items-center justify-between p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-primary/80 border border-white/15 text-primary-foreground mb-10 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 transition-all duration-200"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <cta.icon className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xl font-semibold">{cta.title}</div>
            <div className="text-primary-foreground/70 text-sm mt-0.5">
              {cta.desc}
            </div>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>

      <div className="mb-10">
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Your Workspace
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {workspaceItems.map((mod) => (
            <Link
              key={mod.title}
              href={(mod.href ?? "#") as Route}
              className="group flex items-center gap-4 p-5 rounded-2xl backdrop-blur-xl bg-background/40 border border-border/60 hover:border-primary/30 hover:-translate-y-0.5 hover:bg-background/60 active:translate-y-0 transition-all duration-200"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)' }}
              onMouseEnter={() => handleMouseEnter(mod.title)}
              onMouseLeave={() => handleMouseLeave(mod.title)}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  mod.color === "primary"
                    ? "text-primary bg-primary/10 dark:bg-primary/15"
                    : "text-accent-foreground bg-accent/10 dark:text-accent dark:bg-accent/15"
                }`}
              >
                {mod.icon === BrainCircuitIcon ? (
                  <BrainCircuitIcon 
                    ref={(ref) => {
                      if (ref) iconRefs.current[mod.title] = ref;
                    }}
                    size={20} 
                    className={mod.color === "primary" ? "text-primary" : "text-accent-foreground"} 
                  />
                ) : mod.icon === ChartLineIcon ? (
                  <ChartLineIcon 
                    ref={(ref) => {
                      if (ref) iconRefs.current[mod.title] = ref;
                    }}
                    size={20} 
                    className={mod.color === "primary" ? "text-primary" : "text-accent-foreground"} 
                  />
                ) : mod.icon === TruckElectricIcon ? (
                  <TruckElectricIcon 
                    ref={(ref) => {
                      if (ref) iconRefs.current[mod.title] = ref;
                    }}
                    size={20} 
                    className={mod.color === "primary" ? "text-primary" : "text-accent-foreground"} 
                  />
                ) : mod.icon === ScanBarcodeIcon ? (
                  <ScanBarcodeIcon 
                    ref={(ref) => {
                      if (ref) iconRefs.current[mod.title] = ref;
                    }}
                    size={20} 
                    className={mod.color === "primary" ? "text-primary" : "text-accent-foreground"} 
                  />
                ) : (
                  <mod.icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{mod.title}</div>
                <div className="text-xs text-muted-foreground">{mod.desc}</div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {mod.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {children}

      <div>
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Recent Activity
        </h2>
        <div className="rounded-2xl border border-border bg-muted/20 px-6 py-14 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">Nothing here yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {emptyActivityMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
