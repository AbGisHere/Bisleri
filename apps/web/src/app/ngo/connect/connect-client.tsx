"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, User, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { Session } from "@/lib/types";

interface EnrolledSeller {
  userId: string;
  name: string | null;
  location: string | null;
  skills: string | null;
}

interface Workshop {
  id: string;
  title: string;
  skillArea: string;
  scheduledAt: string;
  location: string;
  status: string;
  enrolledCount: number;
  enrolledSellers: EnrolledSeller[];
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ConnectClient({ session: _session }: { session: Session }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workshops")
      .then((r) => r.json())
      .then((data) => setWorkshops(data.workshops ?? []))
      .finally(() => setLoading(false));
  }, []);

  const workshopsWithEnrollees = workshops.filter((w) => w.enrolledSellers?.length > 0);
  const totalEnrollees = new Set(
    workshops.flatMap((w) => w.enrolledSellers?.map((s) => s.userId) ?? []),
  ).size;

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
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Connect Women</h1>
        <div className="mt-4 h-[3px] w-10 rounded-full bg-forest" />
        {!loading && (
          <p className="mt-4 text-sm text-muted-foreground">
            {totalEnrollees} enrolled seller{totalEnrollees !== 1 ? "s" : ""} across {workshopsWithEnrollees.length} workshop{workshopsWithEnrollees.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="rounded-2xl border border-border p-4">
                    <div className="h-3.5 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : workshopsWithEnrollees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted-foreground text-sm">
            No enrollments yet. Share your workshops so sellers can discover and enroll.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {workshops.map((w) => {
            if (!w.enrolledSellers?.length) return null;
            return (
              <div key={w.id}>
                {/* Workshop heading */}
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-medium text-base">{w.title}</h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent">
                        {w.skillArea}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(w.scheduledAt)} · {w.location} · {w.enrolledSellers.length} enrolled
                    </p>
                  </div>
                </div>

                {/* Enrolled sellers */}
                <div className="grid sm:grid-cols-2 gap-3 pl-4 border-l-2 border-border">
                  {w.enrolledSellers.map((seller) => (
                    <div
                      key={seller.userId}
                      className="rounded-2xl border border-border p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{seller.name ?? "Seller"}</p>
                          {seller.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {seller.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {seller.skills && (
                        <div className="flex flex-wrap gap-1.5">
                          {seller.skills.split(",").slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/messages/${seller.userId}` as Route}
                        className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg backdrop-blur-xl bg-primary/10 border border-primary/15 text-primary text-xs font-medium hover:bg-primary/20 hover:border-primary/25 transition-all shadow-glass-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Message
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
