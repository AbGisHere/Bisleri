"use client";

import Link from "next/link";
import {
  ArrowRight,
  Users,
} from "lucide-react";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import ChartLineIcon from "@/components/ui/chart-line-icon";
import TruckElectricIcon from "@/components/ui/truck-electric-icon";
import ScanBarcodeIcon from "@/components/ui/scan-barcode-icon";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const FEATURES = [
  {
    icon: ScanBarcodeIcon,
    title: "Micromarketplace",
    desc: "Upload a photo, AI writes the description, suggests a price, and shows demand. List in minutes, not hours.",
  },
  {
    icon: TruckElectricIcon,
    title: "Logistics",
    desc: "Village-to-doorstep delivery. Track every package, manage returns, handle payouts \u2014 all in one place.",
  },
  {
    icon: Users,
    title: "SHG Skills Network",
    desc: "Find SHGs near you. Apply for training. Get workshop schedules and a one-point contact to your group.",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI Pricing",
    desc: "Machine learning analyzes market trends, competitor pricing, and regional demand to suggest optimal prices.",
  },
  {
    icon: ChartLineIcon,
    title: "Demand Prediction",
    desc: "Know what\u2019s trending before others. Seasonal forecasts and regional heatmaps for smarter decisions.",
  },
];

const STEPS = [
  { n: "01", title: "Sign Up", desc: "Name, location, skills. Done." },
  { n: "02", title: "Choose Path", desc: "Learn through SHGs or sell directly." },
  { n: "03", title: "List Products", desc: "Photo in, AI does the rest." },
  { n: "04", title: "Earn & Grow", desc: "Orders flow in, payouts go out." },
];

function WovenThread({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 30 Q25 5, 50 30 T100 30 T150 30 T200 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M0 35 Q25 55, 50 35 T100 35 T150 35 T200 35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.15"
      />
      <path
        d="M0 25 Q25 0, 50 25 T100 25 T150 25 T200 25"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.12"
      />
    </svg>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: typeof Users | typeof BrainCircuitIcon | typeof ChartLineIcon | typeof TruckElectricIcon | typeof ScanBarcodeIcon;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const iconRef = useRef<any>(null);

  const handleMouseEnter = () => {
    if ((Icon === BrainCircuitIcon || Icon === ChartLineIcon || Icon === TruckElectricIcon || Icon === ScanBarcodeIcon) && iconRef.current) {
      iconRef.current.startAnimation();
    }
  };

  const handleMouseLeave = () => {
    if ((Icon === BrainCircuitIcon || Icon === ChartLineIcon || Icon === TruckElectricIcon || Icon === ScanBarcodeIcon) && iconRef.current) {
      iconRef.current.stopAnimation();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-md hover:shadow-primary/5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-colors group-hover:bg-primary/15">
        {Icon === BrainCircuitIcon ? (
          <BrainCircuitIcon ref={iconRef} size={20} className="text-primary" />
        ) : Icon === ChartLineIcon ? (
          <ChartLineIcon ref={iconRef} size={20} className="text-primary" />
        ) : Icon === TruckElectricIcon ? (
          <TruckElectricIcon ref={iconRef} size={20} className="text-primary" />
        ) : Icon === ScanBarcodeIcon ? (
          <ScanBarcodeIcon ref={iconRef} size={20} className="text-primary" />
        ) : (
          <Icon className="w-5 h-5 text-primary" />
        )}
      </div>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StepItem({
  n,
  title,
  desc,
  index,
  isLast,
}: {
  n: string;
  title: string;
  desc: string;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      className="flex gap-6"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
          <span className="font-display text-sm font-bold text-primary">{n}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-2" />}
      </div>
      <div className={isLast ? "pb-0" : "pb-10"}>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Page() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 pb-20 sm:pb-28 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        <WovenThread className="absolute top-16 right-0 w-64 sm:w-96 text-primary hidden sm:block" />

        <div className="max-w-6xl mx-auto relative">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm font-medium tracking-[0.2em] uppercase text-primary/70 mb-8"
          >
            Rural Women&apos;s Marketplace
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] font-bold tracking-tight max-w-5xl"
          >
            She makes it.
            <br />
            <span className="text-primary">The world buys it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 sm:mt-14 text-lg sm:text-xl text-muted-foreground max-w-md leading-relaxed"
          >
            List products, connect with SHGs, and let AI handle pricing
            and demand — so you can focus on what you do best.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Link
              href="/login"
              className="group/btn inline-flex items-center gap-3 mt-8 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Start selling
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {[
            "12 states across India",
            "AI-powered pricing",
            "Village-to-doorstep delivery",
          ].map((stat) => (
            <span key={stat} className="flex items-center gap-2.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              {stat}
            </span>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" ref={featuresRef}>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl sm:text-4xl font-bold"
            >
              Built around five pillars
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-muted-foreground max-w-lg mx-auto"
            >
              Everything a rural woman entrepreneur needs, from her first listing
              to scaling a real business.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((item, i) => (
              <FeatureCard key={item.title} index={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Four steps. That&apos;s it.
            </h2>
            <p className="text-muted-foreground max-w-sm">
              From sign-up to your first sale, the entire journey is guided.
            </p>
          </div>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <StepItem key={step.n} index={i} {...step} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-32 bg-primary text-primary-foreground dark:bg-card dark:text-foreground dark:border-y dark:border-border relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-foreground/[0.04] dark:bg-primary/[0.06]" />
          <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-primary-foreground/[0.03] dark:bg-primary/[0.04]" />
          <WovenThread className="absolute bottom-8 left-0 w-full text-primary-foreground/80 dark:text-primary/40" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Your hands create.
            <br />
            We handle the rest.
          </h2>
          <div className="mt-10">
            <Link
              href="/login"
              className="group/cta inline-flex items-center gap-3 px-10 py-4 rounded-full bg-primary-foreground text-primary dark:bg-primary dark:text-primary-foreground font-bold text-lg hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Join Rangaayan
              <ArrowRight className="w-5 h-5 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
