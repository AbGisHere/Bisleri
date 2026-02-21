"use client";

import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="min-h-[calc(100svh-4rem)] flex flex-col lg:flex-row">
      <div className="lg:hidden bg-primary text-primary-foreground px-6 py-6 sm:px-12 sm:py-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
          Your craft, amplified.
        </h2>
        <p className="text-primary-foreground/80 text-sm sm:text-base mt-2 max-w-sm">
          AI pricing. SHG connections. A marketplace that works as hard as you do.
        </p>
      </div>

      <div className="hidden lg:flex lg:w-2/5 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 400 800" fill="none">
            {Array.from({ length: 12 }).map((_, i) => (
              <path
                key={i}
                d={`M${50 + (i % 3) * 120} ${60 + i * 65} Q${100 + (i % 2) * 80} ${30 + i * 65}, ${180 + (i % 3) * 60} ${60 + i * 65} T${350} ${60 + i * 65}`}
                stroke="currentColor"
                strokeWidth={1.5 + (i % 3) * 0.5}
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex flex-col p-12 w-full">
          <span className="font-brand text-xl font-bold tracking-[-0.01em] text-primary-foreground">
            Rangaayan
          </span>

          <div className="mt-auto">
            <h2 className="font-display text-5xl font-bold leading-[1.1] mb-6">
              Your craft,
              <br />
              amplified.
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xs leading-relaxed">
              AI pricing. SHG connections. A marketplace that works as hard as
              you do.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
