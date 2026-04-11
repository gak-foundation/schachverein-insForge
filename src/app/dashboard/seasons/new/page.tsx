import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSeason } from "@/lib/actions";
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
  title: "Neue Saison",
};

export default async function NewSeasonPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/seasons" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neue Saison</h1>
      </div>

      <form action={createSeason} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Saison-Daten</CardTitle>
            <CardDescription>Erstelle eine neue Saison für Mannschaften und Turniere</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="z.B. Saison 2026/2027" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Jahr *</Label>
              <Input id="year" name="year" type="number" min="2000" max="2100" required placeholder="2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="club_internal">Vereinsintern</option>
                <option value="kreisklasse">Kreisklasse</option>
                <option value="bezirksliga">Bezirksliga</option>
                <option value="bundesliga">Bundesliga</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Beginn</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ende</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/seasons">
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">Saison anlegen</Button>
        </div>
      </form>
    </div>
  );
}