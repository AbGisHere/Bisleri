"use client";

import { useState, useCallback, useRef } from "react";

interface AiStreamState {
  isLoading: boolean;
  status: string;
  result: string;
  error: string | null;
}

export function useAiStream(url: string) {
  const [state, setState] = useState<AiStreamState>({
    isLoading: false,
    status: "",
    result: "",
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (body: Record<string, unknown>): Promise<string | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isLoading: true, status: "Starting…", result: "", error: null });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("AI service unavailable");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "status") {
              setState(prev => ({ ...prev, status: event.message }));
            } else if (event.type === "result") {
              finalResult = event.content;
              setState(prev => ({ ...prev, result: event.content, status: "", isLoading: false }));
            } else if (event.type === "error") {
              setState(prev => ({ ...prev, error: event.message, status: "", isLoading: false }));
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      if (!finalResult) {
        setState(prev => ({ ...prev, isLoading: false, status: "" }));
      }
      return finalResult || null;
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setState({ isLoading: false, status: "", result: "", error: msg });
      return null;
    }
  }, [url]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isLoading: false, status: "" }));
  }, []);

  return { ...state, run, abort };
}
