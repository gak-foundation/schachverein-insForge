import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/lib/actions/audit";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Audit-Log",
};

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const canViewAudit = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.ADMIN_AUDIT,
  );

  if (!canViewAudit) {
    redirect("/dashboard");
  }

  const logs = await getAuditLogs(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit-Log</h1>
        <p className="text-muted-foreground">
          Protokollierung aller sicherheitsrelevanten Aktionen im Verein.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitaeten</CardTitle>
          <CardDescription>Die letzten 200 Aktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead>Entitaet</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP-Adresse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Keine Eintraege gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        log.action === "CREATED" ? "default" : 
                        log.action === "DELETED" ? "destructive" : 
                        "outline"
                      }>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.entity}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-xs">
                      {JSON.stringify(log.changes)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ipAddress || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
