"use client";

import { useState } from "react";
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
import { createPayment, updatePaymentStatus, generateDuePayments } from "@/lib/actions/finance";

interface PaymentsOverviewProps {
  stats: {
    total: { count: number; total: string };
    pending: { count: number; total: string };
    paid: { count: number; total: string };
    overdue: { count: number; total: string };
  };
  payments: {
    id: string;
    memberId: string;
    amount: string;
    description: string;
    status: string;
    dueDate: Date | null;
    year: number;
  }[];
  members: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  canWrite: boolean;
}

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  paid: "Bezahlt",
  overdue: "Ueberfaellig",
  cancelled: "Storniert",
  refunded: "Erstattet",
  collected: "Eingezogen",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-blue-100 text-blue-800",
  collected: "bg-purple-100 text-purple-800",
};

export function PaymentsOverview({ stats, payments, members, canWrite }: PaymentsOverviewProps) {
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

  async function handleGeneratePayments(year: number) {
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const result = await generateDuePayments(year);
      setGenerateMessage(`${result.created} Beitraege fuer ${year} generiert.`);
    } catch (error) {
      setGenerateMessage("Fehler beim Generieren der Beitraege.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Ausstehend</CardTitle>
            <p className="text-2xl font-bold">{stats.pending.count}</p>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{Number(stats.pending.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Bezahlt</CardTitle>
            <p className="text-2xl font-bold">{stats.paid.count}</p>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{Number(stats.paid.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Ueberfaellig</CardTitle>
            <p className="text-2xl font-bold">{stats.overdue.count}</p>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">{Number(stats.overdue.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
      </div>

      {canWrite && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Beitraege generieren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="generateYear">Jahr</Label
                  >
                  <Input
                    id="generateYear"
                    type="number"
                    defaultValue={new Date().getFullYear()}
                    className="w-32"
                  />
                </div>
                <Button
                  onClick={() => {
                    const year = (document.getElementById("generateYear") as HTMLInputElement)?.value;
                    if (year) handleGeneratePayments(Number(year));
                  }}
                  disabled={generating}
                >
                  {generating ? "Generiere..." : "Beitraege generieren"}
                </Button>
              </div>
              {generateMessage && (
                <p className="mt-2 text-sm text-green-600">{generateMessage}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Neue Zahlung anlegen</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createPayment} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="memberId">Mitglied *</Label>
                  <select
                    id="memberId"
                    name="memberId"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Mitglied auswaehlen...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Betrag (EUR) *</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Input id="description" name="description" required placeholder="z.B. Jahresbeitrag 2026" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Jahr *</Label>
                  <Input id="year" name="year" type="number" required defaultValue={new Date().getFullYear()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Faelligkeitsdatum</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
                <div className="flex items-end">
                  <Button type="submit">Zahlung anlegen</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alle Zahlungen</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Noch keine Zahlungen erfasst.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitglied</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jahr</TableHead>
                  <TableHead>Faellig</TableHead>
                  {canWrite && <TableHead>Aktionen</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {memberMap.get(payment.memberId) ?? payment.memberId.slice(0, 8)}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(payment.amount).toFixed(2)} EUR
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[payment.status] ?? "bg-gray-100"}`}>
                        {statusLabels[payment.status] ?? payment.status}
                      </span>
                    </TableCell>
                    <TableCell>{payment.year}</TableCell>
                    <TableCell>
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString("de-DE") : "—"}
                    </TableCell>
                    {canWrite && (
                      <TableCell>
                        {payment.status === "pending" && (
                          <form action={() => updatePaymentStatus(payment.id, "paid")}>
                            <button type="submit" className="text-green-600 hover:text-green-800 text-xs font-medium">
                              Als bezahlt
                            </button>
                          </form>
                        )}
                      </TableCell>
                    )}
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
