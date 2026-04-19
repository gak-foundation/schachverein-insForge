import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { GDPRPortal } from "@/components/auth/gdpr-portal";
import { getHeritageGame } from "@/lib/actions/heritage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Profil & Einstellungen",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const user = session.user;
  const heritageGame = user.memberId ? await getHeritageGame(user.memberId) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil & Einstellungen</h1>
        <p className="text-sm text-gray-500">Verwalten Sie Ihre persoenlichen Daten und Kontoeinstellungen.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benutzerkonto</CardTitle>
            <CardDescription>Ihre grundlegenden Kontoinformationen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">E-Mail</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Rolle</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <p className="font-medium text-green-600">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Partie des Lebens (Heritage)</CardTitle>
            </div>
            <CardDescription>Ihre bedeutendste Partie dauerhaft im Vereinsarchiv.</CardDescription>
          </CardHeader>
          <CardContent>
            {heritageGame ? (
              <div className="rounded-lg border p-4 bg-accent/30">
                <p className="font-bold">{heritageGame.whiteName} vs {heritageGame.blackName}</p>
                <p className="text-sm text-muted-foreground">{heritageGame.event} ({heritageGame.date})</p>
                <p className="mt-2 font-mono text-xs">{heritageGame.result}</p>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Noch keine Partie als Heritage-Partie markiert.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {user.memberId && (
          <GDPRPortal memberId={user.memberId} />
        )}
      </div>
    </div>
  );
}

