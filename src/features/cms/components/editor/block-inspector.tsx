"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { useActiveClub } from "@/lib/club-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getTournamentsForSelector } from "@/features/tournaments/actions/tournament-card";

export function BlockInspector() {
  const { activeBlockId, blocks, updateBlock } = useEditorStore();
  const activeClub = useActiveClub();
  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  const [tournamentOptions, setTournamentOptions] = useState<
    Array<{ id: string; name: string; date: string; type: string }>
  >([]);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  useEffect(() => {
    if (activeBlock?.type === "tournamentCard" && activeClub?.id) {
      setLoadingTournaments(true);
      getTournamentsForSelector(activeClub.id)
        .then(setTournamentOptions)
        .catch(() => setTournamentOptions([]))
        .finally(() => setLoadingTournaments(false));
    }
  }, [activeBlock?.type, activeClub?.id]);

  if (!activeBlock) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">Wählen Sie einen Block aus, um ihn zu bearbeiten.</p>
      </div>
    );
  }

  const handleUpdate = (data: Record<string, unknown>) => {
    updateBlock(activeBlock.id, data);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Block-Einstellungen
        </h3>
        <p className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded">
          Typ: {activeBlock.type}
        </p>
      </div>

      <Separator />

      {/* Dynamic Inspector Fields based on Block Type */}
      <div className="space-y-4">
        {activeBlock.type === "text" && (
          <>
            <div className="space-y-2">
              <Label>Ausrichtung</Label>
              <Select
                value={activeBlock.data.alignment}
                onValueChange={(val) => handleUpdate({ alignment: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Links</SelectItem>
                  <SelectItem value="center">Zentriert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maximale Breite</Label>
              <Select
                value={activeBlock.data.maxWidth}
                onValueChange={(val) => handleUpdate({ maxWidth: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Schmal (Prose)</SelectItem>
                  <SelectItem value="normal">Standard</SelectItem>
                  <SelectItem value="wide">Vollbreite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {activeBlock.type === "hero" && (
          <>
            <div className="space-y-2">
              <Label>Haupt-Überschrift</Label>
              <Input
                value={activeBlock.data.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unter-Überschrift</Label>
              <Input
                value={activeBlock.data.subtitle || ""}
                onChange={(e) => handleUpdate({ subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hintergrund-Deckkraft ({activeBlock.data.overlayOpacity}%)</Label>
              <Slider
                value={[activeBlock.data.overlayOpacity]}
                max={100}
                step={1}
                onValueChange={(vals) => handleUpdate({ overlayOpacity: Array.isArray(vals) ? vals[0] : vals })}
              />
            </div>
          </>
        )}

        {activeBlock.type === "button" && (
          <>
            <div className="space-y-2">
              <Label>Beschriftung</Label>
              <Input
                value={activeBlock.data.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Link (URL)</Label>
              <Input
                value={activeBlock.data.href}
                onChange={(e) => handleUpdate({ href: e.target.value })}
              />
            </div>
          </>
        )}

        {activeBlock.type === "tournamentCard" && (
          <>
            <div className="space-y-2">
              <Label>Turnier auswählen</Label>
              {loadingTournaments ? (
                <p className="text-xs text-muted-foreground">Lade Turniere...</p>
              ) : tournamentOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Keine Turniere gefunden. Erstelle zuerst ein Turnier.
                </p>
              ) : (
                <Select
                  value={activeBlock.data.tournamentId || ""}
                  onValueChange={(val) => handleUpdate({ tournamentId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Turnier auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Darstellung</Label>
              <Select
                value={activeBlock.data.variant || "standard"}
                onValueChange={(val) => handleUpdate({ variant: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Kompakt (Sidebar)</SelectItem>
                  <SelectItem value="standard">Standard (Karte)</SelectItem>
                  <SelectItem value="hero">Hero (Vollbreite)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tc-registration" className="text-sm cursor-pointer">
                Anmeldung anzeigen
              </Label>
              <Switch
                id="tc-registration"
                checked={activeBlock.data.showRegistration !== false}
                onCheckedChange={(val: boolean) => handleUpdate({ showRegistration: val })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tc-standings" className="text-sm cursor-pointer">
                Live-Rangliste anzeigen
              </Label>
              <Switch
                id="tc-standings"
                checked={activeBlock.data.showLiveStandings === true}
                onCheckedChange={(val: boolean) => handleUpdate({ showLiveStandings: val })}
              />
            </div>
          </>
        )}

        {activeBlock.type === "contactForm" && (
          <>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={activeBlock.data.title || ""}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                placeholder="Kontakt aufnehmen"
              />
            </div>
            <div className="space-y-2">
              <Label>Empfänger-Rolle</Label>
              <Select
                value={activeBlock.data.recipientRole || "vorstand"}
                onValueChange={(val) => handleUpdate({ recipientRole: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vorstand">Vorstand</SelectItem>
                  <SelectItem value="jugendwart">Jugendwart</SelectItem>
                  <SelectItem value="sportwart">Sportwart</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Button-Text</Label>
              <Input
                value={activeBlock.data.submitButtonLabel || ""}
                onChange={(e) => handleUpdate({ submitButtonLabel: e.target.value })}
                placeholder="Nachricht senden"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cf-phone" className="text-sm cursor-pointer">
                Telefonfeld anzeigen
              </Label>
              <Switch
                id="cf-phone"
                checked={activeBlock.data.showPhoneField === true}
                onCheckedChange={(val: boolean) => handleUpdate({ showPhoneField: val })}
              />
            </div>
          </>
        )}

        {activeBlock.type === "image" && (
          <>
            <div className="space-y-2">
              <Label>Bildunterschrift</Label>
              <Input
                value={activeBlock.data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                placeholder="Optionale Bildunterschrift"
              />
            </div>
            <div className="space-y-2">
              <Label>Seitenverhältnis</Label>
              <Select
                value={activeBlock.data.ratio || "original"}
                onValueChange={(val) => handleUpdate({ ratio: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ausrichtung</Label>
              <Select
                value={activeBlock.data.alignment || "center"}
                onValueChange={(val) => handleUpdate({ alignment: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Links</SelectItem>
                  <SelectItem value="center">Zentriert</SelectItem>
                  <SelectItem value="right">Rechts</SelectItem>
                  <SelectItem value="full">Volle Breite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">DSGVO-Hinweis:</p>
              <p>Stelle sicher, dass für personenbezogene Bilder Einwilligungen vorliegen. Ohne Alt-Text ist die Veröffentlichung nicht barrierefrei (BFSG 2025).</p>
            </div>
          </>
        )}
      </div>

      <Separator />

      <div className="pt-4">
        <h4 className="text-xs font-semibold mb-2">Sichtbarkeit</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="v-public" checked readOnly />
          <Label htmlFor="v-public" className="text-xs">Öffentlich sichtbar</Label>
        </div>
      </div>
    </div>
  );
}
