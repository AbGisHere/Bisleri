"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Route } from "next";
import type { Session } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useChatPoll } from "@/lib/use-chat-poll";
import MessageBubble from "@/components/chat/message-bubble";
import MessageInput from "@/components/chat/message-input";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface OtherUser {
  id: string;
  name: string;
  image: string | null;
  role: string | null;
}

const ROLE_ACCENT: Record<string, string> = {
  ngo: "bg-forest/12 text-forest ring-forest/20",
  seller: "bg-terracotta/12 text-terracotta ring-terracotta/20",
  buyer: "bg-saffron/15 text-accent-foreground ring-saffron/20",
};

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)
    return d.toLocaleDateString("en-IN", { weekday: "long" });
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: now.getFullYear() !== d.getFullYear() ? "numeric" : undefined,
  });
}

function shouldShowDateSeparator(
  curr: Message,
  prev: Message | undefined,
): boolean {
  if (!prev) return true;
  const a = new Date(prev.createdAt).toDateString();
  const b = new Date(curr.createdAt).toDateString();
  return a !== b;
}

export default function ThreadClient({
  session,
  otherUserId,
}: {
  session: Session;
  otherUserId: string;
}) {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchThread = useCallback(() => {
    fetch(`/api/messages/${otherUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setOtherUser(data.user ?? null);
        const msgs: Message[] = data.messages ?? [];
        setMessages(msgs);
        if (msgs.length > prevCountRef.current) {
          setTimeout(
            () =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
            50,
          );
        }
        prevCountRef.current = msgs.length;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [otherUserId]);

  useChatPoll(fetchThread, 5000);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]);

  const handleSend = async (content: string) => {
    setSending(true);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: session.user.id,
      receiverId: otherUserId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherUserId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? data.message : m)),
        );
        prevCountRef.current++;
      } else {
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimistic.id),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimistic.id),
      );
    } finally {
      setSending(false);
    }
  };

  const accent =
    ROLE_ACCENT[otherUser?.role ?? ""] ??
    "bg-primary/10 text-primary ring-primary/20";

  return (
    <div className="h-[calc(100vh-4rem)] flex justify-center">
      <div className="w-full max-w-4xl flex flex-col md:my-4 md:mx-4 md:rounded-2xl md:border md:border-border/60 md:shadow-glass-lg md:overflow-hidden md:bg-background/40 md:backdrop-blur-xl">

        <div className="flex items-center gap-3.5 px-5 sm:px-6 py-4 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <Link
            href={"/messages" as Route}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors border border-transparent hover:border-border/40"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-1 ${accent}`}
          >
            {otherUser?.image ? (
              <img
                src={otherUser.image}
                alt={otherUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-base font-bold">
                {otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {loading ? (
                <span className="inline-block w-28 h-4 bg-muted rounded animate-pulse" />
              ) : (
                otherUser?.name ?? "Unknown"
              )}
            </p>
            {otherUser?.role && (
              <p className="text-[11px] text-muted-foreground capitalize">
                {otherUser.role}
              </p>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 py-6 space-y-1.5"
        >
          {loading ? (
            <div className="space-y-4 py-6 max-w-xl mx-auto w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 3 === 1 ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl bg-muted animate-pulse ${
                      i % 3 === 1
                        ? "w-48 h-12 rounded-br-md"
                        : "w-56 h-10 rounded-bl-md"
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary/40" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-foreground">
                  {t("chat.startConversation")}
                </p>
                {otherUser && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("chat.sayHello")} {otherUser.name.split(" ")[0]}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto w-full space-y-1.5">
              {messages.map((msg, i) => (
                <div key={msg.id}>
                  {shouldShowDateSeparator(msg, messages[i - 1]) && (
                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground/50 px-2">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                  )}
                  <MessageBubble
                    content={msg.content}
                    createdAt={msg.createdAt}
                    isOwn={msg.senderId === session.user.id}
                    read={msg.read}
                    animate={i >= messages.length - 3}
                  />
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="px-2 sm:px-4 lg:px-8">
          <MessageInput onSend={handleSend} disabled={sending} />
        </div>
      </div>
    </div>
  );
}
