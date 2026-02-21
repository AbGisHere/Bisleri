"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { Session } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useChatPoll } from "@/lib/use-chat-poll";
import ConversationRow from "@/components/chat/conversation-row";

interface Conversation {
  user: { id: string; name: string; image: string | null; role: string | null };
  lastMessage: { content: string; createdAt: string; isOwn: boolean };
  unreadCount: number;
}

export default function MessagesClient({ session }: { session: Session }) {
  const { t } = useLocale();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useChatPoll(fetchConversations, 10000);

  const dashboardHref =
    session.user.role === "ngo"
      ? "/ngo/dashboard"
      : session.user.role === "buyer"
        ? "/buyer/dashboard"
        : "/seller/dashboard";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("pageHeader.backToDashboard")}
        </Link>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          {t("chat.messages")}
        </h1>
        <div className="mt-3 h-[3px] w-8 rounded-full bg-primary" />
      </div>

      {/* Conversation list */}
      {loading ? (
        <div className="space-y-0 rounded-2xl border border-border overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t("chat.noConversations")}</p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border overflow-hidden backdrop-blur-xl bg-background/40"
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {conversations.map((conv) => (
            <ConversationRow
              key={conv.user.id}
              userId={conv.user.id}
              name={conv.user.name}
              image={conv.user.image}
              role={conv.user.role}
              lastMessage={conv.lastMessage.content}
              lastMessageTime={conv.lastMessage.createdAt}
              isOwn={conv.lastMessage.isOwn}
              unreadCount={conv.unreadCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
