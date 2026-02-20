import Link from "next/link";
import {
  ArrowRight,
  Store,
  Truck,
  Users,
  Brain,
  TrendingUp,
} from "lucide-react";

export default function Page() {
  return (
    <>
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-primary/70 mb-8">
            Rural Women&apos;s Marketplace
          </p>

          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] font-bold tracking-tight max-w-5xl">
            She makes it.
            <br />
            <span className="text-primary italic">The world buys it.</span>
          </h1>

          <p className="mt-10 sm:mt-14 text-lg sm:text-xl text-muted-foreground max-w-md leading-relaxed">
            List products, connect with SHGs, and let AI handle pricing
            and demand — so you can focus on what you do best.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 mt-8 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Start selling
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="border-y border-border/60 py-5 overflow-hidden">
        <div className="marquee-track flex">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-set flex shrink-0" aria-hidden={copy === 1}>
              {[
                "Micromarketplace",
                "AI-Powered Pricing",
                "SHG Skills Network",
                "Demand Prediction",
                "Logistics & Delivery",
                "Community Support",
                "Order Tracking",
                "Smart Insights",
              ].map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-3 px-8 text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Built around five pillars
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Everything a rural woman entrepreneur needs, from her first listing
              to scaling a real business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Store,
                title: "Micromarketplace",
                desc: "Upload a photo, AI writes the description, suggests a price, and shows demand. List in minutes, not hours.",
              },
              {
                icon: Truck,
                title: "Logistics",
                desc: "Village-to-doorstep delivery. Track every package, manage returns, handle payouts — all in one place.",
              },
              {
                icon: Users,
                title: "SHG Skills Network",
                desc: "Find SHGs near you. Apply for training. Get workshop schedules and a one-point contact to your group.",
              },
              {
                icon: Brain,
                title: "AI Pricing",
                desc: "Machine learning analyzes market trends, competitor pricing, and regional demand to suggest optimal prices.",
              },
              {
                icon: TrendingUp,
                title: "Demand Prediction",
                desc: "Know what\u2019s trending before others. Seasonal forecasts and regional heatmaps for smarter decisions.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-border/60 bg-card p-7 ${
                  i >= 3 ? "sm:col-span-1" : ""
                } ${i === 4 ? "lg:col-span-1 sm:col-span-2 lg:col-auto" : ""}`}
              >
                <item.icon className="w-6 h-6 text-primary mb-5" />
                <h3 className="font-display text-lg font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-24 border-t border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Four steps. That&apos;s it.
            </h2>
            <p className="text-muted-foreground max-w-sm">
              From sign-up to your first sale, the entire journey is guided.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 rounded-2xl overflow-hidden">
            {[
              { n: "01", title: "Sign Up", desc: "Name, location, skills. Done." },
              {
                n: "02",
                title: "Choose Path",
                desc: "Learn through SHGs or sell directly.",
              },
              {
                n: "03",
                title: "List Products",
                desc: "Photo in, AI does the rest.",
              },
              {
                n: "04",
                title: "Earn & Grow",
                desc: "Orders flow in, payouts go out.",
              },
            ].map((step) => (
              <div key={step.n} className="bg-card p-8">
                <span className="font-display text-4xl font-bold text-primary/20 block mb-6">
                  {step.n}
                </span>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-32 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Your hands create.
            <br />
            We handle the rest.
          </h2>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-primary-foreground text-primary font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Join Bisleri
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">
            Bisleri
          </span>
          <span>Empowering rural women across India</span>
        </div>
      </footer>

    </>
  );
}
