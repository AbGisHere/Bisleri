"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  backHref?: React.ComponentProps<typeof Link>["href"];
  backLabel?: string;
}

export function PageHeader({ title, backHref = "/seller/dashboard" as const, backLabel = "Back to dashboard" }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-10">
      <button
        onClick={() => router.back()}
        className="sm:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <Link
        href={backHref}
        className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
      <h1 className="font-display text-5xl sm:text-6xl tracking-tight">{title}</h1>
      <div className="mt-5 h-[3px] w-10 rounded-full bg-terracotta" />
    </div>
  );
}
