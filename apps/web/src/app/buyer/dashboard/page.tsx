import { auth } from "@bisleri/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import BuyerDashboard from "./buyer-dashboard";

export default async function BuyerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <BuyerDashboard session={session} />;
}
