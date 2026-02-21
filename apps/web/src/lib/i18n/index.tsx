"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import en from "./en.json";
import hi from "./hi.json";

type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = { en, hi };

type Locale = "en" | "hi";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = "rangaayan-locale";

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "hi" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
