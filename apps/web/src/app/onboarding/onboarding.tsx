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
import { useLocale } from "@/lib/i18n";

const SKILL_OPTIONS = [
  { value: "Weaving", key: "skill.weaving" },
  { value: "Pottery", key: "skill.pottery" },
  { value: "Embroidery", key: "skill.embroidery" },
  { value: "Food Processing", key: "skill.foodProcessing" },
  { value: "Tailoring", key: "skill.tailoring" },
  { value: "Jewellery", key: "skill.jewellery" },
  { value: "Painting", key: "skill.painting" },
  { value: "Candle Making", key: "skill.candleMaking" },
  { value: "Basket Weaving", key: "skill.basketWeaving" },
  { value: "Block Printing", key: "skill.blockPrinting" },
];

const INTEREST_OPTIONS = [
  { value: "Handloom & Textiles", key: "interest.handloomTextiles" },
  { value: "Pottery & Ceramics", key: "interest.potteryCeramics" },
  { value: "Embroidered Goods", key: "interest.embroideredGoods" },
  { value: "Organic Food", key: "interest.organicFood" },
  { value: "Handmade Jewellery", key: "interest.handmadeJewellery" },
  { value: "Home Decor", key: "interest.homeDecor" },
  { value: "Traditional Art", key: "interest.traditionalArt" },
  { value: "Natural Beauty", key: "interest.naturalBeauty" },
  { value: "Leather Craft", key: "interest.leatherCraft" },
  { value: "Eco-Friendly Products", key: "interest.ecoFriendly" },
];

export default function Onboarding({ userName }: { userName: string }) {
  const router = useRouter();
  const { t } = useLocale();
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

  const ROLES = [
    {
      value: "buyer",
      label: t("onboarding.buyProducts"),
      desc: t("onboarding.buyProductsDesc"),
      icon: ShoppingBag,
    },
    {
      value: "seller",
      label: t("onboarding.sellMyWork"),
      desc: t("onboarding.sellMyWorkDesc"),
      icon: Store,
    },
    {
      value: "ngo",
      label: t("onboarding.ngoNonProfit"),
      desc: t("onboarding.ngoNonProfitDesc"),
      icon: Building2,
    },
  ];

  function getStepLabels(r: string) {
    if (r === "buyer") return [t("onboarding.chooseRole"), t("onboarding.aboutYou"), t("onboarding.yourInterests")];
    if (r === "ngo") return [t("onboarding.chooseRole"), t("onboarding.aboutYou"), t("onboarding.yourOrganisation")];
    return [t("onboarding.chooseRole"), t("onboarding.aboutYou"), t("onboarding.yourSkills")];
  }

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

      toast.success(skipAll ? t("toast.welcomeSkip") : t("toast.allSet"));
      router.push("/dashboard");
    } catch {
      toast.error(t("toast.somethingWrong"));
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
      setTouched((prev) => ({ ...prev, ngoName: true, focusArea: true }));
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
              {t("onboarding.welcome")} {firstName}!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("onboarding.whatBringsYou")}
            </p>

            <fieldset>
              <legend className="sr-only">{t("onboarding.chooseRole")}</legend>
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
              {t("onboarding.tellUsAboutYou")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("onboarding.personaliseDesc")}
            </p>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="age">{t("onboarding.yourAge")}</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={13}
                  max={120}
                  placeholder={t("onboarding.agePlaceholder")}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
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
                <Label htmlFor="location">{t("onboarding.whereFrom")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" aria-hidden="true" />
                  <Input
                    id="location"
                    type="text"
                    placeholder={t("onboarding.locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
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
              {t("onboarding.whatDoYouMake")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("onboarding.pickAll")}
            </p>

            <div className="flex flex-wrap gap-2.5" role="group" aria-label={t("onboarding.yourSkills")}>
              {SKILL_OPTIONS.map((opt) => {
                const selected = skills.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setSkills(
                        selected
                          ? skills.filter((s) => s !== opt.value)
                          : [...skills, opt.value],
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
                    {t(opt.key)}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              {t("onboarding.optionalSkip")}
            </p>
          </div>
        )}

        {step === 2 && role === "buyer" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              {t("onboarding.whatInterestsYou")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("onboarding.showRelevant")}
            </p>

            <div className="flex flex-wrap gap-2.5" role="group" aria-label={t("onboarding.yourInterests")}>
              {INTEREST_OPTIONS.map((opt) => {
                const selected = interests.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setInterests(
                        selected
                          ? interests.filter((i) => i !== opt.value)
                          : [...interests, opt.value],
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
                    {t(opt.key)}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              {t("onboarding.optionalSkip")}
            </p>
          </div>
        )}

        {step === 2 && role === "ngo" && (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              {t("onboarding.organisationTitle")}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("onboarding.organisationDesc")}
            </p>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="ngoName">{t("onboarding.orgName")}</Label>
                <Input
                  id="ngoName"
                  type="text"
                  placeholder={t("onboarding.orgNamePlaceholder")}
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, ngoName: true }))}
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
                <Label>{t("onboarding.focusAreas")}</Label>
                <div
                  className="flex flex-wrap gap-2.5"
                  role="group"
                  aria-label={t("onboarding.focusAreas")}
                  onBlur={() => setTouched((prev) => ({ ...prev, focusArea: true }))}
                >
                  {SKILL_OPTIONS.map((opt) => {
                    const selected = focusArea.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setFocusArea(
                            selected
                              ? focusArea.filter((s) => s !== opt.value)
                              : [...focusArea, opt.value],
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
                        {t(opt.key)}
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
                <Label htmlFor="districtCoverage">{t("onboarding.districtsCovered")} <span className="text-muted-foreground font-normal">({t("onboarding.optional")})</span></Label>
                <Input
                  id="districtCoverage"
                  type="text"
                  placeholder={t("onboarding.districtsPlaceholder")}
                  value={districtCoverage}
                  onChange={(e) => setDistrictCoverage(e.target.value)}
                  className="h-14 rounded-2xl px-5 text-lg bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-border placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="womenServed">{t("onboarding.womenServed")} <span className="text-muted-foreground font-normal">({t("onboarding.optional")})</span></Label>
                <Input
                  id="womenServed"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder={t("onboarding.womenServedPlaceholder")}
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
            ? t("onboarding.saving")
            : step === 2
              ? t("onboarding.getStarted")
              : t("onboarding.continue")}
          {!submitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg py-1"
          >
            {t("onboarding.goBack")}
          </button>
        )}

        <button
          onClick={() => handleFinish(true)}
          disabled={submitting}
          className="mt-3 w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1 disabled:opacity-40"
        >
          {t("onboarding.skipForNow")}
        </button>
      </div>
    </div>
  );
}
