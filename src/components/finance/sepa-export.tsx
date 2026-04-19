"use client";

import { useMemo, useState, useTransition } from "react";
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
import { exportSepaXml } from "@/lib/actions/finance";

export type SepaPaymentRow = {
  id: string;
  memberId: string;
  amount: string;
  description: string;
  status: string;
  dueDate: Date | string | null;
  year: number;
  sepaMandateReference: string | null;
  memberFirstName: string;
  memberLastName: string;
  memberIban: string | null;
  memberBic: string | null;
  memberMandateRef: string | null;
  mandateSignedAt: Date | string | null;
};

type BankSettings = {
  creditorId: string | null;
  sepaIban: string | null;
  sepaBic: string | null;
} | undefined;

interface SepaExportProps {
  payments: SepaPaymentRow[];
  bankSettings: BankSettings;
  canSepa: boolean;
}

function isSepaReady(p: SepaPaymentRow): boolean {
  const mandate = p.sepaMandateReference || p.memberMandateRef;
  return Boolean(p.memberIban && mandate && p.mandateSignedAt);
}

export function SepaExport({ payments, bankSettings, canSepa }: SepaExportProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const exportable = useMemo(
    () => payments.filter((p) => p.status === "pending" && isSepaReady(p)),
    [payments],
  );

  const clubReady = Boolean(bankSettings?.creditorId && bankSettings?.sepaIban);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(exportable.map((p) => p.id)));
  }

  function handleExport() {
    setMessage(null);
    const ids = [...selected];
    if (ids.length === 0) {
      setMessage("Bitte mindestens eine Zahlung auswaehlen.");
      return;
    }
    if (!canSepa) {
      setMessage("Keine Berechtigung fuer den SEPA-Export.");
      return;
    }
    if (!clubReady) {
      setMessage("Bitte zuerst Creditor-ID und Vereins-IBAN unter Bank-Einstellungen hinterlegen.");
      return;
    }
    startTransition(async () => {
      try {
        const { xml, filename } = await exportSepaXml(ids);
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setSelected(new Set());
        setMessage("Export erstellt. Datei wurde heruntergeladen.");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Export fehlgeschlagen.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {!clubReady && (
        <p className="text-sm text-amber-700">
          Fuer den Export werden Creditor-ID und IBAN des Vereins benoetigt (Tab Bank-Einstellungen).
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle>SEPA-Lastschrift (pending, mandatsfaehig)</CardTitle>
          <Button type="button" onClick={handleExport} disabled={pending || !canSepa || exportable.length === 0}>
            {pending ? "Exportiere…" : "XML exportieren"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <p className="text-sm text-gray-700">{message}</p>}
          {exportable.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine ausstehenden Zahlungen mit vollstaendigen SEPA-Daten (IBAN, Mandat, Unterschrift).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Alle auswaehlen"
                      ref={(el) => {
                        if (!el) return;
                        el.indeterminate =
                          selected.size > 0 && selected.size < exportable.length;
                      }}
                      checked={exportable.length > 0 && selected.size === exportable.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Mitglied</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Jahr</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportable.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                        aria-label={`Zahlung ${p.description}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.memberFirstName} {p.memberLastName}
                    </TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(p.amount).toFixed(2)} EUR</TableCell>
                    <TableCell>{p.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weitere Zahlungen (nicht exportierbar)</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.filter((p) => p.status === "pending" && !isSepaReady(p)).length === 0 ? (
            <p className="text-sm text-gray-500">Keine ausstehenden Zahlungen ohne vollstaendige SEPA-Angaben.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitglied</TableHead>
                  <TableHead>Status-Hinweis</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .filter((p) => p.status === "pending" && !isSepaReady(p))
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.memberFirstName} {p.memberLastName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {!p.memberIban && "IBAN fehlt. "}
                        {!(p.sepaMandateReference || p.memberMandateRef) && "Mandatsreferenz fehlt. "}
                        {!p.mandateSignedAt && "Mandatsdatum fehlt."}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{Number(p.amount).toFixed(2)} EUR</TableCell>
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
