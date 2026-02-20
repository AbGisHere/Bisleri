import { auth } from "@bisleri/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Onboarding from "./onboarding";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  return <Onboarding userName={session.user.name} />;
}
