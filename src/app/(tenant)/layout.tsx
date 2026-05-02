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
  if (!club || !(club as any).isActive) {
    redirect("/404");
  }

  const session = await getSessionWithClub();
  if (!session) {
    redirect(`/auth/login`);
  }

  const clubAny = club as any;
  if (!session.user.isSuperAdmin && session.user.clubId !== clubAny.id) {
    redirect(`/auth/error?reason=wrong_tenant`);
  }

  return (
    <div data-tenant={clubAny.slug} data-club-id={clubAny.id}>
      {children}
    </div>
  );
}
