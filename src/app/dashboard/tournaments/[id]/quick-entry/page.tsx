import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/insforge";
import { MatrixResultEntry } from "@/features/tournaments/components/matrix-result-entry";
import { saveAllRoundResults } from "@/features/tournaments/actions";
import { Zap } from "lucide-react";

interface QuickEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuickEntryPage({ params }: QuickEntryPageProps) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const client = createServiceClient();

  const { data: tournament } = await client
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) notFound();

  const { data: participants } = await client
    .from("tournament_participants")
    .select("member_id, members(first_name, last_name, dwz)")
    .eq("tournament_id", id);

  const { data: games } = await client
    .from("games")
    .select("white_id, black_id, result, round")
    .eq("tournament_id", id);

  const currentRound = tournament.current_round || 1;

  const mappedParticipants = (participants || []).map((p: any) => ({
    memberId: p.member_id,
    firstName: p.members?.first_name || "",
    lastName: p.members?.last_name || "",
    dwz: p.members?.dwz ?? null,
  }));

  const existingPairings = (games || [])
    .filter((g: any) => g.round === currentRound)
    .map((g: any) => ({
      whiteId: g.white_id,
      blackId: g.black_id,
      result: g.result,
    }));

  async function handleSave(results: any[]) {
    "use server";
    await saveAllRoundResults(id, results);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <div>
            <h1 className="text-lg font-bold">Schnelleingabe</h1>
            <p className="text-sm text-muted-foreground">{tournament.name} &ndash; Runde {currentRound}</p>
          </div>
        </div>
      </header>
      <main className="p-4">
        {mappedParticipants.length < 2 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center text-muted-foreground">
            <p>Mindestens 2 Teilnehmer erforderlich.</p>
          </div>
        ) : (
          <MatrixResultEntry
            tournamentId={id}
            participants={mappedParticipants}
            round={currentRound}
            existingPairings={existingPairings}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
