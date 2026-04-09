import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "Mitglied";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen, {firstName}!
        </h1>
        <p className="mt-1 text-gray-500">
          Hier ist dein Überblick über den Verein.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mitglieder</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Aktive Mitglieder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mannschaften</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Aktuelle Saison</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Naechster Spieltag</CardDescription>
            <CardTitle className="text-2xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Im Kalender</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offene Beitraege</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Ausstehende Zahlungen</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Info */}
      <Card>
        <CardHeader>
          <CardTitle>Deine Rolle</CardTitle>
          <CardDescription>
            Deine Berechtigungen im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {session.user.role}
            </span>
            <span className="text-sm text-gray-500">
              {session.user.permissions.length} Berechtigung(en)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}