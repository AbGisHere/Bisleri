import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ThreadClient from "./thread-client";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { userId } = await params;

  return <ThreadClient session={session} otherUserId={userId} />;
}
