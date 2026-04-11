import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPayments, getPaymentStats, getMembers } from "@/lib/actions";
import { createPayment, updatePaymentStatus } from "@/lib/actions";
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

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  paid: "Bezahlt",
  overdue: "Ueberfaellig",
  cancelled: "Storniert",
  refunded: "Erstattet",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-blue-100 text-blue-800",
};

export const metadata = {
  title: "Finanzen",
};

export default async function FinancePage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (!hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.FINANCE_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Finanzverwaltung.</p>
      </div>
    );
  }

  const [stats, allPayments, allMembers] = await Promise.all([
    getPaymentStats(),
    getPayments(),
    getMembers(),
  ]);

  const memberMap = new Map(allMembers.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

  const canWrite = hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.FINANCE_WRITE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzen</h1>
        <p className="text-sm text-gray-500">Uebersicht der Beitraege und Zahlungen</p>
      </div>

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
                  {allMembers.map((m) => (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alle Zahlungen</CardTitle>
        </CardHeader>
        <CardContent>
          {allPayments.length === 0 ? (
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
                {allPayments.map((payment) => (
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
                          <form action={updatePaymentStatus.bind(null, payment.id, "paid")}>
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