import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTeams } from "@/features/teams/actions";
import { getSeasons } from "@/features/calendar/actions";
import { TeamsPageClient } from "./teams-page-client";

export const metadata = {
  title: "Mannschaften",
};

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [allTeams, allSeasons] = await Promise.all([
    getTeams(),
    getSeasons(),
  ]);

  return <TeamsPageClient teams={allTeams} seasons={allSeasons} />;
}
