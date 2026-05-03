import { Users, CalendarDays, ShieldCheck, Heart, Mail, Calendar } from "lucide-react";
import type { DashboardData } from "../index";
import { WelcomeHeader } from "../components/welcome-header";
import { StatsCard } from "../components/stats-card";
import { QuickActions } from "../components/quick-actions";
import { UpcomingEvents } from "../components/upcoming-events";
import { MembershipCard } from "../components/membership-card";
import { QuickActionsBar } from "../components/quick-actions-bar";

export function JugendwartDashboard({ stats, user }: DashboardData) {
  const firstName = user?.name?.split(" ")[0] ?? "Jugendwart";
  const role = (user?.role as string) ?? "jugendwart";
  const permissions = (user?.permissions as string[]) ?? [];

  return (
    <div className="space-y-10">
      <WelcomeHeader firstName={firstName} subtitle="Jugendbereich – Mitglieder, Einwilligungen und Notfallkontakte." roleLabel="Jugendwart" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Jugendliche" value={0} desc="Aktive Jugendmitglieder" icon={Users} href="/dashboard/members" />
        <StatsCard label="Komment Events" value={stats.upcomingEvents.length} desc="Bevorstehende Termine" icon={CalendarDays} href="/dashboard/calendar" />
        <StatsCard label="Einwilligungen" value={0} desc="Ausstehend" icon={ShieldCheck} href="/dashboard/admin/users" />
        <StatsCard label="Notfallkontakte" value={0} desc="Hinterlegt" icon={Heart} href="/dashboard/members" />
      </div>

      <QuickActions
        actions={[
          { label: "Jugendmitglied", href: "/dashboard/members/new", icon: Users },
          { label: "Jugend-Event", href: "/dashboard/calendar/new", icon: CalendarDays },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <UpcomingEvents events={stats.upcomingEvents} />
        </div>
        <div className="space-y-8">
          <MembershipCard role={role} permissionsCount={permissions.length} />
        </div>
      </div>

      <QuickActionsBar actions={[
        { label: "Eltern benachrichtigen", icon: Mail, href: "/dashboard/kommunikation" },
        { label: "Training planen", icon: Calendar, href: "/dashboard/calendar/new" },
      ]} />
    </div>
  );
}
