"use client";

import { Swords, Trophy, ClipboardList, Target, RefreshCw } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { TodayItems } from "../components/today-items";
import { QuickActions } from "../components/quick-actions";
import { UpcomingMatches } from "../components/upcoming-matches";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { ClubStrengthCard } from "../components/club-strength-card";
import { QuickActionsBar } from "../components/quick-actions-bar";

export function SpielleiterDashboard({ stats, user }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Spielleiter";
  const role = (user?.role as string) ?? "spielleiter";
  const permissions = (user?.permissions as string[]) ?? [];

  const todayItems = [
    {
      label: "Nächste Kämpfe",
      value: String(stats.upcomingMatches.length),
      hint: stats.upcomingMatches.length > 0 ? "Termine im Blick behalten" : "Keine offenen Spieltage",
      href: "/dashboard/teams",
      icon: Swords,
      tone: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Laufende Turniere",
      value: String(stats.activeTournaments),
      hint: stats.activeTournaments > 0 ? "Ergebnisse aktualisieren" : "Derzeit nichts offen",
      href: "/dashboard/tournaments",
      icon: Trophy,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Partien diesen Monat",
      value: String(stats.gamesThisMonth),
      hint: "Spielbetrieb im Überblick",
      href: "/dashboard/games",
      icon: ClipboardList,
      tone: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Sportlicher Überblick – Mannschaften, Turniere und Partien." roleLabel="Spielleiter" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Mannschaften" value={stats.teamCount} desc="Aktuelle Saison" icon={Swords} href="/dashboard/teams" />
        <StatsCard label="Aktive Turniere" value={stats.activeTournaments} desc="Laufende Events" icon={Trophy} href="/dashboard/tournaments" />
        <StatsCard label="Partien" value={stats.gamesThisMonth} desc="Diesen Monat" icon={ClipboardList} href="/dashboard/games" />
        <StatsCard label="DWZ-Schnitt" value={stats.avgDwz ?? "N/A"} desc="Vereinsstärke" icon={Target} href="/dashboard/teams" />
      </div>

      <TodayItems items={todayItems} />

      <ClubStrengthCard avgDwz={stats.avgDwz} memberCount={stats.memberCount} />

      <QuickActions
        actions={[
          { label: "Neues Turnier", href: "/dashboard/tournaments/new", icon: Trophy },
          { label: "Neue Mannschaft", href: "/dashboard/teams/new", icon: Swords },
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
        { label: "DWZ-Sync starten", icon: RefreshCw, href: "/dashboard/members" },
        { label: "Turnier anlegen", icon: Trophy, href: "/dashboard/tournaments/new" },
      ]} />
    </div>
  );
}
