"use client";

import { useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Users, BookOpen } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

interface NgoStats {
  workshops: number;
  programs: number;
  enrollees: number;
}

export default function NgoDashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<NgoStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const workspaceItems: WorkspaceItem[] = [
    {
      icon: CalendarDays,
      title: "Schedule Workshops",
      desc: "Plan & manage skill workshops",
      tag: stats ? `${stats.workshops} total` : "…",
      color: "primary",
      href: "/ngo/workshops" as Route,
    },
    {
      icon: GraduationCap,
      title: "Skill Programs",
      desc: "Create and track skill curricula",
      tag: stats ? `${stats.programs} active` : "…",
      color: "primary",
      href: "/ngo/programs" as Route,
    },
    {
      icon: Users,
      title: "Connect Women",
      desc: "Network of women in your area",
      tag: stats ? `${stats.enrollees} enrolled` : "…",
      color: "accent",
      href: "/ngo/connect" as Route,
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      desc: "Guides, templates, materials",
      tag: "Browse",
      color: "accent",
      href: "/ngo/resources" as Route,
    },
  ];

  return (
    <DashboardLayout
      session={session}
      accentColor="bg-forest"
      cta={{
        icon: CalendarDays,
        title: "Schedule a Workshop",
        desc: "Plan your next skill session",
        href: "/ngo/workshops" as Route,
      }}
      workspaceItems={workspaceItems}
      emptyActivityMessage="No activity yet. Start by scheduling a workshop."
    />
  );
}
