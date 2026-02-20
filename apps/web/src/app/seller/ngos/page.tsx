"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Ngo {
  id: string;
  name: string;
  location: string | null;
  focusArea: string | null;
  districtCoverage: string | null;
  shgName: string | null;
  memberCount: number | null;
  upcomingWorkshops: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border p-5 animate-pulse">
      <div className="h-4 bg-muted rounded w-2/3 mb-3" />
      <div className="h-3 bg-muted rounded w-1/2 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-muted rounded-full w-16" />
        <div className="h-5 bg-muted rounded-full w-20" />
      </div>
      <div className="h-8 bg-muted rounded-xl w-24" />
    </div>
  );
}

export default function NgosPage() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ngos")
      .then((r) => r.json())
      .then((data) => setNgos(data.ngos ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight">NGO Connect</h1>
        <div className="mt-5 h-[3px] w-10 rounded-full bg-terracotta" />
        <p className="mt-4 text-sm text-muted-foreground max-w-lg">
          Discover NGOs near you, browse upcoming skill workshops, and enroll in programs to grow your business.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : ngos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted-foreground text-sm">No NGOs registered yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ngos.map((ngo) => (
            <div key={ngo.id} className="rounded-2xl border border-border p-5 flex flex-col gap-3">
              <div>
                <h3 className="font-medium text-base leading-snug">{ngo.name}</h3>
                {ngo.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {ngo.location}
                    {ngo.districtCoverage && ` · ${ngo.districtCoverage}`}
                  </p>
                )}
              </div>

              {ngo.focusArea && (
                <div className="flex flex-wrap gap-1.5">
                  {ngo.focusArea.split(",").slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent"
                    >
                      {area.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ngo.upcomingWorkshops} upcoming workshop{ngo.upcomingWorkshops !== 1 ? "s" : ""}
                </span>
                <Link
                  href={`/seller/ngos/${ngo.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg backdrop-blur-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:-translate-y-0.5 hover:bg-primary/15 active:translate-y-0 transition-all duration-200"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.06)' }}
                >
                  View
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
