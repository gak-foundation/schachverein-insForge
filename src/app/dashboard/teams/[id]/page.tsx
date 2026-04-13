import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getTeamById, getTeamMembers, getMatches } from "@/lib/actions/teams";
import { getMemberById } from "@/lib/actions/members";
import { db } from "@/lib/db";
import { teams, members, matches, seasons } from "@/lib/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Swords,
  Users,
  Calendar,
  Crown,
  ChevronLeft,
  Trophy,
  MapPin,
  Target
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Mannschaft",
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  const canEdit = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.TEAMS_WRITE);
  const [teamMembers, captain, teamMatches] = await Promise.all([
    getTeamMembers(id),
    team.captainId ? getMemberById(team.captainId) : Promise.resolve(null),
    db.select({
      id: matches.id,
      matchDate: matches.matchDate,
      location: matches.location,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
      homeTeamName: teams.name,
    })
    .from(matches)
    .innerJoin(teams, or(eq(matches.homeTeamId, teams.id), eq(matches.awayTeamId, teams.id)))
    .where(or(eq(matches.homeTeamId, id), eq(matches.awayTeamId, id)))
    .orderBy(desc(matches.matchDate))
    .limit(10)
  ]);

  const avgDwz = teamMembers.length > 0
    ? Math.round(teamMembers.filter(m => m.member.dwz).reduce((sum, m) => sum + (m.member.dwz || 0), 0) / teamMembers.filter(m => m.member.dwz).length) || 0
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teams" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span>Mannschaften</span>
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {team.league && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {team.league}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {canEdit && (
          <Link href={`/dashboard/teams/${id}/edit`}>
            <Button variant="outline">Bearbeiten</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700">Spieler</CardDescription>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">{teamMembers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Gemeldete Spieler</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-amber-700">Kapitän</CardDescription>
              <Crown className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">
              {captain ? `${captain.firstName} ${captain.lastName}` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-600">Mannschaftsführer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>DWZ-Ø</CardDescription>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">{avgDwz || "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Durchschnitt DWZ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Kämpfe</CardDescription>
              <Swords className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">{teamMatches.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Saison {new Date().getFullYear()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lineup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lineup" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Aufstellung
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-1">
            <Swords className="h-4 w-4" />
            Kämpfe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lineup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Brettaufstellung
              </CardTitle>
              <CardDescription>{teamMembers.length} Spieler</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Keine Spieler"
                  description="Noch keine Spieler dieser Mannschaft zugeordnet."
                />
              ) : (
                   <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Typ</TableHead>
                      <TableHead>Spieler</TableHead>
                      <TableHead className="text-right">DWZ</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers
                      .sort((a, b) => (a.member.dwz ?? 0) - (b.member.dwz ?? 0))
                      .map((tm) => (
                        <TableRow key={tm.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {tm.isRegular ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                Stamm
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                                Ers
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard/members/${tm.memberId}`} className="hover:underline font-medium">
                              {tm.member.firstName} {tm.member.lastName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {tm.member.dwz ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tm.isRegular ? "default" : "secondary"} className="text-xs">
                              {tm.isRegular ? "Stammspieler" : "Ersatz"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-blue-500" />
                Mannschaftskämpfe
              </CardTitle>
              <CardDescription>{teamMatches.length} Kämpfe</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMatches.length === 0 ? (
                <EmptyState
                  icon={Swords}
                  title="Keine Kämpfe"
                  description="Noch keine Mannschaftskämpfe für diese Saison."
                />
              ) : (
                <div className="space-y-2">
                  {teamMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-50 p-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{match.homeTeamName}</p>
                          <p className="text-sm text-gray-500">
                            {match.location || "Ort unbekannt"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {match.matchDate
                              ? new Date(match.matchDate).toLocaleDateString("de-DE", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "2-digit",
                                })
                              : "TBA"}
                          </p>
                          <Badge
                            variant={match.status === "completed" ? "default" : "outline"}
                            className="text-xs mt-1"
                          >
                            {match.status === "completed" ? "Abgeschlossen" : "Geplant"}
                          </Badge>
                        </div>
                        {match.homeScore !== null && match.awayScore !== null && (
                          <div className="px-3 py-2 rounded-lg bg-gray-100 font-mono font-bold text-sm">
                            {match.homeScore} : {match.awayScore}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}