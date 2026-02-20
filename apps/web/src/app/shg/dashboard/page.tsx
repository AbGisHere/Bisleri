import { auth } from "@bisleri/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import ShgDashboard from "./shg-dashboard";

export default async function ShgDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <ShgDashboard session={session} />;
}
