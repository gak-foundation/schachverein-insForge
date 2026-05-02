import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/insforge";
import { getAuthUserById } from "@/lib/db/queries/auth";
import { getClubBySlug } from "@/lib/clubs/queries";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getCurrentUser();

  if (error || !data?.user) {
    return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 });
  }

  const user = data.user;
  const h = await headers();
  const slug = h.get("x-club-slug");
  const isSubdomain = h.get("x-is-subdomain") === "true";

  if (!isSubdomain) {
    // Root domain login is allowed for super-admins
    const authUser = await getAuthUserById(user.id);
    
    if (authUser?.isSuperAdmin || !authUser?.clubId) {
      return NextResponse.json({ 
        ok: true, 
        isSuperAdmin: authUser?.isSuperAdmin || false
      });
    }
    return NextResponse.json({ error: "Nur auf Subdomain anmelden", ok: false }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "No slug", ok: false }, { status: 400 });
  }

  const authUser = await getAuthUserById(user.id);
  if (!authUser) {
    return NextResponse.json({ error: "User not found", ok: false }, { status: 404 });
  }

  // Super-admin can login anywhere
  if (authUser.isSuperAdmin) {
    return NextResponse.json({ ok: true, isSuperAdmin: true });
  }

  const club = await getClubBySlug(slug);
  if (!club) {
    return NextResponse.json({ error: "Club nicht gefunden", ok: false }, { status: 404 });
  }

  if (!club.isActive) {
    return NextResponse.json({ error: "Club deaktiviert", ok: false }, { status: 403 });
  }

  // Strict tenancy check
  if (authUser.clubId !== club.id) {
    return NextResponse.json(
      {
        error: "Dieser Account gehoert zu einem anderen Verein",
        ok: false,
        userClubId: authUser.clubId,
        requestedClub: club.id,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, club: { id: club.id, name: club.name, slug: club.slug } });
}
