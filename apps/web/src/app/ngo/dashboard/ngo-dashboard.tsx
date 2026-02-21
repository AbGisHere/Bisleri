"use client";

import { useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Users, BookOpen, MessageCircle } from "lucide-react";
import type { Route } from "next";
import DashboardLayout from "@/components/dashboard-layout";
import type { WorkspaceItem } from "@/components/dashboard-layout";
import type { Session } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

interface NgoStats {
  workshops: number;
  programs: number;
  enrollees: number;
  unreadMessages?: number;
}

export default function NgoDashboard({ session }: { session: Session }) {
  const { t } = useLocale();
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
      title: t("ngo.scheduleWorkshops"),
      desc: t("ngo.scheduleWorkshopsDesc"),
      tag: stats ? `${stats.workshops} ${t("ngo.total")}` : "…",
      color: "primary",
      href: "/ngo/workshops" as Route,
    },
    {
      icon: GraduationCap,
      title: t("ngo.skillPrograms"),
      desc: t("ngo.skillProgramsDesc"),
      tag: stats ? `${stats.programs} ${t("ngo.activePrograms")}` : "…",
      color: "primary",
      href: "/ngo/programs" as Route,
    },
    {
      icon: Users,
      title: t("ngo.connectWomen"),
      desc: t("ngo.connectWomenDesc"),
      tag: stats ? `${stats.enrollees} ${t("ngo.enrolled")}` : "…",
      color: "accent",
      href: "/ngo/connect" as Route,
    },
    {
      icon: MessageCircle,
      title: t("chat.messagesWorkspace"),
      desc: t("chat.messagesWorkspaceDesc"),
      tag: stats ? `${stats.unreadMessages ?? 0} ${t("chat.unread")}` : "…",
      color: "accent",
      href: "/messages" as Route,
    },
    {
      icon: BookOpen,
      title: t("ngo.resourceLibrary"),
      desc: t("ngo.resourceLibraryDesc"),
      tag: t("ngo.browse"),
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
        title: t("ngo.scheduleWorkshop"),
        desc: t("ngo.scheduleWorkshopDesc"),
        href: "/ngo/workshops" as Route,
      }}
      workspaceItems={workspaceItems}
      emptyActivityMessage={t("ngo.emptyActivity")}
    />
  );
}
