import { CalendarDays, Shield, Trophy, Calendar } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { QuickActionsBar } from "../components/quick-actions-bar";

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
    </div>
  );
}
