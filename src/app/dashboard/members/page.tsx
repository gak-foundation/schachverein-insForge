import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { members, membershipStatusEnum } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Mitglieder",
};

export default async function MembersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Mitgliederverwaltung.</p>
      </div>
    );
  }

  const allMembers = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      dwz: members.dwz,
      elo: members.elo,
      role: members.role,
      status: members.status,
    })
    .from(members)
    .orderBy(desc(members.createdAt));

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    resigned: "bg-red-100 text-red-800",
    honorary: "bg-yellow-100 text-yellow-800",
  };

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-gray-500">
            {allMembers.length} Mitglieder insgesamt
          </p>
        </div>
        {hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE) && (
          <Link href="/dashboard/members/new">
            <Button>
              <span className="mr-2">+</span> Neues Mitglied
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input placeholder="Suche nach Name, E-Mail..." className="max-w-sm" />
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Alle Rollen</option>
              <option value="admin">Admin</option>
              <option value="vorstand">Vorstand</option>
              <option value="sportwart">Sportwart</option>
              <option value="jugendwart">Jugendwart</option>
              <option value="kassenwart">Kassenwart</option>
              <option value="trainer">Trainer</option>
              <option value="mitglied">Mitglied</option>
            </select>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="resigned">Ausgetreten</option>
              <option value="honorary">Ehrenmitglied</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mitgliederliste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead className="text-right">DWZ</TableHead>
                <TableHead className="text-right">Elo</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Noch keine Mitglieder angelegt. Klicke auf &ldquo;Neues Mitglied&rdquo; um zu beginnen.
                  </TableCell>
                </TableRow>
              ) : (
                allMembers.map((member) => (
                  <TableRow key={member.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/members/${member.id}`}>
                        {member.firstName} {member.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-500">{member.email}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {member.dwz ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {member.elo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[member.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[member.status] ?? member.status}
                      </span>
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