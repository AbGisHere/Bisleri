"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl flex items-center justify-center transition-all duration-200 relative cursor-pointer hover:bg-primary/15 hover:border-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground/70" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground/70" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
