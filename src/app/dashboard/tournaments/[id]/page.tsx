import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getTournamentById, getTournamentParticipants, addTournamentParticipantForm, removeTournamentParticipantForm } from "@/features/tournaments/actions";
import { getGames } from "@/features/tournaments/games-actions";
import { getMembersForForms, getMemberById } from "@/features/members/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Users,
  Crown,
  Hash,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import { TRFImportDialog } from "@/features/tournaments/components/trf-import-dialog";
import { TRFExportButton } from "@/features/tournaments/components/trf-export-button";
import { GameResultDialog } from "@/features/tournaments/components/game-result-dialog";
import { GenerateRoundsDialog } from "@/features/tournaments/components/generate-rounds-dialog";
import { CrossTableDialog } from "@/features/tournaments/components/cross-table-dialog";
import { generateCrossTable } from "@/lib/pairings/round-robin";

const typeLabels: Record<string, string> = {
  swiss: "Schweizer System",
  round_robin: "Rundenturnier",
  rapid: "Schnellschach",
  blitz: "Blitz",
  team_match: "Mannschaftskampf",
  club_championship: "Vereinsmeisterschaft",
};

export const metadata = {
  title: "Turnier",
};

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const [tournament, participants, allGames, allMembers] = await Promise.all([
    getTournamentById(id),
    getTournamentParticipants(id),
    getGames({ tournamentId: id }),
    getMembersForForms(),
  ]);

  if (!tournament) {
    notFound();
  }

  // Fetch player details for games
  const gamePlayerIds = new Set<string>();
  allGames.forEach((game: any) => {
    if (game.whiteId) gamePlayerIds.add(game.whiteId);
    if (game.blackId) gamePlayerIds.add(game.blackId);
  });
  
  const gamePlayers = await Promise.all(
    Array.from(gamePlayerIds).map(async (playerId) => {
      try {
        return await getMemberById(playerId);
      } catch {
        return null;
      }
    })
  );
  
  const playerMap = new Map(
    gamePlayers.filter((p): p is NonNullable<typeof p> => p !== null).map(p => [p.id, p])
  );

  const canEdit = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.TOURNAMENTS_WRITE,
    session.user.isSuperAdmin
  );

  // Generate cross table data for round-robin tournaments
  let crossTableData = null;
  if ((tournament.type === "round_robin" || tournament.type === "club_championship") && allGames.length > 0) {
    const rrParticipants = participants.map((p: any) => ({
      id: p.memberId,
      name: `${p.member.firstName} ${p.member.lastName}`,
    }));
    
    const gamesWithResults = allGames
      .filter((g: any) => g.result && g.whiteId && g.blackId)
      .map((g: any) => ({
        whiteId: g.whiteId!,
        blackId: g.blackId!,
        result: g.result as "1-0" | "0-1" | "1/2-1/2" | null,
      }));
    
    if (gamesWithResults.length > 0) {
      crossTableData = generateCrossTable(rrParticipants, gamesWithResults);
    }
  }

  const resultLabels: Record<string, string> = {
    "1-0": "1-0",
    "0-1": "0-1",
    "1/2-1/2": "Remis",
    "+-": "+- (Weiss kampflos)",
    "-+": "-+ (Schwarz kampflos)",
    "+/+": "+/+ (beide kampflos)",
  };

  const gamesByRound = allGames.reduce((acc: any, game: any) => {
    if (game.round === null) return acc;
    if (!acc[game.round]) acc[game.round] = [];
    acc[game.round].push(game);
    return acc;
  }, {} as Record<number, typeof allGames>);

  const sortedRounds = Object.keys(gamesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const sortedParticipants = [...participants].sort((a, b) => {
    return parseFloat(b.score || "0") - parseFloat(a.score || "0");
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <Link 
              href="/dashboard/tournaments" 
              className="flex items-center gap-1 transition-colors hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Turniere</span>
            </Link>
            <span className="hidden h-4 w-px bg-gray-300 sm:block" />
            <span>Detailansicht</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tournament.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {typeLabels[tournament.type] ?? tournament.type}
              </Badge>
              {tournament.isCompleted ? (
                <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800">Aktiv</Badge>
              )}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2 rounded-xl border bg-gray-50 p-3">
            <TRFImportDialog tournamentId={id} />
            <TRFExportButton tournamentId={id} />
            {(tournament.type === "round_robin" || tournament.type === "club_championship") && (
              <>
                <GenerateRoundsDialog tournamentId={id} participantCount={participants.length} />
                {crossTableData && (
                  <CrossTableDialog 
                    entries={crossTableData} 
                    participantNames={participants.map((p: any) => `${p.member.firstName} ${p.member.lastName}`)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700">Teilnehmer</CardDescription>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">{participants.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Registrierte Spieler</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-700">Partien</CardDescription>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">{allGames.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">Gespielte Runden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Runden</CardDescription>
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">{tournament.numberOfRounds ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Geplante Runden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Zeitkontrolle</CardDescription>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">{tournament.timeControl ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Min+Sek/Zug</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Turnier-Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Beginn</dt>
                <dd className="font-medium">{new Date(tournament.startDate).toLocaleDateString("de-DE")}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Ende</dt>
                <dd className="font-medium">{tournament.endDate ? new Date(tournament.endDate).toLocaleDateString("de-DE") : "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Ort</dt>
                <dd className="font-medium">{tournament.location ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">Bedenkzeit</dt>
                <dd className="font-medium">{tournament.timeControl ?? "—"}</dd>
              </div>
            </div>
          </dl>
          {tournament.description && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Beschreibung</dt>
              <dd className="text-gray-700 whitespace-pre-wrap">{tournament.description}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="standings" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="standings" className="flex items-center gap-1 rounded-full border bg-white px-4 py-2">
            <Crown className="h-4 w-4" />
            Rangliste
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-1 rounded-full border bg-white px-4 py-2">
            <Trophy className="h-4 w-4" />
            Partien
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-1 rounded-full border bg-white px-4 py-2">
            <Users className="h-4 w-4" />
            Teilnehmer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Rangliste
                  </CardTitle>
                  <CardDescription>{participants.length} Spieler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedParticipants.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-gray-500">
                  <p>Noch keine Teilnehmer.</p>
                  {canEdit && <p className="mt-2 text-sm">Füge zuerst Spieler im Tab „Teilnehmer“ hinzu.</p>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">Platz</th>
                        <th className="py-3 px-4 text-left font-medium">Spieler</th>
                        <th className="py-3 px-4 text-right font-medium">DWZ</th>
                        <th className="py-3 px-4 text-right font-medium">Punkte</th>
                        <th className="py-3 px-4 text-right font-medium">Buchholz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedParticipants.map((p, idx) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {idx === 0 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">1</span>
                            ) : idx === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-sm">2</span>
                            ) : idx === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">3</span>
                            ) : (
                              <span className="text-gray-500 font-medium">{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Link href={`/dashboard/members/${p.memberId}`} className="hover:underline font-medium">
                              {p.member.firstName} {p.member.lastName}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">{p.member.dwz ?? "—"}</td>
                          <td className="py-3 px-4 text-right tabular-nums font-semibold">{p.score ?? "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                Partien
              </CardTitle>
              <CardDescription>{allGames.length} Partien erfasst</CardDescription>
            </CardHeader>
            <CardContent>
              {allGames.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-gray-500">
                  <p>Noch keine Partien erfasst.</p>
                  {canEdit && <p className="mt-2 text-sm">Erzeuge zuerst Runden oder importiere Ergebnisse.</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedRounds.map((round) => (
                    <div key={round}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {round}
                        </span>
                        Runde {round}
                      </h4>
                      <div className="space-y-2">
                        {gamesByRound[round]
                          .sort((a: any, b: any) => (a.boardNumber || 0) - (b.boardNumber || 0))
                          .map((game: any) => (
                          <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                              <span className="text-xs text-gray-400 font-medium w-8">Brett {game.boardNumber ?? "—"}</span>
                              <div className="flex-1 text-left">
                                {(() => {
                                  const player = game.whiteId ? playerMap.get(game.whiteId) : null;
                                  return player ? (
                                    <Link href={`/dashboard/members/${game.whiteId}`} className="font-medium hover:underline">
                                      {player.firstName} {player.lastName}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-gray-400">—</span>
                                  );
                                })()}
                                <span className="text-gray-400 mx-2">(Weiss)</span>
                              </div>
                              <div className="px-3 py-1 rounded bg-gray-100">
                                {game.result ? (
                                  <span className="font-mono font-semibold text-sm">{resultLabels[game.result] ?? game.result}</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">offen</span>
                                )}
                              </div>
                              <div className="flex-1 text-right">
                                {(() => {
                                  const player = game.blackId ? playerMap.get(game.blackId) : null;
                                  return player ? (
                                    <Link href={`/dashboard/members/${game.blackId}`} className="font-medium hover:underline">
                                      {player.firstName} {player.lastName}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-gray-400">—</span>
                                  );
                                })()}
                                <span className="text-gray-400 mx-2">(Schwarz)</span>
                              </div>
                            </div>
                            {canEdit && (
                              <GameResultDialog
                                gameId={game.id}
                                whiteName={(() => {
                                  const player = game.whiteId ? playerMap.get(game.whiteId) : null;
                                  return player ? `${player.firstName} ${player.lastName}` : "Unbekannt";
                                })()}
                                blackName={(() => {
                                  const player = game.blackId ? playerMap.get(game.blackId) : null;
                                  return player ? `${player.firstName} ${player.lastName}` : "Unbekannt";
                                })()}
                                currentResult={game.result}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Teilnehmer
                  </CardTitle>
                  <CardDescription>{participants.length} Spieler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {canEdit && (
                <form action={addTournamentParticipantForm} className="mb-6 flex gap-2 items-end">
                  <input type="hidden" name="tournamentId" value={id} />
                  <div className="flex-1">
                    <Label htmlFor="memberId">Spieler hinzufuegen</Label>
                    <select
                      id="memberId"
                      name="memberId"
                      className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Spieler auswaehlen...</option>
                      {allMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName} {m.dwz ? `(DWZ ${m.dwz})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="sm">Hinzufuegen</Button>
                </form>
              )}

              {participants.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-gray-500">
                  <p>Noch keine Teilnehmer.</p>
                  {canEdit && <p className="mt-2 text-sm">Lege jetzt das Teilnehmerfeld für dieses Turnier an.</p>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium">Spieler</th>
                        <th className="py-3 px-4 text-right font-medium">DWZ</th>
                        <th className="py-3 px-4 text-right font-medium">Elo</th>
                        {canEdit && <th className="py-3 px-4 text-right font-medium">Aktionen</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Link href={`/dashboard/members/${p.memberId}`} className="hover:underline font-medium">
                              {p.member.firstName} {p.member.lastName}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">{p.member.dwz ?? "—"}</td>
                          <td className="py-3 px-4 text-right tabular-nums">—</td>
                          {canEdit && (
                            <td className="py-3 px-4 text-right">
                              <form action={removeTournamentParticipantForm}>
                                <input type="hidden" name="tournamentId" value={id} />
                                <input type="hidden" name="participantId" value={p.id} />
                                <button type="submit" className="text-red-600 hover:text-red-800 text-xs">Entfernen</button>
                              </form>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}