import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { ROLE_PERMISSIONS, Permission } from "./permissions";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Cached session getter for server components
export const getSession = cache(async () => {
  try {
    const supabase = await createClient();
    let user = null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        const isMissingSession =
          error.code === 'refresh_token_not_found' ||
          error.code === 'session_not_found' ||
          error.message?.toLowerCase().includes('session missing');

        if (!isMissingSession) {
          console.error("Auth error in getSession:", error.message);
        }
        return null;
      }
      user = data.user;
    } catch (error: any) {
      const isMissingSession =
        error?.code === 'refresh_token_not_found' ||
        error?.code === 'session_not_found' ||
        error?.message?.toLowerCase().includes('session missing');

      if (!isMissingSession) {
        console.error("Unexpected auth error in getSession:", error);
      }
      return null;
    }

    if (!user) {
      return null;
    }
    
    // Fetch additional user data from database using Drizzle
    const userData = await getAuthUserWithClub(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: userData?.name || user.user_metadata?.name || user.email?.split("@")[0],
        role: userData?.role || "mitglied",
        permissions: userData?.permissions || [],
        memberId: userData?.memberId,
        activeClubId: userData?.activeClubId,
        isSuperAdmin: userData?.isSuperAdmin || false,
        emailVerified: userData?.emailVerified || false,
        image: userData?.image || user.user_metadata?.avatar_url,
      },
      session: {
        user,
      },
    };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('dynamic-server-error')) {
      // Re-throw for Next.js to handle dynamic transition
      throw error;
    }
    console.error("Error getting session:", error);
    return null;
  }
});

// Extended session with club context
export const getSessionWithClub = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  // Load club data if user has activeClubId using Drizzle
  let club = null;
  if (session.user.activeClubId) {
    try {
      const [clubData] = await db
        .select()
        .from(clubs)
        .where(eq(clubs.id, session.user.activeClubId))
        .limit(1);
      club = clubData || null;
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
export async function requirePermission(permission: Permission) {
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
