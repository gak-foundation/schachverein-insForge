import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getClubGames } from "@/lib/actions/pgn-cloud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileUp, Eye } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Partie-Archiv",
};

export default async function GamesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const games: { id: string; date?: string; whiteName: string; blackName: string; result: string; event?: string }[] = await getClubGames();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partie-Archiv (Lichess)</h1>
          <p className="text-sm text-gray-500">Zentrales Archiv für Vereinspartien mit Verlinkung zu Lichess.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/games/new">
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Partie importieren
            </Button>
          </Link>
          <Link href="/dashboard/games/analysis">
            <Button>
              Analysebrett öffnen
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gespielte Partien</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Weiß</TableHead>
                <TableHead>Schwarz</TableHead>
                <TableHead>Ergebnis</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Keine Partien im Archiv gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{game.date || "TBA"}</TableCell>
                    <TableCell className="font-medium">{game.whiteName}</TableCell>
                    <TableCell className="font-medium">{game.blackName}</TableCell>
                    <TableCell>{game.result}</TableCell>
                    <TableCell className="text-muted-foreground">{game.event || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/games/${game.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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
