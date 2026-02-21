"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion } from "motion/react";

interface ConversationRowProps {
  userId: string;
  name: string;
  image: string | null;
  role: string | null;
  lastMessage: string;
  lastMessageTime: string;
  isOwn: boolean;
  unreadCount: number;
  active?: boolean;
  index?: number;
}

const ROLE_ACCENT: Record<string, string> = {
  ngo: "bg-forest/12 text-forest ring-forest/20",
  seller: "bg-terracotta/12 text-terracotta ring-terracotta/20",
  buyer: "bg-saffron/15 text-accent-foreground ring-saffron/20",
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function ConversationRow({
  userId,
  name,
  image,
  role,
  lastMessage,
  lastMessageTime,
  isOwn,
  unreadCount,
  active,
  index = 0,
}: ConversationRowProps) {
  const accent = ROLE_ACCENT[role ?? ""] ?? "bg-primary/10 text-primary ring-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={`/messages/${userId}` as Route}
        className={`group flex items-center gap-3.5 px-4 py-4 transition-all duration-200 ${
          active
            ? "bg-primary/5 border-l-2 border-l-primary"
            : "border-l-2 border-l-transparent hover:bg-muted/40 hover:border-l-primary/30"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-1 ${accent}`}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display text-sm font-bold">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-sm truncate ${unreadCount > 0 ? "font-semibold" : "font-medium"}`}
              >
                {name}
              </span>
              {role && (
                <span className="text-[10px] text-muted-foreground/60 capitalize hidden sm:inline">
                  {role}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] shrink-0 ${
                unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {timeAgo(lastMessageTime)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p
              className={`text-xs truncate leading-relaxed ${
                unreadCount > 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {isOwn && (
                <span className="text-muted-foreground font-normal">You: </span>
              )}
              {lastMessage}
            </p>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 px-1.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
