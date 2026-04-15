"use client";

import { useState } from "react";
import { updateGameResult } from "@/lib/actions/games";
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
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  currentResult,
}: GameResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(currentResult || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateGameResult(gameId, result);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={currentResult ? "outline" : "default"}
            size="sm"
            className={currentResult ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100" : ""}
          >
            {currentResult ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                {resultLabels[currentResult] || currentResult}
              </>
            ) : (
              "Ergebnis eingeben"
            )}
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partie-Ergebnis eingeben</DialogTitle>
          <DialogDescription>
            {whiteName} (Weiss) vs {blackName} (Schwarz)
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
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
              disabled={!result || isLoading || success}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
