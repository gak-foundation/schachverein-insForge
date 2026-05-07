import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSeasons } from "@/features/calendar/actions";
import { SeasonsPageClient } from "./seasons-page-client";

export const metadata = {
  title: "Saisons",
};

export default async function SeasonsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const allSeasons = await getSeasons();

  return <SeasonsPageClient seasons={allSeasons} />;
}
