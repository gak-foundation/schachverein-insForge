"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Trophy,
  Swords,
  Wallet,
  Calendar,
  TrendingUp,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const demoData = {
  members: [
    { name: "Klaus Schmidt", dwz: 1850, status: "aktiv" },
    { name: "Maria Weber", dwz: 1720, status: "aktiv" },
    { name: "Peter Mueller", dwz: 2100, status: "aktiv" },
    { name: "Sabine Klein", dwz: 1650, status: "aktiv" },
    { name: "Thomas Gross", dwz: null, status: "passiv" },
  ],
  stats: {
    members: 42,
    teams: 3,
    tournaments: 1,
    pendingPayments: 3,
    avgDwz: 1847,
    gamesThisMonth: 156,
  },
  tournaments: [
    { name: "Vereinsmeisterschaft 2025", rounds: "3/7", players: 24 },
  ],
  events: [
    { title: "Training Abend", date: "Heute", time: "19:00" },
    { title: "Vereinsmeisterschaft Runde 4", date: "Fr, 25. Mai", time: "19:00" },
  ],
};

type DemoTab = "dashboard" | "members" | "tournaments" | "finance";

export function DemoManager() {
  const [activeTab, setActiveTab] = useState<DemoTab>("dashboard");
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [demoCompleted, setDemoCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("demoCompleted");
    if (completed) setDemoCompleted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("demoCompleted", "true");
      setDemoCompleted(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const tabs: { id: DemoTab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "members", label: "Mitglieder", icon: Users },
    { id: "tournaments", label: "Turniere", icon: Trophy },
    { id: "finance", label: "Finanzen", icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-blue-800">
          <strong>Demo-Modus:</strong> Dies ist eine interaktive Vorschau mit fiktiven Daten.
        </p>
        <Link href="/auth/signup">
          <Button size="sm">
            {demoCompleted ? "Bereit fuer Ihren Verein?" : "Jetzt kostenlos starten"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && <DashboardDemo setTooltip={setTooltip} />}
      {activeTab === "members" && <MembersDemo setTooltip={setTooltip} />}
      {activeTab === "tournaments" && <TournamentsDemo setTooltip={setTooltip} />}
      {activeTab === "finance" && <FinanceDemo setTooltip={setTooltip} />}

      {tooltip && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 flex items-center gap-2">
          {tooltip}
          <button onClick={() => setTooltip(null)} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardDemo({ setTooltip }: { setTooltip: (t: string | null) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Mitglieder", value: demoData.stats.members, icon: Users },
          { label: "Mannschaften", value: demoData.stats.teams, icon: Swords },
          { label: "Aktive Turniere", value: demoData.stats.tournaments, icon: Trophy },
          { label: "Offene Beitraege", value: demoData.stats.pendingPayments, icon: Wallet },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setTooltip?.(`${stat.label}: Klicken fuehrt im echten System zur Detailansicht`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Naechste Termine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoData.events.map((event) => (
              <div
                key={event.title}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date} &ndash; {event.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vereinsstaerke</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{demoData.stats.avgDwz}</p>
            <p className="text-sm text-muted-foreground">O DWZ aller Spieler</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MembersDemo({ setTooltip }: { setTooltip: (t: string | null) => void }) {
  const [search, setSearch] = useState("");
  const filtered = demoData.members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mitgliederliste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="text"
          placeholder="Mitglied suchen..."
          className="w-full px-3 py-2 border rounded-md text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setTooltip("Im echten System: Volltextsuche ueber alle Mitglieder")}
        />
        <div className="space-y-2">
          {filtered.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">DWZ: {member.dwz ?? "-"}</p>
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  member.status === "aktiv"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentsDemo({ setTooltip }: { setTooltip: (t: string | null) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Laufende Turniere</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoData.tournaments.map((t) => (
          <div
            key={t.name}
            className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setTooltip("Turnierdetails mit Ergebnismatrix und Live-Tabelle")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.players} Teilnehmer</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{t.rounds}</p>
                <p className="text-xs text-muted-foreground">Runden</p>
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Im echten System koennen Sie hier Ergebnisse eintragen</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceDemo({ setTooltip }: { setTooltip: (t: string | null) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Kontostand", value: "8.240 EUR", color: "text-emerald-600" },
          { label: "Offen", value: "2.450 EUR", color: "text-amber-600" },
          { label: "Ueberfaellig", value: "380 EUR", color: "text-red-600" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setTooltip("Finanzuebersicht mit SEPA-Export und Zahlungsverfolgung")}
          >
            <CardContent className="p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className={cn("text-xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEPA-Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <div className="flex-1">
              <p className="font-medium text-sm text-indigo-900">SEPA-Export bereit</p>
              <p className="text-xs text-indigo-700">12 Lastschriften fuer naechsten Monat</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setTooltip("Automatischer SEPA-XML Export")}>
              Exportieren
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
