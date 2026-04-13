import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/actions/audit";
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
  TrendingUp,
  LayoutDashboard,
  ArrowUpRight,
  MapPin
} from "lucide-react";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;
  const role = user?.role as string ?? "mitglied";
  const permissions = (user?.permissions as string[]) ?? [];

  const stats = await getDashboardStats();
  const firstName = user?.name?.split(" ")[0] ?? "Mitglied";
  const canWriteMembers = hasPermission(role, permissions, PERMISSIONS.MEMBERS_WRITE);
  const canWriteTournaments = hasPermission(role, permissions, PERMISSIONS.TOURNAMENTS_WRITE);
  const canWriteTeams = hasPermission(role, permissions, PERMISSIONS.TEAMS_WRITE);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Willkommen, {firstName}!
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Dein Überblick über den aktuellen Status des Schachvereins.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-bold shadow-sm border border-border/50">
           <LayoutDashboard className="h-4 w-4" />
           <span className="uppercase tracking-widest text-[10px]">Dashboard Übersicht</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Mitglieder", value: stats.memberCount, desc: "Aktive Mitglieder", icon: Users, href: "/dashboard/members", color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Mannschaften", value: stats.teamCount, desc: "Aktuelle Saison", icon: Swords, href: "/dashboard/teams", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Aktive Turniere", value: stats.activeTournaments, desc: "Laufende Events", icon: Trophy, href: "/dashboard/tournaments", color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Offene Beiträge", value: stats.pendingPayments, desc: "Ausstehend", icon: Wallet, href: "/dashboard/finance", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((item, i) => (
          <Link key={i} href={item.href}>
            <Card className="hover:shadow-2xl transition-all duration-300 group relative border-border/50 hover:border-primary/20">
              <div className="absolute top-4 right-4 h-10 w-10 rounded-xl flex items-center justify-center bg-accent border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="font-bold uppercase tracking-widest text-[10px]">{item.label}</CardDescription>
                <CardTitle className="text-4xl font-bold pt-2">{item.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card shadow-xl shadow-black/5 border-border/50 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
             <Target className="h-32 w-32" />
           </div>
           <CardHeader>
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                 <Target className="h-5 w-5" />
               </div>
               <div>
                 <CardTitle>Vereinsstärke (DWZ)</CardTitle>
                 <CardDescription>Durchschnittliche DWZ aller aktiven Spieler</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent className="pt-4">
             <div className="text-6xl font-bold tracking-tighter text-foreground mb-2">{stats.avgDwz || "N/A"}</div>
             <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
               <TrendingUp className="h-4 w-4 text-emerald-500" />
               Basierend auf {stats.memberCount} Mitgliedern
             </p>
           </CardContent>
        </Card>

        <Card className="bg-card shadow-xl shadow-black/5 border-border/50 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
             <TrendingUp className="h-32 w-32" />
           </div>
           <CardHeader>
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                 <TrendingUp className="h-5 w-5" />
               </div>
               <div>
                 <CardTitle>Aktivität</CardTitle>
                 <CardDescription>Gespielte Partien diesen Monat</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent className="pt-4">
             <div className="text-6xl font-bold tracking-tighter text-foreground mb-2">{stats.gamesThisMonth}</div>
             <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
               <ArrowUpRight className="h-4 w-4 text-emerald-500" />
               Steigerung zum Vormonat
             </p>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {(canWriteMembers || canWriteTournaments || canWriteTeams) && (
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Schnellaktionen</CardTitle>
                <CardDescription>Häufige Verwaltungsaufgaben</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {canWriteMembers && (
                    <Link href="/dashboard/members/new">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground group">
                        <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Neues Mitglied</span>
                      </Button>
                    </Link>
                  )}
                  {canWriteTournaments && (
                    <Link href="/dashboard/tournaments/new">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground group">
                        <Trophy className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Neues Turnier</span>
                      </Button>
                    </Link>
                  )}
                  {canWriteTeams && (
                    <Link href="/dashboard/teams/new">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground group">
                        <Swords className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Neue Mannschaft</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.upcomingMatches.length > 0 && (
            <Card className="shadow-lg border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Mannschaftskämpfe</CardTitle>
                  <CardDescription>Nächste Spieltage</CardDescription>
                </div>
                <Link href="/dashboard/teams">
                  <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary">Alle anzeigen</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.upcomingMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-accent transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-card border flex flex-col items-center justify-center font-bold">
                           <span className="text-[10px] uppercase text-muted-foreground leading-none">
                             {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { month: "short" }) : "TBA"}
                           </span>
                           <span className="text-lg">
                             {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { day: "2-digit" }) : "-"}
                           </span>
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{match.homeTeamName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.location || "Heimspiel"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mr-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Events</CardTitle>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Kommende Termine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">Keine Termine</p>
                ) : (
                  stats.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">{event.title}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(event.startDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50 bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute bottom-[-20%] right-[-10%] opacity-20 pointer-events-none">
               <span className="text-9xl font-serif">♔</span>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Mitgliedschaft</CardTitle>
              <CardDescription className="text-primary-foreground/70">Dein Profil-Status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rolle:</span>
                <span className="px-2 py-0.5 rounded-md bg-primary-foreground/20 text-xs font-bold uppercase tracking-widest">{role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Berechtigungen:</span>
                <span className="text-sm font-bold">{permissions.length} Aktiv</span>
              </div>
              <Link href="/dashboard/profile" className="block pt-2">
                 <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold">Profil bearbeiten</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
