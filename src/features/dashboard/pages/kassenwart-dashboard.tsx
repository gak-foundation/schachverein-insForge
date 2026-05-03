import { Users, FileText, AlertCircle, CircleCheck, TrendingUp } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { TodayItems } from "../components/today-items";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { QuickActionsBar } from "../components/quick-actions-bar";

export function KassenwartDashboard({ stats, user }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Kassenwart";
  const role = (user?.role as string) ?? "kassenwart";
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
  ];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Finanzverwaltung – Beiträge, Ausgaben und Export." roleLabel="Kassenwart" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard label="Offene Beiträge" value={stats.pendingPayments} desc="Ausstehend" icon={AlertCircle} href="/dashboard/finance" />
        <StatsCard label="Mitglieder" value={stats.memberCount} desc="Aktive Mitglieder" icon={Users} href="/dashboard/members" />
        <StatsCard label="Belegprüfung" value={0} desc="Letzte Prüfung" icon={FileText} href="/dashboard/finance" />
      </div>

      <TodayItems items={todayItems} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <UpcomingEvents events={stats.upcomingEvents} />
        </div>
        <div className="space-y-8">
          <MembershipCard role={role} permissionsCount={permissions.length} />
        </div>
      </div>

      <QuickActionsBar actions={[
        { label: "Offene anmahnen", icon: TrendingUp, href: "/dashboard/finance" },
        { label: "SEPA-Export", icon: FileText, href: "/dashboard/finance" },
      ]} />
    </div>
  );
}
