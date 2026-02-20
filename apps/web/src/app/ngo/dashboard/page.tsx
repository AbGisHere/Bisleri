import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import NgoDashboard from "./ngo-dashboard";

export default async function NgoDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <NgoDashboard session={session} />;
}
