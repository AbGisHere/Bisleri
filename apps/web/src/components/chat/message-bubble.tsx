"use client";

import { Check } from "lucide-react";
import { motion, type Easing } from "motion/react";

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isOwn: boolean;
  read?: boolean;
  showAvatar?: boolean;
  senderName?: string;
  animate?: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EASE: Easing = [0.25, 0.1, 0.25, 1];

export default function MessageBubble({
  content,
  createdAt,
  isOwn,
  read,
  showAvatar,
  senderName,
  animate = true,
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 6, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[78%] sm:max-w-[65%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && showAvatar && senderName && (
          <span className="text-[10px] text-muted-foreground ml-3 mb-0.5">
            {senderName}
          </span>
        )}

        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-glass-sm"
              : "backdrop-blur-xl bg-background/60 border border-border/60 text-foreground rounded-2xl rounded-bl-md shadow-glass-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>

          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-[10px] ${
                isOwn ? "text-primary-foreground/50" : "text-muted-foreground/60"
              }`}
            >
              {formatTime(createdAt)}
            </span>
            {isOwn && (
              <Check
                className={`w-3 h-3 ${
                  read
                    ? "text-primary-foreground/70"
                    : "text-primary-foreground/35"
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
