"use client";

import { useState } from "react";
import { generateRoundRobinRounds } from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Shuffle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GenerateRoundsDialogProps {
  tournamentId: string;
  participantCount: number;
}

export function GenerateRoundsDialog({
  tournamentId,
  participantCount,
}: GenerateRoundsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [roundsGenerated, setRoundsGenerated] = useState(0);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await generateRoundRobinRounds(tournamentId);
      setRoundsGenerated(result.rounds);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsLoading(false);
    }
  };

  const roundsNeeded = participantCount % 2 === 0 ? participantCount - 1 : participantCount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <Shuffle className="h-4 w-4" />
            Runden generieren
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Runden generieren
          </DialogTitle>
          <DialogDescription>
            Automatische Paarungen für das Rundenturnier erstellen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{participantCount}</strong> Teilnehmer
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Es werden <strong>{roundsNeeded}</strong> Runden generiert (Berger-Tabelle).
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {roundsGenerated} Runden erfolgreich generiert!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || participantCount < 2 || success}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
