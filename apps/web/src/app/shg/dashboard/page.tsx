import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import ShgDashboard from "./shg-dashboard";

export default async function ShgDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <ShgDashboard session={session} />;
}
