import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ProgramsClient from "./programs-client";

export default async function ProgramsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return <ProgramsClient session={session} />;
}
