"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Polling hook with visibility API pause.
 * - 5s for active thread
 * - 10s for conversation list
 * - 15s for unread badge
 */
export function useChatPoll(
  fetcher: () => void,
  intervalMs: number,
  enabled = true,
) {
  const savedFetcher = useRef(fetcher);
  savedFetcher.current = fetcher;

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    savedFetcher.current();

    let timer: ReturnType<typeof setInterval>;

    const start = () => {
      timer = setInterval(() => savedFetcher.current(), intervalMs);
    };

    const stop = () => {
      clearInterval(timer);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        savedFetcher.current();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, enabled]);
}
