import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getClubGames } from "@/lib/actions/pgn-cloud";
import { GamesPageClient } from "./games-page-client";

export const metadata = {
  title: "Partie-Archiv",
};

export default async function GamesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const games = await getClubGames();

  return <GamesPageClient games={games} />;
}
