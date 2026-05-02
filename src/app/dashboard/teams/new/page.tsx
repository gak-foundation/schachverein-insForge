import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSeasons } from "@/features/calendar/actions";
import { getMembersForForms } from "@/features/members/actions";
import { createTeam } from "@/features/teams/actions";
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
  title: "Neue Mannschaft",
};

export default async function NewTeamPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [allSeasons, allMembers] = await Promise.all([getSeasons(), getMembersForForms()]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/teams" className="text-gray-500 hover:text-gray-700">
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neue Mannschaft</h1>
      </div>

      {allSeasons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Erstelle zuerst eine <Link href="/dashboard/seasons/new" className="text-blue-600 hover:underline">Saison</Link>, um Mannschaften anzulegen.
          </CardContent>
        </Card>
      ) : (
        <form action={createTeam} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mannschafts-Daten</CardTitle>
              <CardDescription>Erstelle eine neue Mannschaft fuer eine Saison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required placeholder="z.B. 1. Mannschaft" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonId">Saison *</Label>
                <select
                  id="seasonId"
                  name="seasonId"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  {allSeasons.map((season: any) => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="league">Liga</Label>
                <Input id="league" name="league" placeholder="z.B. Bezirksliga Nord" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="captainId">Kapitaen</Label>
                <select
                  id="captainId"
                  name="captainId"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Kein Kapitaen</option>
                  {allMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/teams">
              <Button variant="outline" type="button">Abbrechen</Button>
            </Link>
            <Button type="submit">Mannschaft anlegen</Button>
          </div>
        </form>
      )}
    </div>
  );
}
