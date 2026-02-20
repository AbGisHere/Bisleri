import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  const role = session.user.role || "seller";
  const target =
    role === "buyer"
      ? "/buyer/dashboard"
      : role === "shg"
        ? "/shg/dashboard"
        : "/seller/dashboard";
  redirect(target);
}
