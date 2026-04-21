"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  createPayment, 
  updatePaymentStatus, 
  generateDuePayments, 
  getPaymentInvoiceData 
} from "@/lib/actions/finance";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { FileText, Search, Plus, Loader2 } from "lucide-react";
import { PrintButton } from "@/components/print-button";

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
    dueDate: Date | string | null;
    year: number;
    invoiceNumber?: string | null;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  const memberMap = new Map(members.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

  const filteredPayments = payments.filter((p) => {
    const memberName = memberMap.get(p.memberId)?.toLowerCase() || "";
    const description = p.description.toLowerCase();
    const invoiceNumber = p.invoiceNumber?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return memberName.includes(term) || description.includes(term) || invoiceNumber.includes(term);
  });

  const filteredMembers = members.filter((m) => {
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    return name.includes(memberSearchTerm.toLowerCase());
  });

  async function handleGeneratePayments(year: number) {
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const result = await generateDuePayments(year);
      setGenerateMessage(`${result.created} Beitraege fuer ${year} generiert.`);
    } catch {
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Ausstehend</CardTitle>
            <div className="text-2xl font-bold">{stats.pending.count}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{Number(stats.pending.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bezahlt</CardTitle>
            <div className="text-2xl font-bold">{stats.paid.count}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{Number(stats.paid.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ueberfaellig</CardTitle>
            <div className="text-2xl font-bold text-red-600">{stats.overdue.count}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{Number(stats.overdue.total).toFixed(2)} EUR</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {canWrite && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Zahlung anlegen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Neue Zahlung anlegen</DialogTitle>
                <DialogDescription>Manuelle Erfassung einer Zahlung oder eines Beitrags.</DialogDescription>
              </DialogHeader>
              <form action={async (formData) => { await createPayment(formData); }} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="memberSearch">Mitglied suchen</Label>
                  <Input 
                    id="memberSearch" 
                    placeholder="Name tippen..." 
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberId">Mitglied auswaehlen *</Label>
                  <select
                    id="memberId"
                    name="memberId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Bitte waehlen...</option>
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Betrag (EUR) *</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Jahr *</Label>
                    <Input id="year" name="year" type="number" required defaultValue={new Date().getFullYear()} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Input id="description" name="description" required placeholder="z.B. Jahresbeitrag 2026" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Faelligkeitsdatum</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
                <Button type="submit" className="w-full">Zahlung anlegen & Rechnung senden</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {canWrite && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Beitraege generieren
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Jahresbeitraege generieren</DialogTitle>
                <DialogDescription>
                  Erzeugt automatisch Zahlungen fuer alle aktiven Mitglieder basierend auf ihren Beitragssaetzen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="generateYear">Fuer das Jahr</Label>
                  <Input
                    id="generateYear"
                    type="number"
                    defaultValue={new Date().getFullYear()}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const year = (document.getElementById("generateYear") as HTMLInputElement)?.value;
                    if (year) handleGeneratePayments(Number(year));
                  }}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generiere...
                    </>
                  ) : "Jetzt generieren"}
                </Button>
                {generateMessage && (
                  <p className="text-sm text-center text-green-600 font-medium">{generateMessage}</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Mitglied, Beschreibung oder Rechnung..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Zahlungsuebersicht</CardTitle>
          <CardDescription>Liste aller erfassten Beitraege und Zahlungen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnung / Mitglied</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Faellig</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Keine Zahlungen gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{memberMap.get(payment.memberId) ?? "Unbekannt"}</span>
                          <span className="text-xs text-muted-foreground font-mono">{payment.invoiceNumber || "Keine Nr."}</span>
                        </div>
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {Number(payment.amount).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[payment.status] ?? "bg-gray-100"}`}>
                          {statusLabels[payment.status] ?? payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString("de-DE") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <InvoiceDialog paymentId={payment.id} />
                          {canWrite && payment.status === "pending" && (
                            <form action={() => updatePaymentStatus(payment.id, "paid")}>
                              <Button variant="ghost" size="sm" type="submit" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                Bezahlt
                              </Button>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceDialog({ paymentId }: { paymentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPaymentInvoiceData(paymentId);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && loadData()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Rechnung ansehen">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Rechnung</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-8 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{data.club.name}</h2>
                <p className="text-sm text-muted-foreground">Vereinskonto: {data.club.sepaIban}</p>
                <p className="text-sm text-muted-foreground">Gläubiger-ID: {data.club.creditorId}</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold">RECHNUNG</h3>
                <p className="text-sm font-mono">{data.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">Datum: {new Date(data.createdAt).toLocaleDateString("de-DE")}</p>
              </div>
            </div>

            <div className="border-t pt-8">
              <p className="text-sm text-muted-foreground">Empfänger:</p>
              <p className="font-bold">{data.member.firstName} {data.member.lastName}</p>
              <p className="text-sm">{data.member.email}</p>
            </div>

            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{data.description} ({data.year})</TableCell>
                    <TableCell className="text-right">{Number(data.amount).toFixed(2)} €</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Gesamtbetrag</TableCell>
                    <TableCell className="text-right">{Number(data.amount).toFixed(2)} €</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <p className="text-sm">Bitte begleichen Sie den Betrag bis zum <strong>{data.dueDate ? new Date(data.dueDate).toLocaleDateString("de-DE") : "sofort"}</strong>.</p>
              <p className="text-xs text-muted-foreground">Vielen Dank für Ihre Unterstützung!</p>
            </div>

            <div className="flex justify-end print:hidden">
              <PrintButton />
            </div>
          </div>
        ) : (
          <p className="text-center py-10">Daten konnten nicht geladen werden.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
