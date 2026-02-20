import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import Onboarding from "./onboarding";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  return <Onboarding userName={session.user.name} />;
}
