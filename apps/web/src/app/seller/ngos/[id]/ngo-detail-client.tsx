"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Calendar, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Ngo {
  id: string;
  name: string;
  location: string | null;
  focusArea: string | null;
  districtCoverage: string | null;
  shgName: string | null;
  memberCount: number | null;
}

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  skillArea: string;
  scheduledAt: string;
  location: string;
  maxAttendees: number;
  status: string;
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

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PROGRAM_STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest dark:bg-forest/20",
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

export default function NgoDetailClient({ ngoId }: { ngoId: string }) {
  const [ngo, setNgo] = useState<Ngo | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/ngos?id=${ngoId}`).then((r) => r.json()),
      fetch(`/api/workshops?ngoId=${ngoId}`).then((r) => r.json()),
      fetch(`/api/programs?ngoId=${ngoId}`).then((r) => r.json()),
    ])
      .then(([ngoData, workshopsData, programsData]) => {
        setNgo(ngoData.ngo ?? null);
        setWorkshops(workshopsData.workshops ?? []);
        setPrograms(programsData.programs ?? []);
      })
      .finally(() => setLoading(false));
  }, [ngoId]);

  const handleEnroll = async (workshopId: string, currentlyEnrolled: boolean) => {
    // Optimistic update
    setWorkshops((prev) =>
      prev.map((w) =>
        w.id === workshopId
          ? {
              ...w,
              enrolled: !currentlyEnrolled,
              enrolledCount: currentlyEnrolled ? w.enrolledCount - 1 : w.enrolledCount + 1,
            }
          : w,
      ),
    );
    setEnrolling(workshopId);

    try {
      const res = await fetch(`/api/workshops/${workshopId}/enroll`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        // Revert optimistic update
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId
              ? {
                  ...w,
                  enrolled: currentlyEnrolled,
                  enrolledCount: currentlyEnrolled ? w.enrolledCount + 1 : w.enrolledCount - 1,
                }
              : w,
          ),
        );
        alert(data.error ?? "Enrollment failed");
      } else {
        // Sync with server response
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId ? { ...w, enrolled: data.enrolled } : w,
          ),
        );
      }
    } catch {
      // Revert on network error
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

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto animate-pulse">
        <div className="h-4 bg-muted rounded w-32 mb-8" />
        <div className="h-12 bg-muted rounded w-1/2 mb-4" />
        <div className="h-3 bg-muted rounded w-1/3 mb-10" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-5">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
        <Link href="/seller/ngos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to NGOs
        </Link>
        <p className="text-muted-foreground">NGO not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/seller/ngos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to NGOs
      </Link>

      {/* NGO Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">{ngo.name}</h1>
        <div className="mt-4 h-[3px] w-10 rounded-full bg-terracotta" />
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {ngo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {ngo.location}
            </span>
          )}
          {ngo.districtCoverage && (
            <span className="flex items-center gap-1.5">
              <span className="text-border">·</span>
              {ngo.districtCoverage}
            </span>
          )}
        </div>
        {ngo.focusArea && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ngo.focusArea.split(",").map((area) => (
              <span
                key={area}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent"
              >
                {area.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Workshops */}
      <div className="mb-10">
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Upcoming Workshops
        </h2>
        {workshops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">No upcoming workshops from this NGO.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.map((w) => {
              const seatsLeft = w.maxAttendees - w.enrolledCount;
              const isFull = seatsLeft <= 0;
              const isEnrolling = enrolling === w.id;

              return (
                <div key={w.id} className="rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-sm">{w.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent">
                          {w.skillArea}
                        </span>
                      </div>
                      {w.description && (
                        <p className="text-xs text-muted-foreground mb-2">{w.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(w.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {w.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {isFull ? "Full" : `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(w.id, w.enrolled)}
                      disabled={isEnrolling || (isFull && !w.enrolled)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        w.enrolled
                          ? "bg-forest/10 text-forest dark:bg-forest/20 hover:bg-destructive/10 hover:text-destructive"
                          : isFull
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      } disabled:opacity-50`}
                    >
                      {isEnrolling ? (
                        <span>…</span>
                      ) : w.enrolled ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
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
              );
            })}
          </div>
        )}
      </div>

      {/* Programs */}
      <div>
        <h2 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">
          Skill Programs
        </h2>
        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground text-sm">No programs from this NGO.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${PROGRAM_STATUS_STYLES[p.status] ?? PROGRAM_STATUS_STYLES.active}`}>
                    {p.status}
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                )}
                {p.durationWeeks && (
                  <p className="text-xs text-muted-foreground mb-2">{p.durationWeeks} weeks</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {p.skills.split(",").map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
