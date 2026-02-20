import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BuyerNgosClient from "./page-client";

export default async function BuyerNgosPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return <BuyerNgosClient />;
}
