import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

// Cached session getter for server components
export const getSession = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Fetch additional user data from database
    const { data: userData } = await supabase
      .from("auth_user")
      .select("*")
      .eq("id", user.id)
      .single();
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: userData?.name || user.user_metadata?.name || user.email?.split("@")[0],
        role: userData?.role || "mitglied",
        permissions: userData?.permissions || [],
        memberId: userData?.member_id,
        activeClubId: userData?.active_club_id,
        isSuperAdmin: userData?.is_super_admin || false,
        emailVerified: userData?.email_verified || false,
        image: userData?.image || user.user_metadata?.avatar_url,
      },
      session: {
        user,
      },
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
});

// Extended session with club context
export const getSessionWithClub = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  // Load club data if user has activeClubId
  let club = null;
  if (session.user.activeClubId) {
    try {
      const supabase = await createClient();
      const { data: clubData } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", session.user.activeClubId)
        .single();
      club = clubData;
    } catch {
      // Club not found, continue without
    }
  }

  return {
    ...session,
    club,
  };
});

// Require authentication - throws error if not authenticated
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// Require authentication with club context
export async function requireClubAuth() {
  const sessionWithClub = await getSessionWithClub();
  if (!sessionWithClub) {
    throw new Error("UNAUTHORIZED");
  }
  if (!sessionWithClub.club) {
    throw new Error("Kein Verein ausgewählt");
  }
  return sessionWithClub.club;
}

// Alias for compatibility
export const requireClub = requireClubAuth;

// Require specific permission
export async function requirePermission(permission: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  
  const user = session.user;
  
  if (user.isSuperAdmin) return session;
  
  if (user.permissions?.includes(permission)) return session;
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role || "mitglied"] || [];
  if (rolePermissions.includes(permission)) return session;
  
  throw new Error("FORBIDDEN");
}

// Role-based permissions mapping (for server-side checks)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"],
  vorstand: [
    "members.read",
    "members.write",
    "tournaments.read",
    "tournaments.write",
    "teams.read",
    "teams.write",
    "events.read",
    "events.write",
    "finance.read",
    "finance.write",
    "pages.read",
    "pages.write",
    "audit.read",
    "gdpr.read",
    "gdpr.write",
  ],
  sportwart: [
    "members.read",
    "tournaments.read",
    "tournaments.write",
    "teams.read",
    "teams.write",
    "events.read",
    "events.write",
  ],
  jugendwart: [
    "members.read",
    "members.write",
    "tournaments.read",
    "teams.read",
    "events.read",
    "events.write",
  ],
  kassenwart: [
    "members.read",
    "finance.read",
    "finance.write",
    "audit.read",
  ],
  trainer: [
    "members.read",
    "tournaments.read",
    "teams.read",
    "events.read",
  ],
  mitglied: [
    "members.read",
    "tournaments.read",
    "teams.read",
    "events.read",
  ],
  eltern: [
    "members.read",
    "tournaments.read",
    "teams.read",
    "events.read",
  ],
};
