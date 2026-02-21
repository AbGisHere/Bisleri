import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import WorkshopsClient from "./workshops-client";

export default async function WorkshopsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return <WorkshopsClient session={session} />;
}
