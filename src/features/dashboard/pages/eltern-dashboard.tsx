import { CalendarDays, Shield, Trophy, Calendar, Users, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { QuickActionsBar } from "../components/quick-actions-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ElternDashboard({ stats, user }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Elternteil";
  const role = (user?.role as string) ?? "eltern";
  const permissions = (user?.permissions as string[]) ?? [];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Übersicht zu den Aktivitäten deiner Kinder." roleLabel="Eltern" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard label="Mannschaften" value={stats.teamCount} desc="Aktuelle Saison" icon={Shield} href="/dashboard/teams" />
        <StatsCard label="Turniere" value={stats.activeTournaments} desc="Laufende Events" icon={Trophy} href="/dashboard/tournaments" />
        <StatsCard label="Nächste Termine" value={stats.upcomingEvents.length} desc="Bevorstehend" icon={CalendarDays} href="/dashboard/calendar" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <UpcomingEvents events={stats.upcomingEvents} />
        </div>
        <div className="space-y-8">
          <MembershipCard role={role} permissionsCount={permissions.length} />
        </div>
      </div>

      <QuickActionsBar actions={[
        { label: "Verfügbarkeit melden", icon: Calendar, href: "/dashboard/teams" },
      ]} />

      {stats.children && stats.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Meine Kinder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {stats.children.map((child: any) => (
                <Link
                  key={child.id}
                  href={`/dashboard/members/${child.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-3 px-3 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{child.firstName} {child.lastName}</span>
                    <Badge variant="secondary" className="text-xs">{child.role || "Mitglied"}</Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
