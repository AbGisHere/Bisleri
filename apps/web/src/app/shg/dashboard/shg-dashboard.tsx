"use client";

import { Users, CalendarDays, GraduationCap, Store } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: CalendarDays,
    title: "Workshop Schedule",
    desc: "Upcoming & past workshops",
    tag: "Explore",
    color: "primary",
  },
  {
    icon: GraduationCap,
    title: "My Skills",
    desc: "Skills your group has mastered",
    tag: "Explore",
    color: "accent",
  },
  {
    icon: Users,
    title: "Women Network",
    desc: "Connect with other SHG members",
    tag: "Explore",
    color: "accent",
  },
  {
    icon: Store,
    title: "Marketplace",
    desc: "Group products & orders",
    tag: "0 listed",
    color: "primary",
  },
];

export default function ShgDashboard({ session }: { session: Session }) {
  return (
    <DashboardLayout
      session={session}
      accentColor="bg-forest"
      cta={{
        icon: CalendarDays,
        title: "Schedule a Workshop",
        desc: "Plan your next group session",
        href: "#" as Route,
      }}
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. Start by scheduling a workshop."
    />
  );
}
