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
import { createMember } from "@/lib/actions/members";

export const metadata = {
  title: "Neues Mitglied",
};

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/members"
          className="text-gray-500 hover:text-gray-700"
        >
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Neues Mitglied</h1>
      </div>

      <form action={createMember} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Persoenliche Daten</CardTitle>
            <CardDescription>
              Grundlegende Informationen zum neuen Mitglied
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Geschlecht</Label>
                <select
                  id="gender"
                  name="gender"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Keine Angabe</option>
                  <option value="maennlich">Maennlich</option>
                  <option value="weiblich">Weiblich</option>
                  <option value="divers">Divers</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chess Information */}
        <Card>
          <CardHeader>
            <CardTitle>Schach-Daten</CardTitle>
            <CardDescription>DWZ, Elo und Online-Accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dwz">DWZ</Label>
                <Input id="dwz" name="dwz" type="number" min="0" max="3000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elo">Elo</Label>
                <Input id="elo" name="elo" type="number" min="0" max="3500" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lichessUsername">Lichess-Username</Label>
                <Input id="lichessUsername" name="lichessUsername" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chesscomUsername">Chess.com-Username</Label>
                <Input id="chesscomUsername" name="chesscomUsername" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dwzId">DWZ-ID (DeWIS)</Label>
              <Input id="dwzId" name="dwzId" placeholder="z.B. 12345678" />
            </div>
          </CardContent>
        </Card>

        {/* Membership Information */}
        <Card>
          <CardHeader>
            <CardTitle>Mitgliedschaft</CardTitle>
            <CardDescription>Rolle, Status und Einwilligungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="mitglied">Mitglied</option>
                  <option value="admin">Admin</option>
                  <option value="vorstand">Vorstand</option>
                  <option value="sportwart">Sportwart</option>
                  <option value="jugendwart">Jugendwart</option>
                  <option value="kassenwart">Kassenwart</option>
                  <option value="trainer">Trainer</option>
                  <option value="eltern">Eltern-Zugang</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="honorary">Ehrenmitglied</option>
                  <option value="resigned">Ausgetreten</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="photoConsent"
                  name="photoConsent"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="photoConsent">Foto-Einwilligung</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletterConsent"
                  name="newsletterConsent"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="newsletterConsent">Newsletter-Einwilligung</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resultPublicationConsent"
                  name="resultPublicationConsent"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="resultPublicationConsent">
                  Ergebnisse veroeffentlichen
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Creation (optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Zugangsdaten (optional)</CardTitle>
            <CardDescription>
              Login-Daten fuer die Vereinsverwaltung anlegen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createAccount"
                name="createAccount"
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="createAccount">
                Login-Account erstellen
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400"
              placeholder="Interne Notizen zum Mitglied..."
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/members">
            <Button variant="outline" type="button">
              Abbrechen
            </Button>
          </Link>
          <Button type="submit">Mitglied anlegen</Button>
        </div>
      </form>
    </div>
  );
}