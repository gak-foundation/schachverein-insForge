import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAuditLogs } from "@/features/audit/actions";
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
import { Badge } from "@/components/ui/badge";

const actionLabels: Record<string, string> = {
  create: "Erstellt",
  update: "Bearbeitet",
  delete: "Geloescht",
  login: "Login",
};

const entityLabels: Record<string, string> = {
  member: "Mitglied",
  team: "Mannschaft",
  tournament: "Turnier",
  event: "Veranstaltung",
  season: "Saison",
  payment: "Zahlung",
};

export const metadata = {
  title: "Protokolle",
};

export default async function ProtocolsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.ADMIN_AUDIT, session.user.isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Audit-Protokolle.</p>
      </div>
    );
  }

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Protokolle</h1>
        <p className="text-sm text-gray-500">DSGVO-Audit-Log aller Aenderungen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit-Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Keine Eintraege vorhanden.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Entitaet</TableHead>
                  <TableHead>Benutzer-ID</TableHead>
                  <TableHead>Aenderungen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.createdAt).toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entityLabels[log.entity] ?? log.entity}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-mono">
                      {log.userId?.slice(0, 8) ?? "System"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs max-w-xs truncate">
                      {log.changes ? JSON.stringify(log.changes).slice(0, 60) + "..." : "—"}
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
