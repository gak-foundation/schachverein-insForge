"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type GameResult = "1-0" | "0-1" | "½-½" | null;
const RESULTS: GameResult[] = [null, "1-0", "½-½", "0-1"];
const RESULT_LABELS: Record<string, string> = {
  "1-0": "1-0",
  "0-1": "0-1",
  "½-½": "½-½",
};
const RESULT_COLORS: Record<string, string> = {
  "1-0": "bg-green-100 text-green-800 border-green-300",
  "0-1": "bg-red-100 text-red-800 border-red-300",
  "½-½": "bg-gray-100 text-gray-800 border-gray-300",
};

interface Player {
  memberId: string;
  firstName: string;
  lastName: string;
  dwz: number | null;
}

interface MatrixResultEntryProps {
  tournamentId: string;
  participants: Player[];
  round: number;
  existingPairings?: { whiteId: string; blackId: string; result?: string }[];
  onSave: (results: { whiteId: string; blackId: string; result: string; round: number; boardNumber: number }[]) => Promise<void>;
}

interface Cell {
  whiteId: string;
  blackId: string;
  result: GameResult;
}

export function MatrixResultEntry({
  tournamentId,
  participants,
  round,
  existingPairings = [],
  onSave,
}: MatrixResultEntryProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [cells, setCells] = useState<Cell[]>(() => {
    return existingPairings.map((p) => ({
      whiteId: p.whiteId,
      blackId: p.blackId,
      result: (p.result as GameResult) ?? null,
    }));
  });

  function getCell(whiteId: string, blackId: string): Cell | undefined {
    return cells.find((c) => c.whiteId === whiteId && c.blackId === blackId);
  }

  function toggleCell(whiteId: string, blackId: string) {
    if (whiteId === blackId) return;
    setCells((prev) => {
      const existing = prev.find((c) => c.whiteId === whiteId && c.blackId === blackId);
      if (!existing) {
        return [...prev, { whiteId, blackId, result: "1-0" }];
      }
      const idx = RESULTS.indexOf(existing.result);
      const next = RESULTS[(idx + 1) % RESULTS.length];
      if (next === null) {
        return prev.filter((c) => c !== existing);
      }
      return prev.map((c) =>
        c.whiteId === whiteId && c.blackId === blackId ? { ...c, result: next } : c
      );
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const results = cells
          .filter((c) => c.result !== null)
          .map((c, i) => ({
            whiteId: c.whiteId,
            blackId: c.blackId,
            result: c.result as string,
            round,
            boardNumber: i + 1,
          }));

        await onSave(results);
        toast({ title: "Gespeichert", description: `${results.length} Ergebnisse gespeichert.` });
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message || "Speichern fehlgeschlagen",
          variant: "destructive",
        });
      }
    });
  }

  const sorted = [...participants].sort((a, b) => (b.dwz ?? 0) - (a.dwz ?? 0));
  const filledCount = cells.filter((c) => c.result).length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white border p-2 min-w-[120px] text-left text-xs">
                Weiß ↓ / Schwarz →
              </th>
              {sorted.map((p) => (
                <th key={p.memberId} className="border p-2 text-center min-w-[80px] text-xs bg-slate-50">
                  <div className="font-medium">{p.lastName}</div>
                  <div className="text-gray-400 font-normal">{p.dwz ?? "—"}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((white) => (
              <tr key={white.memberId}>
                <td className="sticky left-0 bg-white border p-2 font-medium text-xs bg-slate-50">
                  {white.lastName}, {white.firstName}
                  <span className="text-gray-400 ml-1 font-normal">{white.dwz ?? "—"}</span>
                </td>
                {sorted.map((black) => {
                  const cell = getCell(white.memberId, black.memberId);
                  const isSelf = white.memberId === black.memberId;
                  return (
                    <td
                      key={black.memberId}
                      className={`border p-1 text-center cursor-pointer select-none transition-colors ${
                        isSelf
                          ? "bg-slate-100 cursor-default"
                          : cell?.result
                          ? RESULT_COLORS[cell.result]
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => !isSelf && toggleCell(white.memberId, black.memberId)}
                    >
                      {isSelf ? (
                        <span className="text-gray-300">—</span>
                      ) : cell?.result ? (
                        <span className="font-mono text-xs font-bold">
                          {RESULT_LABELS[cell.result]}
                        </span>
                      ) : (
                        <span className="text-gray-300">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Klick auf eine Zelle: Leer → 1-0 → ½-½ → 0-1 → Leer
        </p>
        <Button onClick={handleSave} disabled={isPending || filledCount === 0}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {filledCount} Ergebnisse speichern
        </Button>
      </div>
    </div>
  );
}
