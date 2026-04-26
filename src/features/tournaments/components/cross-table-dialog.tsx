"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid3X3, Trophy } from "lucide-react";

interface CrossTableEntry {
  participant: {
    id: string;
    name: string;
    rating?: number;
  };
  results: (string | null)[];
  totalPoints: number;
  rank: number;
}

interface CrossTableDialogProps {
  entries: CrossTableEntry[];
  participantNames: string[];
}

export function CrossTableDialog({ entries, participantNames }: CrossTableDialogProps) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <Grid3X3 className="h-4 w-4" />
            Kreuztabelle
          </Button>
        }
      />
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Kreuztabelle
          </DialogTitle>
          <DialogDescription>
            Übersicht aller Ergebnisse im Rundenturnier
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Pl.</TableHead>
                <TableHead>Spieler</TableHead>
                {participantNames.map((name, idx) => (
                  <TableHead key={idx} className="text-center w-12 text-xs">
                    {idx + 1}
                  </TableHead>
                ))}
                <TableHead className="text-right">Pkt.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, rowIdx) => (
                <TableRow key={entry.participant.id}>
                  <TableCell className="text-center font-medium">
                    {entry.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700">
                        <Trophy className="h-3 w-3" />
                      </span>
                    ) : entry.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700">
                        2
                      </span>
                    ) : entry.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700">
                        3
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {entry.participant.name}
                  </TableCell>
                  {entry.results.map((result, colIdx) => (
                    <TableCell
                      key={colIdx}
                      className={`text-center text-sm ${
                        result === "1"
                          ? "bg-green-50 text-green-700 font-semibold"
                          : result === "0"
                          ? "bg-red-50 text-red-700"
                          : result === "½"
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : rowIdx === colIdx
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {rowIdx === colIdx ? "—" : result || "·"}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold">
                    {entry.totalPoints.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-4 text-xs text-gray-500 mt-4">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-50 border border-green-200 rounded text-center text-green-700">1</span>
            <span>Sieg</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-50 border border-blue-200 rounded text-center text-blue-700">½</span>
            <span>Remis</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-50 border border-red-200 rounded text-center text-red-700">0</span>
            <span>Verlust</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded text-center">—</span>
            <span>Eigenes Feld</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
