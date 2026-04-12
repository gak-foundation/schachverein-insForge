import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createGame, getTournaments, getMembers } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Neue Partie",
};

export default async function NewGamePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [allTournaments, allMembers] = await Promise.all([
    getTournaments(),
    getMembers(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/games" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neue Partie</h1>
      </div>

      <form action={createGame} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Partie-Details</CardTitle>
            <CardDescription>Erfasse eine neue Schachpartie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tournamentId">Turnier *</Label>
              <select
                id="tournamentId"
                name="tournamentId"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Turnier auswaehlen...</option>
                {allTournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="round">Runde *</Label>
                <Input id="round" name="round" type="number" min="1" required defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardNumber">Brett</Label>
                <Input id="boardNumber" name="boardNumber" type="number" min="1" placeholder="z.B. 1" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whiteId">Weiss *</Label>
                <select
                  id="whiteId"
                  name="whiteId"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="">Spieler auswaehlen...</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blackId">Schwarz *</Label>
                <select
                  id="blackId"
                  name="blackId"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="">Spieler auswaehlen...</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="result">Ergebnis</Label>
                <select
                  id="result"
                  name="result"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Noch kein Ergebnis</option>
                  <option value="1-0">1-0 (Weiss gewinnt)</option>
                  <option value="0-1">0-1 (Schwarz gewinnt)</option>
                  <option value="1/2-1/2">1/2-1/2 (Remis)</option>
                  <option value="+-">+- (Weiss kampflos)</option>
                  <option value="-+">-+ (Schwarz kampflos)</option>
                  <option value="+/+">+/+ (beide kampflos)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeControl">Bedenkzeit</Label>
                <Input id="timeControl" name="timeControl" placeholder="z.B. 90+30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ecoCode">ECO-Code</Label>
              <Input id="ecoCode" name="ecoCode" placeholder="z.B. B12" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PGN (optional)</CardTitle>
            <CardDescription>Partie im PGN-Format einfuegen</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              id="pgn"
              name="pgn"
              rows={8}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-400"
              placeholder="[Event &quot;Vereinsmeisterschaft&quot;]
[Site &quot;Vereinsheim&quot;]
[Date &quot;2026.04.10&quot;]
[White &quot;Mueller&quot;]
[Black &quot;Schmidt&quot;]
[Result &quot;1-0&quot;]

1. e4 e5 2. Nf3 Nc6 3. Bb5..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/games">
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">Partie anlegen</Button>
        </div>
      </form>
    </div>
  );
}