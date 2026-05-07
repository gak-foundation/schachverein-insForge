import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllClubsAction, toggleClubStatusAction } from "@/lib/clubs/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminClubsPage() {
  const session = await getSessionWithClub();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allClubs = await getAllClubsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vereinsverwaltung</h1>
        <Link
          href="/admin/clubs/create"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Neuer Verein
        </Link>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Stripe Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Mitglieder</th>
                <th className="px-6 py-4 font-medium">Stripe Connect</th>
                <th className="px-6 py-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allClubs.map((club: any) => (
                <tr key={club.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{club.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{club.slug}</td>
                  <td className="px-6 py-4 capitalize">{club.stripeCustomerId ? "Ja" : "Nein"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        club.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {club.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{club.memberCount}</td>
                  <td className="px-6 py-4">
                    {club.stripeConnectAccountId ? (
                      <span className="text-green-600 dark:text-green-400 text-xs">Verbunden</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Nicht verbunden</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await toggleClubStatusAction(club.id, !club.isActive);
                        }}
                      >
                        <Button
                          type="submit"
                          variant={club.isActive ? "destructive" : "default"}
                          size="sm"
                        >
                          {club.isActive ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
