"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingBag,
  Store,
  MapPin,
  ArrowRight,
  Check,
  Building2,
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
    value: "ngo",
    label: "NGO / Non-Profit",
    desc: "Run workshops and connect women artisans",
    icon: Building2,
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
  if (role === "buyer") return ["Choose your role", "About you", "Your interests"];
  if (role === "ngo") return ["Choose your role", "About you", "Your organisation"];
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
  const [ngoName, setNgoName] = useState("");
  const [focusArea, setFocusArea] = useState<string[]>([]);
  const [districtCoverage, setDistrictCoverage] = useState("");
  const [womenServed, setWomenServed] = useState("");

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

  const ngoNameError =
    touched.ngoName && ngoName.trim() === "" ? "Organisation name is required" : "";
  const focusAreaError =
    touched.focusArea && focusArea.length === 0 ? "Select at least one focus area" : "";

  const canContinue =
    step === 0
      ? role !== ""
      : step === 1
        ? age !== "" && location !== "" && !ageError
        : step === 2 && role === "ngo"
          ? ngoName.trim() !== "" && focusArea.length > 0
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
            shgName: role === "ngo" ? ngoName : undefined,
            memberCount: role === "ngo" && womenServed ? Number(womenServed) : undefined,
            focusArea: role === "ngo" ? focusArea.join(",") : undefined,
            districtCoverage: role === "ngo" ? districtCoverage || undefined : undefined,
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
    if (step === 2 && role === "ngo") {
      setTouched((t) => ({ ...t, ngoName: true, focusArea: true }));
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
                    style={{
                      boxShadow: role === r.value
                        ? 'inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.08)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 backdrop-blur-md ${
                      role === r.value
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/10 bg-background/40 hover:bg-background/60 hover:border-primary/25"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        role === r.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-white/10 backdrop-blur-sm border border-white/10 text-muted-foreground"
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
                    style={{
                      boxShadow: selected
                        ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.12)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    className={`px-5 py-3 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm ${
                      selected
                        ? "border-primary/60 bg-primary/80 text-primary-foreground"
                        : "border-white/15 bg-background/30 hover:bg-primary/10 hover:border-primary/30 text-foreground"
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
                    style={{
                      boxShadow: selected
                        ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.12)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    className={`px-5 py-3 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm ${
                      selected
                        ? "border-primary/60 bg-primary/80 text-primary-foreground"
                        : "border-white/15 bg-background/30 hover:bg-primary/10 hover:border-primary/30 text-foreground"
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

        {step === 2 && role === "ngo" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Your organisation
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Tell us about your NGO so we can connect you with the right artisans.
            </p>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="ngoName">Organisation name</Label>
                <Input
                  id="ngoName"
                  type="text"
                  placeholder="e.g. Disha Foundation"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, ngoName: true }))}
                  aria-required="true"
                  aria-invalid={ngoNameError ? true : undefined}
                  aria-describedby={ngoNameError ? "ngoName-error" : undefined}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
                {ngoNameError && (
                  <p id="ngoName-error" role="alert" className="text-sm text-destructive">
                    {ngoNameError}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label>Focus areas</Label>
                <div
                  className="flex flex-wrap gap-2.5"
                  role="group"
                  aria-label="Select focus areas"
                  onBlur={() => setTouched((t) => ({ ...t, focusArea: true }))}
                >
                  {SKILL_OPTIONS.map((skill) => {
                    const selected = focusArea.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() =>
                          setFocusArea(
                            selected
                              ? focusArea.filter((s) => s !== skill)
                              : [...focusArea, skill],
                          )
                        }
                        aria-pressed={selected}
                        style={{
                          boxShadow: selected
                            ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.12)'
                            : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 4px rgba(0,0,0,0.04)',
                        }}
                        className={`px-5 py-3 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm ${
                          selected
                            ? "border-primary/60 bg-primary/80 text-primary-foreground"
                            : "border-white/15 bg-background/30 hover:bg-primary/10 hover:border-primary/30 text-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {focusAreaError && (
                  <p role="alert" className="text-sm text-destructive">
                    {focusAreaError}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="districtCoverage">Districts covered <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="districtCoverage"
                  type="text"
                  placeholder="e.g. Pune, Nashik, Aurangabad"
                  value={districtCoverage}
                  onChange={(e) => setDistrictCoverage(e.target.value)}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="womenServed">Women served <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="womenServed"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="e.g. 200"
                  value={womenServed}
                  onChange={(e) => setWomenServed(e.target.value)}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canContinue || submitting}
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 6px 20px rgba(0,0,0,0.15)' }}
          className="mt-10 w-full h-14 rounded-2xl backdrop-blur-xl bg-primary/80 border border-white/15 text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
