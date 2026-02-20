import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import SellerDashboard from "./seller-dashboard";

export default async function SellerDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <SellerDashboard session={session} />;
}
