import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllInvitationsAction, revokeInvitationAction } from "@/lib/clubs/actions";
import { getAllClubsAction } from "@/lib/clubs/actions";
import { getInvitationUrl } from "@/lib/auth/invitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "./invite-form";
import { Link2 } from "lucide-react";

export const metadata = {
  title: "Einladungen | Super Admin",
};

export default async function AdminInvitationsPage() {
  const session = await getSessionWithClub();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const [invitations, allClubs] = await Promise.all([
    getAllInvitationsAction(),
    getAllClubsAction(),
  ]);

  const memberRoles = [
    { value: "mitglied", label: "Mitglied" },
    { value: "admin", label: "Admin" },
    { value: "vorstand", label: "Vorstand" },
    { value: "spielleiter", label: "Spielleiter" },
    { value: "jugendwart", label: "Jugendwart" },
    { value: "kassenwart", label: "Kassenwart" },
    { value: "trainer", label: "Trainer" },
    { value: "eltern", label: "Eltern" },
  ];

  const roleLabels: Record<string, string> = Object.fromEntries(
    memberRoles.map((r) => [r.value, r.label])
  );

  const clubsForSelect = allClubs
    .filter((c: any) => c.isActive)
    .map((c: any) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Einladungen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invitations.length} Einladungen insgesamt
          </p>
        </div>
      </div>

      <InviteForm clubs={clubsForSelect} roles={memberRoles} />

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-4 font-medium">E-Mail</th>
                <th className="px-6 py-4 font-medium">Verein</th>
                <th className="px-6 py-4 font-medium">Rolle</th>
                <th className="px-6 py-4 font-medium">Eingeladen von</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Erstellt</th>
                <th className="px-6 py-4 font-medium">Läuft ab</th>
                <th className="px-6 py-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    Keine Einladungen vorhanden.
                  </td>
                </tr>
              )}
              {invitations.map((inv: any) => {
                const isExpired = new Date(inv.expiresAt) < new Date();
                const isUsed = !!inv.usedAt;
                const status = isUsed ? "used" : isExpired ? "expired" : "pending";
                const invitationUrl = getInvitationUrl(inv.token);

                return (
                  <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{inv.email}</td>
                    <td className="px-6 py-4">{inv.clubName}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">
                        {roleLabels[inv.role] || inv.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{inv.invitedByName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === "pending"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : status === "used"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {status === "pending" ? "Ausstehend" : status === "used" ? "Angenommen" : "Abgelaufen"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {status === "pending" && (
                          <>
                            <a
                              href={invitationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                              title={invitationUrl}
                            >
                              <Link2 className="h-3.5 w-3.5 mr-1.5" />
                              Link
                            </a>
                            <form
                              action={async () => {
                                "use server";
                                await revokeInvitationAction(inv.id);
                              }}
                            >
                              <Button type="submit" variant="destructive" size="sm">
                                Widerrufen
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
