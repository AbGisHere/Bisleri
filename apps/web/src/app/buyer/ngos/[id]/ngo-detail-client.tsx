"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";

interface Ngo {
  id: string;
  name: string;
  location: string | null;
  focusArea: string | null;
  districtCoverage: string | null;
}

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  skillArea: string;
  scheduledAt: string;
  location: string;
  maxAttendees: number;
  enrolledCount: number;
  enrolled: boolean;
}

interface Program {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  durationWeeks: number | null;
  status: string;
}

function parseDate(dt: string) {
  const d = new Date(dt);
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-IN", { month: "short" }),
    weekday: d.toLocaleString("en-IN", { weekday: "short" }),
    time: d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

const STATUS_PILL: Record<string, string> = {
  active:    "bg-forest/10 text-forest",
  upcoming:  "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

// ── Skeletons ──────────────────────────────────────────────────────────────
function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 bg-muted rounded w-20 mb-8" />
      <div className="h-10 bg-muted rounded w-2/3 mb-3" />
      <div className="h-3 bg-muted rounded w-1/3 mb-6" />
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded-full w-20" />
        <div className="h-5 bg-muted rounded-full w-24" />
      </div>
    </div>
  );
}

function WorkshopSkeleton() {
  return (
    <div className="flex gap-4 p-4 sm:p-5 animate-pulse">
      <div className="w-12 shrink-0 flex flex-col items-center gap-1">
        <div className="h-7 bg-muted rounded w-8" />
        <div className="h-3 bg-muted rounded w-8" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

export default function NgoDetailClient({ ngoId }: { ngoId: string }) {
  const [ngo, setNgo] = useState<Ngo | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/ngos?id=${ngoId}`).then((r) => r.json()),
      fetch(`/api/workshops?ngoId=${ngoId}`).then((r) => r.json()),
      fetch(`/api/programs?ngoId=${ngoId}`).then((r) => r.json()),
    ]).then(([ngoData, wsData, pgData]) => {
      setNgo(ngoData.ngo ?? null);
      setWorkshops(wsData.workshops ?? []);
      setPrograms(pgData.programs ?? []);
    }).finally(() => setLoading(false));
  }, [ngoId]);

  const handleEnroll = async (workshopId: string, currentlyEnrolled: boolean) => {
    setEnrollError(null);
    // Optimistic
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === workshopId
          ? { ...w, enrolled: !currentlyEnrolled, enrolledCount: currentlyEnrolled ? w.enrolledCount - 1 : w.enrolledCount + 1 }
          : w,
      ),
    );
    setEnrolling(workshopId);

    try {
      const res = await fetch(`/api/workshops/${workshopId}/enroll`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        // Revert
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId
              ? { ...w, enrolled: currentlyEnrolled, enrolledCount: currentlyEnrolled ? w.enrolledCount + 1 : w.enrolledCount - 1 }
              : w,
          ),
        );
        setEnrollError(data.error ?? "Could not update enrollment.");
      } else {
        setWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? { ...w, enrolled: data.enrolled } : w)),
        );
      }
    } catch {
      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === workshopId
            ? { ...w, enrolled: currentlyEnrolled, enrolledCount: w.enrolledCount + (currentlyEnrolled ? 1 : -1) }
            : w,
        ),
      );
    } finally {
      setEnrolling(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-20 max-w-2xl mx-auto">
        <HeaderSkeleton />
        <div
          className="mt-10 rounded-2xl backdrop-blur-xl bg-background/40 border border-border/60 overflow-hidden divide-y divide-border/50"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <WorkshopSkeleton />
          <WorkshopSkeleton />
          <WorkshopSkeleton />
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-8 max-w-2xl mx-auto">
        <Link href="/buyer/ngos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <p className="text-muted-foreground text-sm">Organisation not found.</p>
      </div>
    );
  }

  const areas = ngo.focusArea?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <div className="pb-20">

      {/* ── NGO hero ──────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6 max-w-2xl mx-auto">
        <Link
          href="/buyer/ngos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7"
        >
          <ArrowLeft className="w-4 h-4" />
          All organisations
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
          {ngo.name}
        </h1>
        <div className="mt-3 h-[3px] w-8 rounded-full bg-forest" />

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {ngo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {ngo.location}
            </span>
          )}
          {ngo.districtCoverage && (
            <span className="text-border">·</span>
          )}
          {ngo.districtCoverage && (
            <span>{ngo.districtCoverage}</span>
          )}
        </div>

        {areas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {areas.map((a) => (
              <span key={a} className="px-2.5 py-1 rounded-full text-xs font-medium bg-forest/10 text-forest">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Enroll error ──────────────────────────────────────────────────── */}
      {enrollError && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto mb-4">
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {enrollError}
          </p>
        </div>
      )}

      {/* ── Upcoming workshops ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
          Upcoming Workshops
        </h2>

        {workshops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm text-muted-foreground">No upcoming workshops right now.</p>
          </div>
        ) : (
          <div
            className="rounded-2xl backdrop-blur-xl bg-background/40 border border-border/60 overflow-hidden divide-y divide-border/50"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.06)' }}
          >
            {workshops.map((w) => {
              const { day, month, weekday, time } = parseDate(w.scheduledAt);
              const seatsLeft = w.maxAttendees - w.enrolledCount;
              const isFull = seatsLeft <= 0;
              const isEnrolling = enrolling === w.id;

              return (
                <div key={w.id} className="flex gap-0 sm:gap-4">

                  {/* ── Date column ── */}
                  <div className="w-16 shrink-0 flex flex-col items-center justify-center py-5 px-2 bg-forest/5 border-r border-border/40">
                    <span className="font-display text-2xl font-bold text-forest leading-none">{day}</span>
                    <span className="text-[10px] uppercase tracking-widest text-forest/70 mt-0.5">{month}</span>
                    <span className="text-[10px] text-muted-foreground mt-2">{weekday}</span>
                  </div>

                  {/* ── Workshop info + action ── */}
                  <div className="flex-1 min-w-0 px-4 py-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-snug">{w.title}</p>
                        {w.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{w.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/10 text-accent-foreground dark:text-accent">
                        {w.skillArea}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {w.location}
                      </span>
                      <span>·</span>
                      <span>{time}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      {/* Seats indicator */}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className={`text-xs font-medium ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
                          {isFull ? "Full" : `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`}
                        </span>
                        {!isFull && (
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-forest"
                              style={{ width: `${Math.round((w.enrolledCount / w.maxAttendees) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Enroll button */}
                      <button
                        onClick={() => handleEnroll(w.id, w.enrolled)}
                        disabled={isEnrolling || (isFull && !w.enrolled)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xl border transition-all duration-200 disabled:opacity-50 ${
                          w.enrolled
                            ? "bg-forest/15 border-forest/25 text-forest hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive"
                            : isFull
                            ? "bg-muted/60 border-border/50 text-muted-foreground cursor-not-allowed"
                            : "bg-primary/80 border-white/15 text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
                        }`}
                        style={{
                          boxShadow: w.enrolled
                            ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.08)'
                            : isFull
                            ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.04)'
                            : 'inset 0 1px 1px rgba(255,255,255,0.2), 0 3px 10px rgba(0,0,0,0.12)',
                        }}
                      >
                        {isEnrolling ? (
                          "…"
                        ) : w.enrolled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enrolled
                          </>
                        ) : isFull ? (
                          "Full"
                        ) : (
                          "Enroll"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Skill programs ────────────────────────────────────────────────── */}
      {programs.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto mt-10">
          <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
            Skill Programs
          </h2>

          <div
            className="rounded-2xl backdrop-blur-xl bg-background/40 border border-border/60 overflow-hidden divide-y divide-border/50"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.06)' }}
          >
            {programs.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-sm leading-snug">{p.title}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_PILL[p.status] ?? STATUS_PILL.active}`}>
                    {p.status}
                  </span>
                </div>

                {p.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {p.durationWeeks && (
                    <span className="text-xs text-muted-foreground">
                      {p.durationWeeks} week{p.durationWeeks !== 1 ? "s" : ""}
                    </span>
                  )}
                  {p.durationWeeks && p.skills && (
                    <span className="text-muted-foreground/40 text-xs">·</span>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {p.skills.split(",").map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
