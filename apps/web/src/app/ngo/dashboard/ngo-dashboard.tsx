"use client";

import { CalendarDays, GraduationCap, Users, BookOpen } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: CalendarDays,
    title: "Schedule Workshops",
    desc: "Plan & manage skill workshops",
    tag: "Explore",
    color: "primary",
  },
  {
    icon: GraduationCap,
    title: "Skill Programs",
    desc: "Create and track skill curricula",
    tag: "Explore",
    color: "primary",
  },
  {
    icon: Users,
    title: "Connect Women",
    desc: "Network of women in your area",
    tag: "Explore",
    color: "accent",
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    desc: "Guides, templates, materials",
    tag: "Explore",
    color: "accent",
  },
];

export default function NgoDashboard({ session }: { session: Session }) {
  return (
    <DashboardLayout
      session={session}
      accentColor="bg-forest"
      cta={{
        icon: CalendarDays,
        title: "Schedule a Workshop",
        desc: "Plan your next skill session",
        href: "#" as Route,
      }}
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. Start by scheduling a workshop."
    />
  );
}
