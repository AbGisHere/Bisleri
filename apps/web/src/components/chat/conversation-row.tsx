"use client";

import Link from "next/link";
import type { Route } from "next";
import { User } from "lucide-react";

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
}

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
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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
}: ConversationRowProps) {
  return (
    <Link
      href={`/messages/${userId}` as Route}
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-border/50 ${
        active
          ? "bg-primary/5"
          : "hover:bg-muted/50"
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-sm truncate ${unreadCount > 0 ? "font-semibold" : "font-medium"}`}>
            {name}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {timeAgo(lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate ${unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {isOwn ? "You: " : ""}{lastMessage}
          </p>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
