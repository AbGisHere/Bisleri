import { auth } from "@bisleri/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SellerDashboard from "./seller-dashboard";

export default async function SellerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <SellerDashboard session={session} />;
}
