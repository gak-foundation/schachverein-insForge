"use client";

import { Users, Swords, ClipboardList, Target, Calendar } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { QuickActions } from "../components/quick-actions";
import { UpcomingMatches } from "../components/upcoming-matches";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { ClubStrengthCard } from "../components/club-strength-card";
import { QuickActionsBar } from "../components/quick-actions-bar";

export function TrainerDashboard({ stats, user }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Trainer";
  const role = (user?.role as string) ?? "trainer";
  const permissions = (user?.permissions as string[]) ?? [];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Trainingsbetrieb – Kader, Partien und Spielanalyse." roleLabel="Trainer" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Mitglieder" value={stats.memberCount} desc="Aktive Spieler" icon={Users} href="/dashboard/members" />
        <StatsCard label="Mannschaften" value={stats.teamCount} desc="Aktuelle Saison" icon={Swords} href="/dashboard/teams" />
        <StatsCard label="Partien" value={stats.gamesThisMonth} desc="Diesen Monat" icon={ClipboardList} href="/dashboard/games" />
        <StatsCard label="DWZ-Schnitt" value={stats.avgDwz ?? "N/A"} desc="Mannschaftsstärke" icon={Target} href="/dashboard/teams" />
      </div>

      <ClubStrengthCard avgDwz={stats.avgDwz} memberCount={stats.memberCount} />

      <QuickActions
        actions={[
          { label: "Partieanalyse", href: "/dashboard/games", icon: ClipboardList },
          { label: "Mannschaft", href: "/dashboard/teams", icon: Swords },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <UpcomingMatches matches={stats.upcomingMatches} />
        </div>
        <div className="space-y-8">
          <UpcomingEvents events={stats.upcomingEvents} />
          <MembershipCard role={role} permissionsCount={permissions.length} />
        </div>
      </div>

      <QuickActionsBar actions={[
        { label: "Training anlegen", icon: Calendar, href: "/dashboard/calendar/new" },
        { label: "Mitgliederliste", icon: Users, href: "/dashboard/members" },
      ]} />
    </div>
  );
}
