"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingBag,
  Store,
  Users,
  MapPin,
  ArrowRight,
  Check,
} from "lucide-react";

const ROLES = [
  {
    value: "buyer",
    label: "Buy Products",
    desc: "Discover handmade goods from rural artisans",
    icon: ShoppingBag,
  },
  {
    value: "seller",
    label: "Sell My Work",
    desc: "List your products and reach more customers",
    icon: Store,
  },
  {
    value: "shg",
    label: "SHG Member",
    desc: "Connect with your self-help group network",
    icon: Users,
  },
];

const SKILL_OPTIONS = [
  "Weaving",
  "Pottery",
  "Embroidery",
  "Food Processing",
  "Tailoring",
  "Jewellery",
  "Painting",
  "Candle Making",
  "Basket Weaving",
  "Block Printing",
];

export default function Onboarding({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [role, setRole] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const firstName = userName.split(" ")[0];

  const canContinue =
    step === 0 ? role !== "" : step === 1 ? age !== "" && location !== "" : true;

  async function handleFinish() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, age: Number(age), location, skills }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("You're all set!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Role */}
        {step === 0 && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Welcome, {firstName}!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              What brings you here?
            </p>

            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                    role === r.value
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      role === r.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <r.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.desc}
                    </div>
                  </div>
                  {role === r.value && (
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: About — age + location */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Tell us about you
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              This helps us personalise your experience.
            </p>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <label
                  htmlFor="age"
                  className="text-sm font-medium block"
                >
                  Your age
                </label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={120}
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full h-14 rounded-2xl px-5 text-lg bg-muted/40 border-2 border-transparent focus:bg-background focus:border-primary/30 focus:outline-none placeholder:text-muted-foreground/40 transition-colors"
                />
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="location"
                  className="text-sm font-medium block"
                >
                  Where are you from?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <input
                    id="location"
                    type="text"
                    placeholder="Village, District, or State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-14 rounded-2xl pl-12 pr-5 text-lg bg-muted/40 border-2 border-transparent focus:bg-background focus:border-primary/30 focus:outline-none placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              What do you make?
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Pick all that apply — you can always change this later.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {SKILL_OPTIONS.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() =>
                      setSkills(
                        selected
                          ? skills.filter((s) => s !== skill)
                          : [...skills, skill],
                      )
                    }
                    className={`px-5 py-3 rounded-full text-sm font-medium border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/50 hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              This step is optional — skip if none apply.
            </p>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleNext}
          disabled={!canContinue || submitting}
          className="mt-10 w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving..."
            : step === 2
              ? "Get Started"
              : "Continue"}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>

        {/* Back link */}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
