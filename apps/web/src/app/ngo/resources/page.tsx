"use client";

import { ArrowLeft, ExternalLink, FileText, BookOpen, Landmark, GraduationCap } from "lucide-react";
import Link from "next/link";

const RESOURCES = [
  {
    icon: Landmark,
    category: "Government Schemes",
    color: "text-primary bg-primary/10",
    items: [
      {
        title: "PM Vishwakarma Scheme",
        desc: "Financial assistance and skill training for traditional artisans",
        href: "https://pmvishwakarma.gov.in",
      },
      {
        title: "MUDRA Loan (Shishu)",
        desc: "Micro-loans up to ₹50,000 for small women entrepreneurs",
        href: "https://www.mudra.org.in",
      },
      {
        title: "Stand Up India",
        desc: "Bank loans for SC/ST and women entrepreneurs",
        href: "https://www.standupmitra.in",
      },
    ],
  },
  {
    icon: FileText,
    category: "Templates & Documents",
    color: "text-accent-foreground bg-accent/10 dark:text-accent",
    items: [
      {
        title: "Business Plan Template",
        desc: "Simple one-page business plan for handicraft sellers",
        href: "#",
      },
      {
        title: "Product Catalogue Format",
        desc: "Ready-to-use format for listing your handmade products",
        href: "#",
      },
      {
        title: "Pricing Worksheet",
        desc: "Calculate material cost, labour and profit margin",
        href: "#",
      },
    ],
  },
  {
    icon: GraduationCap,
    category: "Training Guides",
    color: "text-forest bg-forest/10",
    items: [
      {
        title: "Digital Payments Guide",
        desc: "Step-by-step guide to accepting UPI and online payments",
        href: "#",
      },
      {
        title: "Packaging Best Practices",
        desc: "How to pack handmade goods for safe delivery",
        href: "#",
      },
      {
        title: "Social Media for Sellers",
        desc: "Beginner guide to marketing on WhatsApp and Instagram",
        href: "#",
      },
    ],
  },
  {
    icon: BookOpen,
    category: "Financial Literacy",
    color: "text-terracotta bg-terracotta/10",
    items: [
      {
        title: "Saving & Credit Basics",
        desc: "Understanding SHG savings, credit, and interest rates",
        href: "#",
      },
      {
        title: "GST for Small Sellers",
        desc: "Do you need to register? Threshold limits explained simply",
        href: "#",
      },
      {
        title: "Record-Keeping for Artisans",
        desc: "Simple income and expense tracking with free tools",
        href: "#",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/ngo/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Resource Library</h1>
        <div className="mt-4 h-[3px] w-10 rounded-full bg-forest" />
        <p className="mt-4 text-sm text-muted-foreground max-w-lg">
          Curated guides, templates, and government scheme information to empower women sellers.
        </p>
      </div>

      <div className="space-y-8">
        {RESOURCES.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.color}`}>
                <section.icon className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                {section.category}
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
                    {item.href !== "#" && (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
