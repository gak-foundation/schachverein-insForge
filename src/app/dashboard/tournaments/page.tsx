import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTournaments } from "@/lib/actions";
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
import Link from "next/link";

const typeLabels: Record<string, string> = {
  swiss: "Schweizer System",
  round_robin: "Rundenturnier",
  rapid: "Schnellschach",
  blitz: "Blitz",
  team_match: "Mannschaftskampf",
  club_championship: "Vereinsmeisterschaft",
};

export const metadata = {
  title: "Turniere",
};

export default async function TournamentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const allTournaments = await getTournaments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turniere</h1>
          <p className="text-sm text-gray-500">
            {allTournaments.length} Turniere insgesamt
          </p>
        </div>
        <Link href="/dashboard/tournaments/new">
          <Button>Neues Turnier</Button>
        </Link>
      </div>

      {allTournaments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Turniere angelegt. Klicke auf &ldquo;Neues Turnier&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Turniere</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turnier</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTournaments.map((tournament) => (
                  <TableRow key={tournament.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/tournaments/${tournament.id}`}>
                        {tournament.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[tournament.type] ?? tournament.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tournament.startDate).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {tournament.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      {tournament.isCompleted ? (
                        <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">Aktiv</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}