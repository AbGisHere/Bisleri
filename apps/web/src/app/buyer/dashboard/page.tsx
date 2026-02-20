import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import BuyerDashboard from "./buyer-dashboard";

export default async function BuyerDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <BuyerDashboard session={session} />;
}
