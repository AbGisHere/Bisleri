"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
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
  const prevCountRef = useRef(0);

  const fetchThread = useCallback(() => {
    fetch(`/api/messages/${otherUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setOtherUser(data.user ?? null);
        const msgs = data.messages ?? [];
        setMessages(msgs);
        // Auto-scroll on new messages
        if (msgs.length > prevCountRef.current) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
        prevCountRef.current = msgs.length;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [otherUserId]);

  useChatPoll(fetchThread, 5000);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]);

  const handleSend = async (content: string) => {
    setSending(true);

    // Optimistic add
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderId: session.user.id,
      receiverId: otherUserId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

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
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
        <Link
          href={"/messages" as Route}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {otherUser?.image ? (
            <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4.5 h-4.5 text-primary" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {loading ? (
              <span className="inline-block w-24 h-3.5 bg-muted rounded animate-pulse" />
            ) : (
              otherUser?.name ?? "Unknown"
            )}
          </p>
          {otherUser?.role && (
            <p className="text-[11px] text-muted-foreground capitalize">{otherUser.role}</p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                <div className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 ? "w-2/5" : "w-3/5"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">{t("chat.startConversation")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              createdAt={msg.createdAt}
              isOwn={msg.senderId === session.user.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
