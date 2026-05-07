"use client";

import { useState } from "react";
import {
  Users,
  Trophy,
  Swords,
  Wallet,
  Calendar,
  ChevronRight,
  TrendingUp,
  Plus,
  Search,
  Bell,
  Settings,
  Menu,
  Crown,
  MapPin,
  Clock,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "members", label: "Mitglieder", icon: <Users className="h-4 w-4" /> },
  { id: "teams", label: "Mannschaften", icon: <Swords className="h-4 w-4" /> },
  { id: "tournaments", label: "Turniere", icon: <Trophy className="h-4 w-4" /> },
  { id: "finance", label: "Finanzen", icon: <Wallet className="h-4 w-4" /> },
  { id: "calendar", label: "Kalender", icon: <Calendar className="h-4 w-4" /> },
];

export function MiniManager() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "members":
        return <MembersView />;
      case "teams":
        return <TeamsView />;
      case "tournaments":
        return <TournamentsView />;
      case "finance":
        return <FinanceView />;
      case "calendar":
        return <CalendarView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="relative bg-card border-4 border-slate-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-slate-100 border-b px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 flex items-center gap-2 min-w-[200px] justify-center">
            <span className="opacity-50">🔒</span>
            schach.studio/dashboard
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1 hover:bg-slate-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex min-h-[480px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-56 bg-slate-50 border-r flex-col",
            isMobileMenuOpen
              ? "flex absolute inset-y-0 left-0 z-20 bg-slate-50 shadow-2xl"
              : "hidden lg:flex"
          )}
        >
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                ♔
              </div>
              <div>
                <div className="font-bold text-sm">SC Beispiel</div>
                <div className="text-[10px] text-slate-500">Vereins-Manager</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                MV
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">Max Vorstand</div>
                <div className="text-[10px] text-slate-500">Vorsitzender</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 bg-background overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === "dashboard" && "Übersicht deines Vereins"}
                {activeTab === "members" && "42 aktive Mitglieder"}
                {activeTab === "teams" && "3 Mannschaften in 2 Ligen"}
                {activeTab === "tournaments" && "1 laufendes Turnier"}
                {activeTab === "finance" && "€2.450 offene Beiträge"}
                {activeTab === "calendar" && "5 Termine diese Woche"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 hover:bg-slate-100 rounded-lg relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Benachrichtigungen"
              >
                <Bell className="h-4 w-4 text-slate-600" aria-hidden="true" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-slate-100 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Einstellungen"
              >
                <Settings className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

// Dashboard View
function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Mitglieder", value: "42", icon: Users, color: "bg-blue-500" },
          { label: "Mannschaften", value: "3", icon: Swords, color: "bg-indigo-500" },
          { label: "Aktive Turniere", value: "1", icon: Trophy, color: "bg-amber-500" },
          { label: "Offene Beiträge", value: "€2.450", icon: Wallet, color: "bg-emerald-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={cn("p-2 rounded-lg text-white", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Schnellaktionen
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {["Mitglied", "Turnier", "Mannschaft"].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="p-3 border rounded-lg hover:bg-slate-50 hover:border-primary/30 transition-all text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mx-auto mb-1 text-slate-400 group-hover:text-primary" aria-hidden="true" />
                  <span className="text-xs font-medium">{action}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Nächste Kämpfe</h3>
              <button
                type="button"
                className="text-xs text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Alle anzeigen
              </button>
            </div>
            <div className="space-y-3">
              {[
                { date: "24", month: "APR", home: "SC Beispiel 1", away: "SC Gegner", time: "14:00", location: "Vereinsheim" },
                { date: "28", month: "APR", home: "SC Gast", away: "SC Beispiel 2", time: "15:00", location: "Auswärts" },
              ].map((match) => (
                <div
                  key={match.date}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="h-12 w-12 bg-white rounded-lg border flex flex-col items-center justify-center font-bold">
                    <span className="text-[8px] uppercase text-slate-500">{match.month}</span>
                    <span className="text-lg leading-none">{match.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {match.home} vs {match.away}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {match.time}
                      <span className="mx-1">•</span>
                      <MapPin className="h-3 w-3" /> {match.location}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Club Strength */}
          <div className="bg-gradient-to-br from-primary to-indigo-600 text-white rounded-xl p-4 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <h3 className="font-bold text-sm">Vereinsstärke</h3>
              </div>
              <p className="text-4xl font-bold">1.847</p>
              <p className="text-xs text-white/70 mt-1">Ø DWZ aller Spieler</p>
            </div>
            <Crown className="absolute -bottom-2 -right-2 h-20 w-20 text-white/10" />
          </div>

          {/* Activity */}
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm">Aktivität</h3>
            </div>
            <p className="text-3xl font-bold">156</p>
            <p className="text-xs text-slate-500 mt-1">Partien diesen Monat</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12% zum Vormonat</span>
            </div>
          </div>

          {/* Next Event */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-sm text-amber-900 mb-2">Nächster Termin</h3>
            <p className="text-sm font-medium text-amber-800">Vereinsmeisterschaft Runde 3</p>
            <p className="text-xs text-amber-700 mt-1">Fr, 25. April • 19:00 Uhr</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Members View
function MembersView() {
  const members = [
    { name: "Klaus Schmidt", dwz: 1850, status: "aktiv", role: "Spieler" },
    { name: "Maria Weber", dwz: 1720, status: "aktiv", role: "Spieler" },
    { name: "Peter Müller", dwz: 2100, status: "aktiv", role: "Mannschaftsführer" },
    { name: "Sabine Klein", dwz: 1650, status: "ermäßigt", role: "Spieler" },
    { name: "Thomas Groß", dwz: null, status: "passiv", role: "Ehrenmitglied" },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <label htmlFor="member-search" className="sr-only">Mitglied suchen</label>
          <input
            id="member-search"
            type="text"
            placeholder="Mitglied suchen..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Mitglied hinzufügen"
          type="button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">DWZ</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-slate-600">Rolle</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3">{member.dwz || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      member.status === "aktiv" && "bg-emerald-100 text-emerald-700",
                      member.status === "ermäßigt" && "bg-blue-100 text-blue-700",
                      member.status === "passiv" && "bg-slate-100 text-slate-600"
                    )}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Teams View
function TeamsView() {
  const teams = [
    { name: "1. Mannschaft", league: "Bezirksliga", position: 3, games: "8/11", points: "12:4" },
    { name: "2. Mannschaft", league: "Kreisliga A", position: 1, games: "9/11", points: "14:4" },
    { name: "Jugendmannschaft", league: "Jugendliga", position: 2, games: "6/10", points: "10:6" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4 inline mr-2" aria-hidden="true" />
          Neue Mannschaft
        </button>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <div key={team.name} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{team.name}</h3>
                <p className="text-sm text-slate-500">{team.league}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{team.position}.</p>
                <p className="text-xs text-slate-500">Platz</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <span className="text-slate-600">
                  <span className="font-medium">{team.games}</span> Spiele
                </span>
                <span className="text-slate-600">
                  <span className="font-medium">{team.points}</span> Punkte
                </span>
              </div>
              <button
                type="button"
                className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tournaments View
function TournamentsView() {
  const tournaments = [
    { name: "Vereinsmeisterschaft 2025", type: "Schweizer System", rounds: "7/9", players: 24, status: "active" },
    { name: "Schnellschach-Open", type: "KO-System", rounds: "0/5", players: 16, status: "upcoming" },
    { name: "Blitzturnier 2024", type: "Schweizer System", rounds: "5/5", players: 18, status: "completed" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4 inline mr-2" aria-hidden="true" />
          Neues Turnier
        </button>
      </div>

      <div className="grid gap-4">
        {tournaments.map((t) => (
          <div key={t.name} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{t.name}</h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      t.status === "active" && "bg-emerald-100 text-emerald-700",
                      t.status === "upcoming" && "bg-blue-100 text-blue-700",
                      t.status === "completed" && "bg-slate-100 text-slate-600"
                    )}
                  >
                    {t.status === "active" ? "Laufend" : t.status === "upcoming" ? "Geplant" : "Beendet"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{t.type} • {t.players} Teilnehmer</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{t.rounds}</p>
                <p className="text-xs text-slate-500">Runden</p>
              </div>
            </div>
            {t.status === "active" && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Fortschritt</span>
                  <span>78%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-emerald-500 rounded-full" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Finance View
function FinanceView() {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Kontostand", value: "€8.240", color: "text-emerald-600" },
          { label: "Offen", value: "€2.450", color: "text-amber-600" },
          { label: "Überfällig", value: "€380", color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className={cn("text-xl font-bold mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-bold mb-3">Letzte Zahlungen</h3>
        <div className="space-y-3">
          {[
            { name: "Klaus Schmidt", amount: 120, date: "20.04.2025", status: "paid" },
            { name: "Maria Weber", amount: 60, date: "18.04.2025", status: "paid" },
            { name: "Peter Müller", amount: 120, date: "15.04.2025", status: "pending" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-slate-500">{p.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">€{p.amount}</p>
                <p
                  className={cn(
                    "text-xs",
                    p.status === "paid" ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {p.status === "paid" ? "✓ Bezahlt" : "⏳ Ausstehend"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEPA Export */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-indigo-900">SEPA-Export bereit</h3>
            <p className="text-xs text-indigo-700">12 Lastschriften für Mai 2025</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Exportieren
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar View
function CalendarView() {
  const events = [
    { title: "Training Abend", date: "Heute", time: "19:00", type: "training", icon: Target },
    { title: "Vereinsmeisterschaft Runde 3", date: "Fr, 25. Apr", time: "19:00", type: "tournament", icon: Trophy },
    { title: "1. Mannschaft vs SC Gegner", date: "So, 27. Apr", time: "14:00", type: "match", icon: Swords },
    { title: "Mitgliederversammlung", date: "Do, 01. Mai", time: "18:00", type: "meeting", icon: Users },
  ];

  const typeColors: Record<string, string> = {
    training: "bg-blue-500",
    tournament: "bg-amber-500",
    match: "bg-indigo-500",
    meeting: "bg-emerald-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4 inline mr-2" aria-hidden="true" />
          Termin anlegen
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white", typeColors[event.type])}>
              <event.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{event.title}</h3>
              <p className="text-xs text-slate-500">
                {event.date} • {event.time}
              </p>
            </div>
            {event.date === "Heute" && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">
                Heute
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Calendar Mini View */}
      <div className="bg-white border rounded-xl p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">April 2025</h3>
          <div className="flex gap-1">
            <button
              type="button"
              className="p-1 hover:bg-slate-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Vorheriger Monat"
            >
              ←
            </button>
            <button
              type="button"
              className="p-1 hover:bg-slate-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Nächster Monat"
            >
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <div key={d} className="py-1 font-bold text-slate-500">{d}</div>
          ))}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isToday = day === 21;
            const hasEvent = [21, 25, 27, 28].includes(day);
            return (
              <button
                key={day}
                type="button"
                className={cn(
                  "py-1.5 rounded relative hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isToday && "bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                )}
              >
                {day}
                {hasEvent && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-amber-500 rounded-full" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

