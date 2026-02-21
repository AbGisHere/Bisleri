import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ConnectClient from "./connect-client";

export default async function ConnectPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return <ConnectClient session={session} />;
}
