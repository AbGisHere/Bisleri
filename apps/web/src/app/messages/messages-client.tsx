"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Session } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useChatPoll } from "@/lib/use-chat-poll";
import ConversationRow from "@/components/chat/conversation-row";

interface Conversation {
  user: {
    id: string;
    name: string;
    image: string | null;
    role: string | null;
  };
  lastMessage: { content: string; createdAt: string; isOwn: boolean };
  unreadCount: number;
}

export default function MessagesClient({ session }: { session: Session }) {
  const { t } = useLocale();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );

  const filtered = search
    ? conversations.filter((c) =>
        c.user.name.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("pageHeader.backToDashboard")}
        </Link>
        <div className="flex items-baseline gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl tracking-tight"
          >
            {t("chat.messages")}
          </motion.h1>
          {totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
            >
              {totalUnread}
            </motion.span>
          )}
        </div>
        <div className="mt-3 h-[3px] w-8 rounded-full bg-primary" />
      </div>

      {!loading && conversations.length > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder={t("chat.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/40 border border-border/40 text-sm focus:outline-none focus:bg-background focus:border-border transition-colors placeholder:text-muted-foreground/40"
          />
        </motion.div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border/60 overflow-hidden backdrop-blur-xl bg-background/40 shadow-glass">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-3.5 px-4 py-4 border-l-2 border-l-transparent"
            >
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 bg-muted rounded w-28" />
                  <div className="h-3 bg-muted rounded w-8" />
                </div>
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && !search ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-dashed border-border/60 py-20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-primary/60" />
          </div>
          <p className="font-medium text-sm text-foreground">
            {t("chat.noConversations")}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
            {t("chat.startHint")}
          </p>
        </motion.div>
      ) : filtered.length === 0 && search ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-14 text-center">
          <p className="text-sm text-muted-foreground">{t("chat.noResults")}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-border/60 overflow-hidden backdrop-blur-xl bg-background/40 shadow-glass divide-y divide-border/30"
        >
          {filtered.map((conv, i) => (
            <ConversationRow
              key={conv.user.id}
              index={i}
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
        </motion.div>
      )}
    </div>
  );
}
