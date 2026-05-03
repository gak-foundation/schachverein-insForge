import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getClubPlan, getClubAddons } from "@/lib/billing/queries";
import { AddonGrid } from "@/features/billing/components/addon-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";
import { createServerAuthClient } from "@/lib/insforge";

export const metadata: Metadata = {
  title: "Addons & Erweiterungen",
  description: "Erweitere deinen Verein mit professionellen Modulen",
};

export default async function AddonsPage({
  searchParams,
}: {
  searchParams: Promise<{ clubId?: string; success?: string; canceled?: string }>;
}) {
  const client = await createServerAuthClient();
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) redirect("/auth/signin");

  const params = await searchParams;
  const clubId = params.clubId;

  if (!clubId) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Addons & Erweiterungen</h1>
        <p className="text-muted-foreground mt-2">Bitte wähle einen Verein aus.</p>
      </div>
    );
  }

  const activeAddons = await getClubAddons(clubId);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Addons & Erweiterungen
        </h1>
        <p className="text-muted-foreground mt-1">
          Dein Verein ist in der Basis-Version kostenlos. Wähle professionelle Addons nach Bedarf.
        </p>
      </div>

      {params.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm">
            Addon erfolgreich aktiviert!
          </p>
        </div>
      )}

      {params.canceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-amber-800 text-sm">Buchung abgebrochen. Du kannst es jederzeit erneut versuchen.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basis-Funktionen — Kostenlos</CardTitle>
          <CardDescription>
            Diese Funktionen sind für jeden Verein immer verfügbar, ohne Kosten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Unbegrenzte Mitglieder",
              "Mitgliederverwaltung",
              "Öffentliche Vereinsseite",
              "Terminkalender",
              "Mannschaftsaufstellungen",
              "DSGVO-konforme Datenverarbeitung",
              "E-Mail-Support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Verfügbare Addons</h2>
        <AddonGrid activeAddons={activeAddons} clubId={clubId} />
      </div>
    </div>
  );
}
