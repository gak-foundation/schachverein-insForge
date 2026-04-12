import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTeams, getSeasons } from "@/lib/actions";
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

export const metadata = {
  title: "Mannschaften",
};

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [allTeams, allSeasons] = await Promise.all([
    getTeams(),
    getSeasons(),
  ]);

  const currentSeason = allSeasons[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mannschaften</h1>
          <p className="text-sm text-gray-500">
            {allTeams.length} Mannschaften in der aktuellen Saison
          </p>
        </div>
        <Link href="/dashboard/teams/new">
          <Button>Neue Mannschaft</Button>
        </Link>
      </div>

      {allSeasons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Erstelle zuerst eine Saison, um Mannschaften anzulegen.
          </CardContent>
        </Card>
      ) : allTeams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Mannschaften angelegt. Klicke auf &ldquo;Neue Mannschaft&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Saison {currentSeason?.name ?? "Aktuelle Saison"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mannschaft</TableHead>
                  <TableHead>Liga</TableHead>
                  <TableHead>Besetzung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTeams.map((team) => (
                  <TableRow key={team.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/teams/${team.id}`}>
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {team.league ? (
                        <Badge variant="outline">{team.league}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      Brettaufstellung ansehen
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