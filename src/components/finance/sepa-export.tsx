"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Download, History, CheckCircle2, AlertCircle } from "lucide-react";

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

type SepaExportHistory = {
  id: string;
  filename: string;
  xmlContent: string;
  totalAmount: string;
  paymentCount: number;
  createdAt: Date;
};

interface SepaExportProps {
  payments: SepaPaymentRow[];
  bankSettings: BankSettings;
  canSepa: boolean;
  history: SepaExportHistory[];
}

function isSepaReady(p: SepaPaymentRow): boolean {
  const mandate = p.sepaMandateReference || p.memberMandateRef;
  return Boolean(p.memberIban && mandate && p.mandateSignedAt);
}

export function SepaExport({ payments, bankSettings, canSepa, history }: SepaExportProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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

  function handleDownloadXml(xml: string, filename: string) {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExport() {
    setMessage(null);
    const ids = [...selected];
    if (ids.length === 0) {
      setMessage({ type: "error", text: "Bitte mindestens eine Zahlung auswaehlen." });
      return;
    }
    if (!canSepa) {
      setMessage({ type: "error", text: "Keine Berechtigung fuer den SEPA-Export." });
      return;
    }
    if (!clubReady) {
      setMessage({ type: "error", text: "Bitte zuerst Creditor-ID und Vereins-IBAN unter Bank-Einstellungen hinterlegen." });
      return;
    }
    startTransition(async () => {
      try {
        const { xml, filename } = await exportSepaXml(ids);
        handleDownloadXml(xml, filename);
        setSelected(new Set());
        setMessage({ type: "success", text: "Export erstellt und archiviert. Datei wurde heruntergeladen." });
      } catch (e) {
        setMessage({ type: "error", text: e instanceof Error ? e.message : "Export fehlgeschlagen." });
      }
    });
  }

  return (
    <div className="space-y-6">
      {!clubReady && (
        <div className="flex items-center gap-2 p-4 text-sm rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <p>
            Fuer den Export werden Creditor-ID und IBAN des Vereins benoetigt (Tab Bank-Einstellungen).
          </p>
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-2 p-4 text-sm rounded-lg border ${
          message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <p>{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Neuer SEPA-Export</CardTitle>
            <CardDescription>Zahlungen mit vollstaendigen Mandatsdaten (pending)</CardDescription>
          </div>
          <Button type="button" onClick={handleExport} disabled={pending || !canSepa || exportable.length === 0}>
            {pending ? "Exportiere…" : "XML generieren & exportieren"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportable.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border rounded-lg border-dashed">
              Keine ausstehenden Zahlungen mit vollstaendigen SEPA-Daten vorhanden.
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
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-500" />
            <CardTitle>Export-Historie</CardTitle>
          </div>
          <CardDescription>Vergangene SEPA-XML-Dateien herunterladen</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Noch keine Exporte durchgefuehrt.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Dateiname</TableHead>
                  <TableHead className="text-right">Anzahl</TableHead>
                  <TableHead className="text-right">Gesamtbetrag</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{format(new Date(h.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}</TableCell>
                    <TableCell className="font-mono text-xs">{h.filename}</TableCell>
                    <TableCell className="text-right">{h.paymentCount}</TableCell>
                    <TableCell className="text-right font-medium">{Number(h.totalAmount).toFixed(2)} EUR</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadXml(h.xmlContent, h.filename)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fehlende SEPA-Angaben</CardTitle>
          <CardDescription>Zahlungen, die aufgrund fehlender Daten nicht exportiert werden koennen</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.filter((p) => p.status === "pending" && !isSepaReady(p)).length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Keine unvollstaendigen Zahlungen vorhanden.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitglied</TableHead>
                  <TableHead>Was fehlt?</TableHead>
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
                      <TableCell className="text-sm text-red-600">
                        {!p.memberIban && "IBAN, "}
                        {!(p.sepaMandateReference || p.memberMandateRef) && "Mandats-ID, "}
                        {!p.mandateSignedAt && "Unterschriftsdatum"}
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
