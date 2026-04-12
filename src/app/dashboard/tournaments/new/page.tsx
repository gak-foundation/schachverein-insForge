import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSeasons } from "@/lib/actions";
import { createTournament } from "@/lib/actions";
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
  title: "Neues Turnier",
};

export default async function NewTournamentPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const allSeasons = await getSeasons();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neues Turnier</h1>
      </div>

      <form action={createTournament} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Turnier-Details</CardTitle>
            <CardDescription>Erstelle ein neues Turnier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="z.B. Vereinsmeisterschaft 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Typ *</Label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="round_robin">Rundenturnier</option>
                <option value="swiss">Schweizer System</option>
                <option value="rapid">Schnellschach</option>
                <option value="blitz">Blitz</option>
                <option value="team_match">Mannschaftskampf</option>
                <option value="club_championship">Vereinsmeisterschaft</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seasonId">Saison</Label>
              <select
                id="seasonId"
                name="seasonId"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Keine Saison</option>
                {allSeasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Beginn *</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ende</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input id="location" name="location" placeholder="z.B. Vereinsheim" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timeControl">Bedenkzeit</Label>
                <Input id="timeControl" name="timeControl" placeholder="z.B. 90+30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfRounds">Runden</Label>
                <Input id="numberOfRounds" name="numberOfRounds" type="number" min="1" max="20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400"
                placeholder="Details zum Turnier..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/tournaments">
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">Turnier anlegen</Button>
        </div>
      </form>
    </div>
  );
}