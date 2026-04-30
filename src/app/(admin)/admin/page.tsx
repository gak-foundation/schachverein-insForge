import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllClubsAction } from "@/lib/clubs/actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const allClubs = await getAllClubsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Super-Admin Dashboard</h1>
        <Link
          href="/admin/clubs"
          className="text-sm text-primary hover:underline"
        >
          Alle Vereine →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Vereine</p>
          <p className="text-3xl font-bold mt-2">{allClubs.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Aktive Vereine</p>
          <p className="text-3xl font-bold mt-2">
            {allClubs.filter((c: any) => c.isActive).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Mitglieder gesamt</p>
          <p className="text-3xl font-bold mt-2">
            {allClubs.reduce((sum: number, c: any) => sum + (c.memberCount ?? 0), 0)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="pb-3">Name</th>
                <th className="pb-3">Slug</th>
                <th className="pb-3">Stripe Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Mitglieder</th>
                <th className="pb-3">Stripe Connect</th>
                <th className="pb-3">Erstellt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allClubs.slice(0, 10).map((club: any) => (
                <tr key={club.id} className="hover:bg-muted/50">
                  <td className="py-3 font-medium">{club.name}</td>
                  <td className="py-3 text-muted-foreground">{club.slug}</td>
                  <td className="py-3">{club.stripeCustomerId ? "Ja" : "Nein"}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        club.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {club.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="py-3">{club.memberCount}</td>
                  <td className="py-3 text-muted-foreground">
                    {club.stripeConnectAccountId ? "Verbunden" : "Nicht verbunden"}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(club.createdAt).toLocaleDateString("de-DE")}
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
