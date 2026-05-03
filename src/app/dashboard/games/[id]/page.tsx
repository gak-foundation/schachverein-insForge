import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getGameById } from "@/lib/actions/games";
import { createServiceClient } from "@/lib/insforge";
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

  const client = createServiceClient();
  const [whiteResult, blackResult] = await Promise.all([
    game.whiteId
      ? client
          .from("members")
          .select("first_name, last_name")
          .eq("id", game.whiteId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    game.blackId
      ? client
          .from("members")
          .select("first_name, last_name")
          .eq("id", game.blackId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const whitePlayer = whiteResult.data
    ? {
        firstName: whiteResult.data.first_name,
        lastName: whiteResult.data.last_name,
      }
    : null;

  const blackPlayer = blackResult.data
    ? {
        firstName: blackResult.data.first_name,
        lastName: blackResult.data.last_name,
      }
    : null;

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
              <dt className="text-sm text-gray-500">Bedenkzeit</dt>
              <dd className="font-medium">—</dd>
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

      {game.lichessUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse auf Lichess</CardTitle>
          </CardHeader>
          <CardContent>
            <Link 
              href={game.lichessUrl} 
              target="_blank" 
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              Diese Partie auf Lichess.org ansehen &rarr;
            </Link>
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
