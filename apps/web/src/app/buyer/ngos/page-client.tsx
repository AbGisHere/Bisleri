"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Ngo {
  id: string;
  name: string;
  location: string | null;
  focusArea: string | null;
  districtCoverage: string | null;
  upcomingWorkshops: number;
}

const AVATAR_COLORS = [
  "bg-forest/15 text-forest dark:bg-forest/25",
  "bg-primary/15 text-primary dark:bg-primary/25",
  "bg-saffron/20 text-amber-700 dark:text-saffron dark:bg-saffron/20",
  "bg-accent/15 text-accent-foreground dark:text-accent dark:bg-accent/20",
];

function initial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "N";
}

function NgoSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 sm:px-5 py-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-2/5" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="w-4 h-4 bg-muted rounded shrink-0" />
    </div>
  );
}

export default function BuyerNgosClient() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch("/api/ngos")
      .then((r) => r.json())
      .then((d) => setNgos(d.ngos ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? ngos.filter(
        (n) =>
          n.name.toLowerCase().includes(query.toLowerCase()) ||
          n.location?.toLowerCase().includes(query.toLowerCase()) ||
          n.focusArea?.toLowerCase().includes(query.toLowerCase()),
      )
    : ngos;

  return (
    <div className="min-h-dvh pb-20">
      {/* ── Page header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4 max-w-2xl mx-auto">
        <Link
          href="/buyer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-none">
              NGO Connect
            </h1>
            <div className="mt-3 h-[3px] w-8 rounded-full bg-forest" />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Skill workshops and programs run by organisations near you.
            </p>
          </div>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="shrink-0 w-10 h-10 rounded-xl backdrop-blur-xl bg-background/60 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.06)' }}
            aria-label="Toggle search"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search — slides in/out */}
        {showSearch && (
          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              autoFocus
              type="search"
              placeholder="Name, area, or district…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl backdrop-blur-xl bg-background/60 border border-border/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-background/80 transition-all"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 1px 4px rgba(0,0,0,0.05)' }}
            />
          </div>
        )}
      </div>

      {/* ── Count line ── */}
      {!loading && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto mb-3">
          <p className="text-xs text-muted-foreground">
            {filtered.length} organisation{filtered.length !== 1 ? "s" : ""}
            {query ? ` matching "${query}"` : ""}
          </p>
        </div>
      )}

      {/* ── NGO list ── */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div
          className="rounded-2xl backdrop-blur-xl bg-background/40 border border-border/60 overflow-hidden divide-y divide-border/50"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.06)' }}
        >
          {loading ? (
            <>
              <NgoSkeleton />
              <NgoSkeleton />
              <NgoSkeleton />
              <NgoSkeleton />
            </>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {query ? `Nothing matches "${query}".` : "No organisations registered yet."}
              </p>
            </div>
          ) : (
            filtered.map((ngo, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const areas = ngo.focusArea?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

              return (
                <Link
                  key={ngo.id}
                  href={`/buyer/ngos/${ngo.id}`}
                  className="group flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  {/* Avatar initial */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-semibold shrink-0 transition-transform duration-200 group-hover:scale-105 ${color}`}
                  >
                    {initial(ngo.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-snug truncate">
                      {ngo.name}
                    </div>

                    {ngo.location && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {ngo.location}
                          {ngo.districtCoverage ? ` · ${ngo.districtCoverage}` : ""}
                        </span>
                      </div>
                    )}

                    {areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {areas.slice(0, 2).map((a) => (
                          <span
                            key={a}
                            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-forest/10 text-forest"
                          >
                            {a}
                          </span>
                        ))}
                        {areas.length > 2 && (
                          <span className="text-[11px] text-muted-foreground self-center">
                            +{areas.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: workshops + chevron */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {ngo.upcomingWorkshops > 0 ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest/10 text-forest whitespace-nowrap">
                        {ngo.upcomingWorkshops} upcoming
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/50 whitespace-nowrap">
                        no workshops
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
