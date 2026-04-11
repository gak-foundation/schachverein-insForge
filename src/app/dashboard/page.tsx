import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Trophy, 
  Swords, 
  Wallet, 
  Target, 
  CalendarDays, 
  Plus,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats();
  const firstName = session.user.name?.split(" ")[0] ?? "Mitglied";
  const canWriteMembers = hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE);
  const canWriteTournaments = hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.TOURNAMENTS_WRITE);
  const canWriteTeams = hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.TEAMS_WRITE);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen, {firstName}!
        </h1>
        <p className="mt-1 text-gray-500">
          Hier ist dein Ueberblick ueber den Verein.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/members">
          <Card className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Mitglieder</CardDescription>
                <Users className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl">{stats.memberCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Aktive Mitglieder</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/teams">
          <Card className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Mannschaften</CardDescription>
                <Swords className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl">{stats.teamCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Aktuelle Saison</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/tournaments">
          <Card className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Aktive Turniere</CardDescription>
                <Trophy className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl">{stats.activeTournaments}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Laufende Turniere</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/finance">
          <Card className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Offene Beitraege</CardDescription>
                <Wallet className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-3xl">{stats.pendingPayments}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Ausstehende Zahlungen</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700">DWZ-Durchschnitt</CardDescription>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl text-blue-900">{stats.avgDwz || "-"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Aktive Mitglieder mit DWZ</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-700">Spiele diesen Monat</CardDescription>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl text-emerald-900">{stats.gamesThisMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">Erfasste Partien</p>
          </CardContent>
        </Card>
      </div>

      {(canWriteMembers || canWriteTournaments || canWriteTeams) && (
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>Haeufige Aufgaben</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {canWriteMembers && (
                <Link href="/dashboard/members/new">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Mitglied anlegen
                  </Button>
                </Link>
              )}
              {canWriteTournaments && (
                <Link href="/dashboard/tournaments/new">
                  <Button variant="outline" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Turnier erstellen
                  </Button>
                </Link>
              )}
              {canWriteTeams && (
                <Link href="/dashboard/teams/new">
                  <Button variant="outline" className="gap-2">
                    <Swords className="h-4 w-4" />
                    Mannschaft erstellen
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.upcomingMatches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <CardTitle>Naechste Mannschaftskaempfe</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.upcomingMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">{match.homeTeamName}</p>
                    {match.location && (
                      <p className="text-sm text-gray-500">{match.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium">
                      {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      }) : "TBA"}
                    </p>
                    <Link href={`/dashboard/teams`}>
                      <ChevronRight className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <CardTitle>Kommende Veranstaltungen</CardTitle>
            </div>
            <CardDescription>Naechste Termine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(event.startDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{event.eventType}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Deine Rolle</CardTitle>
          <CardDescription>Deine Berechtigungen im System</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {session.user.role}
            </span>
            <span className="text-sm text-gray-500">
              {session.user.permissions.length} Berechtigung(en)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}