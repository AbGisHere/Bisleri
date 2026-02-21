import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MessagesClient from "./messages-client";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return <MessagesClient session={session} />;
}
