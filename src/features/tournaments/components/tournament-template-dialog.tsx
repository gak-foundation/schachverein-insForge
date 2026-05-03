"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOURNAMENT_TEMPLATES, type TournamentTemplate } from "@/lib/data/tournament-templates";
import { Clock, Hash, Trophy } from "lucide-react";
import { useState } from "react";

interface TemplateDialogProps {
  onSelect: (template: TournamentTemplate) => void;
}

export function TournamentTemplateDialog({ onSelect }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trophy className="h-4 w-4 mr-2" />
          Aus Vorlage erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Turnier-Vorlage waehlen</DialogTitle>
          <DialogDescription>
            Starte mit einer vorkonfigurierten Vorlage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {TOURNAMENT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted transition-colors"
              onClick={() => {
                onSelect(t);
                setOpen(false);
              }}
            >
              <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.description}</div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" /> {t.numberOfRounds} Runden
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t.timeControl}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
