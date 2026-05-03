"use client";

import { Users, Swords, Trophy, Wallet, AlertCircle, CircleCheck, Mail, Calendar } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { TodayItems } from "../components/today-items";
import { QuickActions } from "../components/quick-actions";
import { UpcomingMatches } from "../components/upcoming-matches";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { ClubStrengthCard } from "../components/club-strength-card";
import { ActivityCard } from "../components/activity-card";
import { OnboardingBanner } from "../components/onboarding-banner";
import { EmptyState } from "../components/empty-state";
import { QuickActionsBar } from "../components/quick-actions-bar";

export function VorstandDashboard({ stats, user, club, onboardingCompleted }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Vorstand";
  const hasData = stats.memberCount > 0 || stats.upcomingEvents.length > 0;
  const role = (user?.role as string) ?? "vorstand";
  const permissions = (user?.permissions as string[]) ?? [];

  const todayItems = [
    {
      label: "Offene Beiträge",
      value: String(stats.pendingPayments),
      hint: stats.pendingPayments > 0 ? "Jetzt prüfen" : "Alles erledigt",
      href: "/dashboard/finance",
      icon: stats.pendingPayments > 0 ? AlertCircle : CircleCheck,
      tone: stats.pendingPayments > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50",
    },
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
  ];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Dein Überblick über den aktuellen Status des Schachvereins." roleLabel="Vorstand" />

      {!onboardingCompleted && (
        <OnboardingBanner
          hasEvents={stats.upcomingEvents.length > 0}
          hasMembers={stats.memberCount > 0}
          hasLogo={!!club?.logoUrl}
        />
      )}

      {!hasData && onboardingCompleted && <EmptyState memberCount={stats.memberCount} />}

      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 py-8 border-b border-border">
        <StatsCard label="Mitglieder" value={stats.memberCount} desc="Aktive Mitglieder" icon={Users} href="/dashboard/members" />
        <StatsCard label="Mannschaften" value={stats.teamCount} desc="Aktuelle Saison" icon={Swords} href="/dashboard/teams" />
        <StatsCard label="Aktive Turniere" value={stats.activeTournaments} desc="Laufende Events" icon={Trophy} href="/dashboard/tournaments" />
        <StatsCard label="Offene Beiträge" value={stats.pendingPayments} desc="Ausstehend" icon={Wallet} href="/dashboard/finance" />
      </div>

      <TodayItems items={todayItems} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <ClubStrengthCard avgDwz={stats.avgDwz} memberCount={stats.memberCount} />
        <ActivityCard gamesThisMonth={stats.gamesThisMonth} />
      </div>

      <QuickActions
        actions={[
          { label: "Neues Mitglied", href: "/dashboard/members/new", icon: Users },
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
        { label: "Mitteilung senden", icon: Mail, href: "/dashboard/kommunikation" },
        { label: "Neue Veranstaltung", icon: Calendar, href: "/dashboard/calendar/new" },
        { label: "Mitglieder verwalten", icon: Users, href: "/dashboard/members" },
      ]} />
    </div>
  );
}
