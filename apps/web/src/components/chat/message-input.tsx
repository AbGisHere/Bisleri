"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useLocale } from "@/lib/i18n";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLocale();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="p-3 sm:p-4 border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div
        className="flex items-end gap-2.5 rounded-2xl border border-border/60 bg-muted/30 backdrop-blur-xl px-3 py-2 transition-colors focus-within:border-primary/30 focus-within:bg-background/60 shadow-glass-sm"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={t("chat.placeholder")}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!hasText || disabled}
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
            hasText
              ? "bg-primary text-primary-foreground shadow-glass-button hover:-translate-y-px active:translate-y-0"
              : "bg-muted/60 text-muted-foreground"
          } disabled:opacity-40`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
