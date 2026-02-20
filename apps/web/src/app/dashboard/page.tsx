import { auth } from "@bisleri/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
