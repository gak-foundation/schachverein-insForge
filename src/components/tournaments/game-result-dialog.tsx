"use client";

import { useState, useEffect } from "react";
import { updateGameResult } from "@/lib/actions/tournaments";
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
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Loader2, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { savePendingResult, getPendingResults, clearPendingResultByGameId } from "@/lib/offline/db";

interface GameResultDialogProps {
  gameId: string;
  whiteName: string;
  blackName: string;
  currentResult?: string | null;
}

const resultOptions = [
  { value: "1-0", label: "1-0 (Weiss gewinnt)" },
  { value: "0-1", label: "0-1 (Schwarz gewinnt)" },
  { value: "1/2-1/2", label: "Remis" },
  { value: "+-", label: "+- (Weiss kampflos)" },
  { value: "-+", label: "-+ (Schwarz kampflos)" },
  { value: "+/+", label: "+/+ (beide kampflos)" },
];

export function GameResultDialog({
  gameId,
  whiteName,
  blackName,
  currentResult: initialResult,
}: GameResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(initialResult || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const checkPending = async () => {
      const pending = await getPendingResults();
      const found = pending.find(r => r.gameId === gameId);
      if (found) {
        setHasPending(true);
        setResult(found.result);
      }
    };
    checkPending();
    
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (navigator.onLine) {
        await updateGameResult(gameId, result as any);
        await clearPendingResultByGameId(gameId);
        setHasPending(false);
        setSuccess(true);
      } else {
        await savePendingResult({
          gameId,
          result,
          createdAt: new Date().toISOString(),
        });
        setHasPending(true);
        setSuccess(true);
        setError("Offline: Ergebnis wurde lokal gespeichert und wird synchronisiert, sobald du wieder online bist.");
      }
      
      setTimeout(() => {
        if (navigator.onLine) {
          setOpen(false);
          setSuccess(false);
        }
      }, 2000);
    } catch (err) {
      // Fallback to offline storage if server action fails (e.g. timeout)
      try {
        await savePendingResult({
          gameId,
          result,
          createdAt: new Date().toISOString(),
        });
        setHasPending(true);
        setError("Verbindungsfehler: Ergebnis wurde lokal zwischengespeichert.");
      } catch (idbErr) {
        setError("Fehler beim Speichern: " + (err instanceof Error ? err.message : "Unbekannter Fehler"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resultLabels: Record<string, string> = {
    "1-0": "1-0",
    "0-1": "0-1",
    "1/2-1/2": "Remis",
    "+-": "+-",
    "-+": "-+",
    "+/+": "+/+",
  };

  const currentResult = hasPending ? result : initialResult;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={currentResult ? "outline" : "default"}
            size="sm"
            className={
              hasPending 
                ? "text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100" 
                : currentResult 
                  ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100" 
                  : ""
            }
          >
            {hasPending && <WifiOff className="h-3 w-3 mr-1" />}
            {!hasPending && currentResult && <Check className="h-3 w-3 mr-1" />}
            {currentResult ? (resultLabels[currentResult] || currentResult) : "Ergebnis eingeben"}
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partie-Ergebnis eingeben</DialogTitle>
          <DialogDescription>
            {whiteName} (Weiss) vs {blackName} (Schwarz)
            {isOffline && <span className="block mt-1 text-orange-600 font-medium">Du bist aktuell offline.</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ergebnis auswählen</Label>
            <div className="grid grid-cols-1 gap-2">
              {resultOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResult(option.value)}
                  className={`p-3 text-left rounded-md border transition-colors ${
                    result === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant={error.includes("Offline") || error.includes("Verbindungsfehler") ? "default" : "destructive"} className={error.includes("Offline") || error.includes("Verbindungsfehler") ? "border-orange-200 bg-orange-50 text-orange-800" : ""}>
              {error.includes("Offline") || error.includes("Verbindungsfehler") ? <WifiOff className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !error && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Ergebnis gespeichert!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={!result || isLoading || (success && !error)}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isOffline ? "Lokal speichern" : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
