import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ClubProvider } from "@/lib/club-context";
import { ClubSwitcher } from "@/features/clubs/components/club-switcher";
import { getUserClubs } from "@/lib/clubs/queries";
import Image from "next/image";
import type { PlanId } from "@/lib/billing/addons";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithClub();

  if (!session) {
    redirect("/auth/login");
  }

  // If authenticated but no club, allow rendering (DashboardPage will show creation UI)
  const isSuperAdmin = session.user.isSuperAdmin;
  const hasNoClub = !session.club && !isSuperAdmin;

  const user = session.user;
  const role = user?.role as string ?? "mitglied";
  const permissions = (user?.permissions as string[]) ?? [];

  // Get all user's clubs for the switcher
  const userClubs = user.memberId ? await getUserClubs(user.memberId) : [];

  return (
    <ClubProvider
      initialClub={session.club ? {
        id: session.club.id,
        name: session.club.name,
        slug: session.club.slug,
        logoUrl: session.club.logoUrl,
        plan: session.club.plan as PlanId,
        activeAddons: session.club.activeAddons || [],
        isActive: session.club.isActive,
      } : null}
      userClubs={userClubs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logoUrl: c.logoUrl,
        plan: c.plan as PlanId,
        activeAddons: [], // We only need activeAddons for the current club usually
        isActive: c.isActive,
      }))}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          role={role}
          permissions={permissions}
          isSuperAdmin={user.isSuperAdmin}
          clubSwitcher={<ClubSwitcher />}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{role}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center border shadow-sm overflow-hidden relative">
                 {user.image ? (
                   <Image src={user.image} alt={user.name} fill className="object-cover" />
                 ) : (
                   <span className="text-sm font-bold text-accent-foreground">{user.name.substring(0, 2).toUpperCase()}</span>
                 )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mx-auto max-w-7xl px-8 py-10">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ClubProvider>
  );
}
