import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getGameById } from "@/lib/actions";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Partie",
};

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

  const [whitePlayer, blackPlayer] = await Promise.all([
    db.select({ firstName: members.firstName, lastName: members.lastName }).from(members).where(eq(members.id, game.whiteId)).then((r) => r[0]),
    db.select({ firstName: members.firstName, lastName: members.lastName }).from(members).where(eq(members.id, game.blackId)).then((r) => r[0]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/games" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {whitePlayer ? `${whitePlayer.firstName} ${whitePlayer.lastName}` : "—"} vs. {blackPlayer ? `${blackPlayer.firstName} ${blackPlayer.lastName}` : "—"}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline">Runde {game.round}</Badge>
            {game.boardNumber && <Badge variant="outline">Brett {game.boardNumber}</Badge>}
            {game.result ? (
              <Badge className="bg-green-100 text-green-800">{game.result}</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Offen</Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partie-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Ergebnis</dt>
              <dd className="font-medium text-lg">{game.result ?? "Noch nicht eingetragen"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Eroeffnung</dt>
              <dd className="font-medium">{game.opening ?? game.ecoCode ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Bedenkzeit</dt>
              <dd className="font-medium">{game.timeControl ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gespielt am</dt>
              <dd className="font-medium">
                {game.playedAt ? new Date(game.playedAt).toLocaleDateString("de-DE") : "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {game.pgn && (
        <Card>
          <CardHeader>
            <CardTitle>PGN</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-4 rounded-md font-mono">
              {game.pgn}
            </pre>
          </CardContent>
        </Card>
      )}

      {game.fen && (
        <Card>
          <CardHeader>
            <CardTitle>FEN (Endstellung)</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs bg-gray-50 p-2 rounded font-mono">{game.fen}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}