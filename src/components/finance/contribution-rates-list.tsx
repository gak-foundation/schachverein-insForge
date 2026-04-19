"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  upsertContributionRate,
  deleteContributionRate,
} from "@/lib/actions/finance";

export type ContributionRateRow = {
  id: string;
  name: string;
  amount: string;
  frequency: "yearly" | "quarterly" | "monthly";
  description: string | null;
  validFrom: Date | string | null;
  validUntil: Date | string | null;
};

const frequencyLabels: Record<string, string> = {
  yearly: "Jaehrlich",
  quarterly: "Vierteljaehrlich",
  monthly: "Monatlich",
};

function toInputDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface ContributionRatesListProps {
  rates: ContributionRateRow[];
  canWrite: boolean;
}

export function ContributionRatesList({ rates, canWrite }: ContributionRatesListProps) {
  const [editing, setEditing] = useState<ContributionRateRow | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Beitragssaetze</CardTitle>
        </CardHeader>
        <CardContent>
          {rates.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Keine Beitragssaetze hinterlegt.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Rhythmus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(r.amount).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>{frequencyLabels[r.frequency] ?? r.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Beitragssatz bearbeiten" : "Neuer Beitragssatz"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            key={editing?.id ?? "new"}
            action={upsertContributionRate}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cr-name">Name *</Label>
              <Input
                id="cr-name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="z.B. Aktive Mitglieder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-amount">Betrag (EUR) *</Label>
              <Input
                id="cr-amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={editing ? Number(editing.amount) : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-frequency">Rhythmus</Label>
              <select
                id="cr-frequency"
                name="frequency"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                defaultValue={editing?.frequency ?? "yearly"}
              >
                <option value="yearly">Jaehrlich</option>
                <option value="quarterly">Vierteljaehrlich</option>
                <option value="monthly">Monatlich</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cr-description">Beschreibung</Label>
              <Input
                id="cr-description"
                name="description"
                defaultValue={editing?.description ?? ""}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-validFrom">Gueltig ab</Label>
              <Input
                id="cr-validFrom"
                name="validFrom"
                type="date"
                defaultValue={toInputDate(editing?.validFrom)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr-validUntil">Gueltig bis</Label>
              <Input
                id="cr-validUntil"
                name="validUntil"
                type="date"
                defaultValue={toInputDate(editing?.validUntil)}
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={pending}>
                {editing ? "Speichern" : "Anlegen"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Abbrechen
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Beitragssaetze</CardTitle>
        </CardHeader>
        <CardContent>
          {rates.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">Noch keine Saetze erfasst.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Rhythmus</TableHead>
                  <TableHead className="w-[200px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(r.amount).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>{frequencyLabels[r.frequency] ?? r.frequency}</TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditing(r)}>
                        Bearbeiten
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Beitragssatz „${r.name}“ wirklich loeschen?`)) return;
                          startTransition(async () => {
                            await deleteContributionRate(r.id);
                          });
                        }}
                      >
                        Loeschen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
