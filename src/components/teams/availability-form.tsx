"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateAvailability } from "@/lib/actions/availability";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  date: string | null;
  opponent: string | null;
  isHome: boolean;
}

interface Availability {
  matchId: string;
  status: "available" | "unavailable" | "maybe";
}

interface AvailabilityFormProps {
  matches: Match[];
  initialAvailability: Availability[];
}

export function AvailabilityForm({ matches, initialAvailability }: AvailabilityFormProps) {
  const [availability, setAvailability] = useState<Record<string, string>>(
    Object.fromEntries(initialAvailability.map((a) => [a.matchId, a.status]))
  );
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpdate = async (matchId: string, status: "available" | "unavailable" | "maybe") => {
    setLoading(matchId);
    try {
      await updateAvailability(matchId, status);
      setAvailability((prev) => ({ ...prev, [matchId]: status }));
      toast({
        title: "Verfuegbarkeit aktualisiert",
        description: "Ihre Antwort wurde gespeichert.",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Die Verfuegbarkeit konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Keine anstehenden Mannschaftskaempfe gefunden.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Einsatzbereitschaft</CardTitle>
          <CardDescription>Bitte geben Sie an, ob Sie an den folgenden Terminen spielen koennen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match) => {
              const status = availability[match.id];
              const isMatchLoading = loading === match.id;

              return (
                <div key={match.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">
                      {match.isHome ? "Heim" : "Auswaerts"} gegen {match.opponent || "Unbekannt"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {match.date ? new Date(match.date).toLocaleDateString("de-DE", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }) : "Kein Datum"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === "available" ? "default" : "outline"}
                      className={cn(status === "available" && "bg-green-600 hover:bg-green-700")}
                      onClick={() => handleUpdate(match.id, "available")}
                      disabled={isMatchLoading}
                    >
                      {isMatchLoading && status === "available" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "maybe" ? "default" : "outline"}
                      className={cn(status === "maybe" && "bg-yellow-500 hover:bg-yellow-600")}
                      onClick={() => handleUpdate(match.id, "maybe")}
                      disabled={isMatchLoading}
                    >
                      {isMatchLoading && status === "maybe" ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "unavailable" ? "default" : "outline"}
                      className={cn(status === "unavailable" && "bg-destructive hover:bg-destructive/90")}
                      onClick={() => handleUpdate(match.id, "unavailable")}
                      disabled={isMatchLoading}
                    >
                      {isMatchLoading && status === "unavailable" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
