import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getMemberById, updateMember } from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Mitglied bearbeiten",
};

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Mitglied nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/members/${id}`}
          className="text-gray-500 hover:text-gray-700"
        >
          &larr; Zurueck
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {member.firstName} {member.lastName} bearbeiten
        </h1>
      </div>

      <form action={updateMember} className="space-y-6">
        <input type="hidden" name="id" value={id} />
        <Card>
          <CardHeader>
            <CardTitle>Persoenliche Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input id="firstName" name="firstName" required defaultValue={member.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input id="lastName" name="lastName" required defaultValue={member.lastName} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" name="email" type="email" required defaultValue={member.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" defaultValue={member.phone ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={member.dateOfBirth ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Geschlecht</Label>
                <select
                  id="gender"
                  name="gender"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  defaultValue={member.gender ?? ""}
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

        <Card>
          <CardHeader>
            <CardTitle>Schach-Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dwz">DWZ</Label>
                <Input id="dwz" name="dwz" type="number" min="0" max="3000" defaultValue={member.dwz ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elo">Elo</Label>
                <Input id="elo" name="elo" type="number" min="0" max="3500" defaultValue={member.elo ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lichessUsername">Lichess-Username</Label>
                <Input id="lichessUsername" name="lichessUsername" defaultValue={member.lichessUsername ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chesscomUsername">Chess.com-Username</Label>
                <Input id="chesscomUsername" name="chesscomUsername" defaultValue={member.chesscomUsername ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dwzId">DWZ-ID (DeWIS)</Label>
              <Input id="dwzId" name="dwzId" defaultValue={member.dwzId ?? ""} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitgliedschaft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  defaultValue={member.role}
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
                  defaultValue={member.status}
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
                  defaultChecked={member.photoConsent ?? false}
                />
                <Label htmlFor="photoConsent">Foto-Einwilligung</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletterConsent"
                  name="newsletterConsent"
                  className="h-4 w-4 rounded border-gray-300"
                  defaultChecked={member.newsletterConsent ?? false}
                />
                <Label htmlFor="newsletterConsent">Newsletter-Einwilligung</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resultPublicationConsent"
                  name="resultPublicationConsent"
                  defaultChecked={member.resultPublicationConsent ?? true}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="resultPublicationConsent">Ergebnisse veroeffentlichen</Label>
              </div>
            </div>
          </CardContent>
        </Card>

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
              defaultValue={member.notes ?? ""}
              placeholder="Interne Notizen zum Mitglied..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/members/${id}`}>
            <Button variant="outline" type="button">Abbrechen</Button>
          </Link>
          <Button type="submit">Aenderungen speichern</Button>
        </div>
      </form>
    </div>
  );
}