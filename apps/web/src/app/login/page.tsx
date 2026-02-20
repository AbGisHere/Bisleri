"use client";

import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-[calc(100svh-4rem)] flex">
      {/* Left — typographic brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="font-display text-[12rem] font-bold leading-none whitespace-nowrap select-none"
              style={{ transform: `translateX(${i % 2 === 0 ? -40 : 20}px)` }}
            >
              BISLERI
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <span className="font-display text-xl font-bold">
            Bisleri
          </span>

          <div>
            <h2 className="font-display text-5xl font-bold leading-[1.1] mb-6">
              Your craft,
              <br />
              amplified.
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xs leading-relaxed">
              AI pricing. SHG connections. A marketplace that works as hard as
              you do.
            </p>
          </div>

          <div />
        </div>
      </div>

      {/* Right — form */}
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
