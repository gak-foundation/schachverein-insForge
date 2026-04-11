import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getGames } from "@/lib/actions";
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
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export const metadata = {
  title: "Partien",
};

export default async function GamesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const canWrite = hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.GAMES_WRITE);
  const allGames = await getGames();

  const allMemberIds = new Set<string>();
  allGames.forEach((g) => {
    if (g.whiteId) allMemberIds.add(g.whiteId);
    if (g.blackId) allMemberIds.add(g.blackId);
  });

  const memberList = allMemberIds.size > 0
    ? await db
        .select({ id: members.id, firstName: members.firstName, lastName: members.lastName })
        .from(members)
        .where(inArray(members.id, Array.from(allMemberIds)))
    : [];

  const memberMap = new Map(memberList.map((m) => [m.id, `${m.firstName} ${m.lastName}`]));

  const resultLabels: Record<string, string> = {
    "1-0": "1-0",
    "0-1": "0-1",
    "1/2-1/2": "Remis",
    "+-": "+-",
    "-+": "-+",
    "+/+": "+/+",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partien</h1>
          <p className="text-sm text-gray-500">
            {allGames.length} Partien insgesamt
          </p>
        </div>
        {canWrite && (
          <Link href="/dashboard/games/new">
            <Button>Neue Partie</Button>
          </Link>
        )}
      </div>

      {allGames.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Partien erfasst. Klicke auf &ldquo;Neue Partie&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Partien</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Runde</TableHead>
                  <TableHead>Brett</TableHead>
                  <TableHead>Weiss</TableHead>
                  <TableHead>Schwarz</TableHead>
                  <TableHead>Ergebnis</TableHead>
                  <TableHead>Eroeffnung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGames.map((game) => (
                  <TableRow key={game.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>{game.round}</TableCell>
                    <TableCell>{game.boardNumber ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/members/${game.whiteId}`} className="hover:underline">
                        {memberMap.get(game.whiteId) ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/members/${game.blackId}`} className="hover:underline">
                        {memberMap.get(game.blackId) ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {game.result ? (
                        <Badge variant="outline" className="text-xs">{resultLabels[game.result] ?? game.result}</Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">offen</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {game.opening ?? game.ecoCode ?? "—"}
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