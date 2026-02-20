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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

const INTEREST_OPTIONS = [
  "Handloom & Textiles",
  "Pottery & Ceramics",
  "Embroidered Goods",
  "Organic Food",
  "Handmade Jewellery",
  "Home Decor",
  "Traditional Art",
  "Natural Beauty",
  "Leather Craft",
  "Eco-Friendly Products",
];

function getStepLabels(role: string) {
  if (role === "shg") return ["Choose your role", "About you", "Group details"];
  if (role === "buyer") return ["Choose your role", "About you", "Your interests"];
  return ["Choose your role", "About you", "Your skills"];
}

export default function Onboarding({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [role, setRole] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [shgName, setShgName] = useState("");
  const [memberCount, setMemberCount] = useState("");

  const firstName = (userName || "there").split(" ")[0];
  const stepLabels = getStepLabels(role);

  const ageNum = Number(age);
  const ageError =
    touched.age && age !== "" && (ageNum < 13 || ageNum > 120)
      ? "Please enter an age between 13 and 120"
      : touched.age && age === ""
        ? "Age is required"
        : "";
  const locationError =
    touched.location && location === "" ? "Location is required" : "";

  const shgNameError =
    touched.shgName && shgName.trim() === "" ? "Group name is required" : "";
  const memberCountNum = Number(memberCount);
  const memberCountError =
    touched.memberCount && memberCount !== "" && (memberCountNum < 2 || memberCountNum > 500)
      ? "Enter a number between 2 and 500"
      : touched.memberCount && memberCount === ""
        ? "Member count is required"
        : "";

  const canContinue =
    step === 0
      ? role !== ""
      : step === 1
        ? age !== "" && location !== "" && !ageError
        : step === 2 && role === "shg"
          ? shgName.trim() !== "" && memberCount !== "" && !memberCountError
          : true;

  async function handleFinish(skipAll = false) {
    setSubmitting(true);
    try {
      const payload = skipAll
        ? { role: "seller" }
        : {
            role: role || "seller",
            age: age ? Number(age) : undefined,
            location: location || undefined,
            skills: role === "seller" ? skills : undefined,
            interests: role === "buyer" ? interests : undefined,
            shgName: role === "shg" ? shgName : undefined,
            memberCount: role === "shg" && memberCount ? Number(memberCount) : undefined,
          };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success(skipAll ? "Welcome! You can update your profile anytime." : "You\u2019re all set!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step === 1) {
      setTouched({ age: true, location: true });
      if (!canContinue) return;
    }
    if (step === 2 && role === "shg") {
      setTouched((t) => ({ ...t, shgName: true, memberCount: true }));
      if (!canContinue) return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div
          className="flex items-center justify-center gap-2 mb-10"
          role="group"
          aria-label={`Step ${step + 1} of 3: ${stepLabels[step]}`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-border"
              }`}
            />
          ))}
          <span className="sr-only">
            Step {step + 1} of 3: {stepLabels[step]}
          </span>
        </div>

        {step === 0 && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Welcome, {firstName}!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              What brings you here?
            </p>

            <fieldset>
              <legend className="sr-only">Select your role</legend>
              <div className="space-y-3" role="radiogroup">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    role="radio"
                    aria-checked={role === r.value}
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
                      <r.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.desc}
                      </div>
                    </div>
                    {role === r.value && (
                      <Check className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

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
                <Label htmlFor="age">Your age</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={120}
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, age: true }))}
                  aria-required="true"
                  aria-invalid={ageError ? true : undefined}
                  aria-describedby={ageError ? "age-error" : undefined}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
                {ageError && (
                  <p id="age-error" role="alert" className="text-sm text-destructive">
                    {ageError}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="location">Where are you from?</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Village, District, or State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, location: true }))}
                    aria-required="true"
                    aria-invalid={locationError ? true : undefined}
                    aria-describedby={locationError ? "location-error" : undefined}
                    className="h-14 rounded-2xl pl-12 pr-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                  />
                </div>
                {locationError && (
                  <p id="location-error" role="alert" className="text-sm text-destructive">
                    {locationError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && role === "seller" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              What do you make?
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Pick all that apply — you can always change this later.
            </p>

            <div className="flex flex-wrap gap-2.5" role="group" aria-label="Select your skills">
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
                    aria-pressed={selected}
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

        {step === 2 && role === "buyer" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              What interests you?
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              We&apos;ll show you relevant products and artisans.
            </p>

            <div className="flex flex-wrap gap-2.5" role="group" aria-label="Select your interests">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() =>
                      setInterests(
                        selected
                          ? interests.filter((i) => i !== interest)
                          : [...interests, interest],
                      )
                    }
                    aria-pressed={selected}
                    className={`px-5 py-3 rounded-full text-sm font-medium border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/50 hover:border-primary/30 text-foreground"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              This step is optional — skip if none apply.
            </p>
          </div>
        )}

        {step === 2 && role === "shg" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              About your group
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Tell us about your self-help group.
            </p>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="shgName">Group name</Label>
                <Input
                  id="shgName"
                  type="text"
                  placeholder="e.g. Lakshmi Mahila SHG"
                  value={shgName}
                  onChange={(e) => setShgName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, shgName: true }))}
                  aria-required="true"
                  aria-invalid={shgNameError ? true : undefined}
                  aria-describedby={shgNameError ? "shgName-error" : undefined}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
                {shgNameError && (
                  <p id="shgName-error" role="alert" className="text-sm text-destructive">
                    {shgNameError}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="memberCount">Number of members</Label>
                <Input
                  id="memberCount"
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={500}
                  placeholder="e.g. 15"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, memberCount: true }))}
                  aria-required="true"
                  aria-invalid={memberCountError ? true : undefined}
                  aria-describedby={memberCountError ? "memberCount-error" : undefined}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
                {memberCountError && (
                  <p id="memberCount-error" role="alert" className="text-sm text-destructive">
                    {memberCountError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canContinue || submitting}
          className="mt-10 w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {submitting
            ? "Saving..."
            : step === 2
              ? "Get Started"
              : "Continue"}
          {!submitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg py-1"
          >
            Go back
          </button>
        )}

        <button
          onClick={() => handleFinish(true)}
          disabled={submitting}
          className="mt-3 w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1 disabled:opacity-40"
        >
          Skip for now — I&apos;ll explore on my own
        </button>
      </div>
    </div>
  );
}
