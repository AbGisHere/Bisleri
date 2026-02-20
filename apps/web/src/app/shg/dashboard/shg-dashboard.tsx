"use client";

import { Users, UserPlus, BookOpen, Store } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";

const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    icon: UserPlus,
    title: "Members",
    desc: "Manage group members",
    tag: "0 members",
    color: "accent",
  },
  {
    icon: BookOpen,
    title: "Training Resources",
    desc: "Courses & learning materials",
    tag: "Explore",
    color: "primary",
  },
  {
    icon: Store,
    title: "Marketplace",
    desc: "Group products & orders",
    tag: "0 listed",
    color: "primary",
  },
  {
    icon: Users,
    title: "SHG Network",
    desc: "Connect, learn, grow",
    tag: "Explore",
    color: "accent",
  },
];

export default function ShgDashboard({ session }: { session: Session }) {
  return (
    <DashboardLayout
      session={session}
      accentColor="bg-forest"
      cta={{
        icon: Users,
        title: "Group Network",
        desc: "Connect with other self-help groups",
        href: "#" as Route,
      }}
      workspaceItems={WORKSPACE_ITEMS}
      emptyActivityMessage="No activity yet. Start by exploring the SHG network."
    />
  );
}
