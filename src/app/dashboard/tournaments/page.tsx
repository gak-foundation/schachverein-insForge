import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTournaments } from "@/features/tournaments/actions";
import { TournamentsPageClient } from "./tournaments-page-client";

export const metadata = {
  title: "Turniere",
};

export default async function TournamentsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const allTournaments = await getTournaments();

  return <TournamentsPageClient tournaments={allTournaments} />;
}
