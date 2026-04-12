import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getMemberById, getDwzHistory } from "@/lib/actions";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { notFound } from "next/navigation";
import { deleteMember } from "@/lib/actions";

export const metadata = {
  title: "Mitglied",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const canEdit = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.MEMBERS_WRITE,
  );

  const canDelete = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.MEMBERS_DELETE,
  );

  const dwzHistory = await getDwzHistory(id);

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    resigned: "bg-red-100 text-red-800",
    honorary: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/members"
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Zurueck
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {member.firstName} {member.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">{member.role}</Badge>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusColors[member.status] ?? "bg-gray-100"
                }`}
              >
                {statusLabels[member.status] ?? member.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/dashboard/members/${id}/edit`}>
              <Button variant="outline">Bearbeiten</Button>
            </Link>
          )}
          {canDelete && (
            <form action={deleteMember.bind(null, id)}>
              <Button variant="destructive" type="submit">Loeschen</Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">E-Mail</dt>
                <dd className="font-medium">{member.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Telefon</dt>
                <dd className="font-medium">{member.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Geburtsdatum</dt>
                <dd className="font-medium">
                  {member.dateOfBirth
                    ? new Date(member.dateOfBirth).toLocaleDateString("de-DE")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Eintrittsdatum</dt>
                <dd className="font-medium">
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString("de-DE")
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schach-Daten</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-gray-500">DWZ</dt>
                <dd className="text-2xl font-bold">{member.dwz ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Elo</dt>
                <dd className="text-2xl font-bold">{member.elo ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">DWZ-ID</dt>
                <dd className="font-medium">{member.dwzId ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {member.lichessUsername && (
                <div>
                  <dt className="text-sm text-gray-500">Lichess</dt>
                  <dd className="font-medium text-blue-600">
                    {member.lichessUsername}
                  </dd>
                </div>
              )}
              {member.chesscomUsername && (
                <div>
                  <dt className="text-sm text-gray-500">Chess.com</dt>
                  <dd className="font-medium text-blue-600">
                    {member.chesscomUsername}
                  </dd>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Einwilligungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className={member.photoConsent ? "text-green-600" : "text-red-500"}>
                {member.photoConsent ? "✓" : "✗"}
              </span>
              <span className="text-sm">Foto-Einwilligung</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={member.newsletterConsent ? "text-green-600" : "text-red-500"}>
                {member.newsletterConsent ? "✓" : "✗"}
              </span>
              <span className="text-sm">Newsletter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={member.resultPublicationConsent ? "text-green-600" : "text-red-500"}>
                {member.resultPublicationConsent ? "✓" : "✗"}
              </span>
              <span className="text-sm">Ergebnisse veroeffentlichen</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {dwzHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>DWZ-Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">DWZ</TableHead>
                  <TableHead className="text-right">Elo</TableHead>
                  <TableHead>Quelle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dwzHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.recordedAt).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {entry.dwz}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.elo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {entry.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {member.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}