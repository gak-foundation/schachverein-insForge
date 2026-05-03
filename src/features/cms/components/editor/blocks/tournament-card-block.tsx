"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Trophy, Users, Hash, ChevronRight } from "lucide-react";
import { getTournamentCardData, type TournamentCardData } from "@/features/tournaments/actions/tournament-card";

interface TournamentCardBlockProps {
  data: {
    tournamentId?: string;
    variant?: "compact" | "standard" | "hero";
    showRegistration?: boolean;
    showLiveStandings?: boolean;
  };
  blockId: string;
  mode: "editor" | "preview" | "live";
}

type StatusType = "upcoming" | "open" | "ongoing" | "finished" | "cancelled";

function computeStatus(tournament: TournamentCardData | null): StatusType {
  if (!tournament) return "upcoming";
  if (tournament.isCompleted) return "finished";

  const now = new Date();
  const start = new Date(tournament.startDate);
  const end = tournament.endDate ? new Date(tournament.endDate) : null;

  if (end && now > end) return "finished";
  if (now >= start) return "ongoing";

  return "upcoming";
}

const STATUS_MAP: Record<StatusType, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  upcoming: { label: "Anstehend", variant: "outline" },
  open: { label: "Anmeldung offen", variant: "secondary" },
  ongoing: { label: "Läuft", variant: "default" },
  finished: { label: "Beendet", variant: "outline" },
  cancelled: { label: "Abgesagt", variant: "destructive" },
};

function formatDate(dateStr: string, endStr?: string | null): string {
  const start = new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!endStr) return start;

  const startDate = new Date(dateStr);
  const endDate = new Date(endStr);

  const endFormatted = endDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (startDate.toDateString() === endDate.toDateString()) return start;
  return `${start} – ${endFormatted}`;
}

function LoadingSkeleton({ variant }: { variant: string }) {
  if (variant === "compact") {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (variant === "hero") {
    return (
      <div className="rounded-lg overflow-hidden space-y-0">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }
  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function CompactCard({
  tournament,
  status,
  onRegister,
}: {
  tournament: TournamentCardData;
  status: StatusType;
  onRegister: () => void;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold truncate">{tournament.name}</h3>
        <Badge variant={STATUS_MAP[status].variant}>{STATUS_MAP[status].label}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 shrink-0" />
        <span>{formatDate(tournament.startDate, tournament.endDate)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4 shrink-0" />
        <span>
          {tournament.participantCount}
          {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""} Teilnehmer
        </span>
      </div>
      {status !== "finished" && status !== "cancelled" && (
        <Button size="sm" variant="outline" className="w-full" onClick={onRegister}>
          <ChevronRight className="h-4 w-4 mr-1" />
          Details &amp; Anmeldung
        </Button>
      )}
    </div>
  );
}

function StandardCard({
  tournament,
  status,
  onRegister,
  showStandings,
}: {
  tournament: TournamentCardData;
  status: StatusType;
  onRegister: () => void;
  showStandings: boolean;
}) {
  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <div className="h-32 bg-primary flex items-center justify-center">
        <Trophy className="h-12 w-12 text-primary-foreground opacity-50" />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{tournament.name}</CardTitle>
          <Badge variant={STATUS_MAP[status].variant} className="shrink-0">
            {STATUS_MAP[status].label}
          </Badge>
        </div>
        {tournament.description && (
          <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDate(tournament.startDate, tournament.endDate)}</span>
          </div>
          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{tournament.location}</span>
            </div>
          )}
          {tournament.timeControl && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{tournament.timeControl}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {tournament.participantCount}
              {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""} Teilnehmer
            </span>
          </div>
          {tournament.numberOfRounds && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 shrink-0" />
              <span>{tournament.numberOfRounds} Runden</span>
            </div>
          )}
        </div>

        {showStandings && tournament.standings.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-semibold mb-2">Rangliste</h4>
            <div className="space-y-1">
              {tournament.standings.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-5 text-center">{s.rank}</span>
                    <span className="truncate">{s.memberName}</span>
                  </div>
                  <span className="font-medium ml-2">{s.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {status !== "finished" && status !== "cancelled" && (
        <CardFooter>
          <Button className="w-full" onClick={onRegister}>
            {status === "ongoing" ? "Zum Turnier" : "Jetzt anmelden"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function HeroCard({
  tournament,
  status,
  onRegister,
  showStandings,
}: {
  tournament: TournamentCardData;
  status: StatusType;
  onRegister: () => void;
  showStandings: boolean;
}) {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 min-h-[400px] flex items-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 p-8 md:p-12 text-white w-full">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant={status === "ongoing" ? "default" : "outline"} className="border-white/30 text-white">
            {STATUS_MAP[status].label}
          </Badge>
          {tournament.type && (
            <Badge variant="outline" className="border-white/30 text-white capitalize">
              {tournament.type === "round_robin" ? "Rundenturnier" : tournament.type === "swiss" ? "Schweizer System" : tournament.type}
            </Badge>
          )}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{tournament.name}</h2>
        {tournament.description && (
          <p className="text-lg text-white/80 mb-6 max-w-2xl">{tournament.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(tournament.startDate, tournament.endDate)}
          </div>
          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {tournament.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {tournament.participantCount}
            {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""} Teilnehmer
          </div>
        </div>

        {showStandings && tournament.standings.length > 0 && (
          <div className="mb-6 max-w-md bg-white/10 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-white/80">Rangliste</h4>
            <div className="space-y-1">
              {tournament.standings.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 w-5 text-center">{s.rank}</span>
                    <span>{s.memberName}</span>
                  </div>
                  <span className="font-medium">{s.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status !== "finished" && status !== "cancelled" && (
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={onRegister}>
              {status === "ongoing" ? "Live-Tabelle ansehen" : "Jetzt anmelden"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TournamentCardBlock({ data, mode }: TournamentCardBlockProps) {
  const [tournament, setTournament] = useState<TournamentCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const tournamentId = data?.tournamentId;
  const variant = data?.variant || "standard";
  const enableRegistration = data?.showRegistration !== false;
  const showStandings = data?.showLiveStandings === true;

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) {
      setTournament(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getTournamentCardData(tournamentId);
      if (!result) {
        setError("Turnier nicht gefunden");
      }
      setTournament(result);
    } catch {
      setError("Fehler beim Laden des Turniers");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  if (!tournamentId) {
    return (
      <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Kein Turnier ausgewählt. Bitte ein Turnier im Inspektor auswählen.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSkeleton variant={variant} />;
  }

  if (error || !tournament) {
    return <ErrorState message={error || "Turnier nicht gefunden"} />;
  }

  const status = computeStatus(tournament);
  const handleRegister = () => {
    if (enableRegistration) {
      setShowRegistration(true);
    }
  };

  return (
    <>
      {variant === "compact" && (
        <CompactCard tournament={tournament} status={status} onRegister={handleRegister} />
      )}
      {variant === "standard" && (
        <StandardCard
          tournament={tournament}
          status={status}
          onRegister={handleRegister}
          showStandings={showStandings}
        />
      )}
      {variant === "hero" && (
        <HeroCard
          tournament={tournament}
          status={status}
          onRegister={handleRegister}
          showStandings={showStandings}
        />
      )}

      {enableRegistration && (
        <RegistrationDialog
          open={showRegistration}
          onOpenChange={setShowRegistration}
          tournament={tournament}
        />
      )}
    </>
  );
}

function RegistrationDialog({
  open,
  onOpenChange,
  tournament,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: TournamentCardData;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission - in production this calls a server action
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Anmeldung: {tournament.name}</DialogTitle>
              <DialogDescription>
                Melde dich für dieses Turnier an. Die Anmeldung ist unverbindlich.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Name *</Label>
                <Input id="reg-name" required placeholder="Max Mustermann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">E-Mail *</Label>
                <Input id="reg-email" type="email" required placeholder="max@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-club">Verein</Label>
                <Input id="reg-club" placeholder="Dein Schachverein" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-dwz">DWZ / ELO (optional)</Label>
                <Input id="reg-dwz" type="number" placeholder="z.B. 1800" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reg-dsgvo" required className="rounded" />
                <Label htmlFor="reg-dsgvo" className="text-xs text-muted-foreground">
                  Ich stimme der Verarbeitung meiner Daten zum Zweck der Turnieranmeldung zu.
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Wird gesendet..." : "Anmelden"}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <Trophy className="h-12 w-12 mx-auto text-primary" />
            <DialogTitle>Anmeldung erfolgreich!</DialogTitle>
            <DialogDescription>
              Du erhältst eine Bestätigungs-E-Mail mit allen Details.
            </DialogDescription>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
