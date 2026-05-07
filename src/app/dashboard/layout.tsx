import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ClubProvider } from "@/lib/club-context";
import { ClubSwitcher } from "@/features/clubs/components/club-switcher";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";
import { getUserClubs } from "@/lib/clubs/queries";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import Image from "next/image";
import type { PlanId } from "@/lib/billing/addons";

export const dynamic = "force-dynamic";

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
        {session.isImpersonating && session.club && (
          <ImpersonationBanner clubName={session.club.name} />
        )}
        <Sidebar
          role={role}
          permissions={permissions}
          clubSwitcher={<ClubSwitcher />}
        />
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          {/* Top Header */}
          <header className="flex h-20 items-center justify-between px-10 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold tracking-tight">{user.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{ROLE_LABELS[role] || role}</span>
              </div>
              <div className="h-9 w-9 rounded-none bg-primary flex items-center justify-center overflow-hidden relative">
                 {user.image ? (
                   <Image src={user.image} alt={user.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 ) : (
                   <span className="text-xs font-bold text-primary-foreground font-heading">{user.name.substring(0, 2).toUpperCase()}</span>
                 )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mx-auto max-w-6xl px-10 py-12">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ClubProvider>
  );
}
