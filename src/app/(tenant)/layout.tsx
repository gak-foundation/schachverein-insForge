import { headers } from "next/headers";
import { getSessionWithClub } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getClubBySlug } from "@/lib/clubs/queries";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const isSubdomain = h.get("x-is-subdomain") === "true";
  const slug = h.get("x-club-slug");

  if (!isSubdomain || !slug) {
    // Not on a subdomain — should not render tenant layout
    // This can happen if someone accesses /dashboard directly on root domain
    redirect("/");
  }

  const club = await getClubBySlug(slug);
  if (!club || !club.isActive) {
    redirect("/404");
  }

  const session = await getSessionWithClub();
  if (!session) {
    redirect(`/auth/login`);
  }

  // Tenant isolation: user.clubId must match resolved club
  if (!session.user.isSuperAdmin && session.user.clubId !== club.id) {
    redirect(`/auth/error?reason=wrong_tenant`);
  }

  return (
    <div data-tenant={club.slug} data-club-id={club.id}>
      {children}
    </div>
  );
}
