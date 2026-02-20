"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-10 w-24 rounded-full bg-muted/50 animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="h-10 px-6 rounded-full backdrop-blur-xl bg-primary/80 border border-white/15 text-primary-foreground text-sm font-medium flex items-center hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 transition-all duration-200"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 14px rgba(0,0,0,0.15)' }}
      >
        Sign In
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-10 w-10 sm:w-auto sm:pl-1.5 sm:pr-4 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl text-sm font-medium flex items-center justify-center sm:justify-start sm:gap-2.5 transition-all duration-200 cursor-pointer hover:bg-primary/15 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.06)' }}>
          <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {(session.user.name || "U").charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:block text-foreground/80">{session.user.name || "User"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[220px] rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl p-2 shadow-xl shadow-black/10"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
            {(session.user.name || "U").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>
        </div>
        <div className="h-px bg-border/50 mx-2 my-1" />
        <button
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => router.push("/"),
              },
            });
          }}
          className="w-full text-left text-sm text-destructive px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
