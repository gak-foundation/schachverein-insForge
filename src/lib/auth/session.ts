import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { ROLE_PERMISSIONS, Permission } from "./permissions";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getClubAddons } from "@/lib/billing/queries";
import type { AddonId, PlanId } from "@/lib/billing/addons";

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
        clubId: userData?.clubId,
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

// Extended session with club context (resolved via subdomain/membership)
export const getSessionWithClub = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  // Strict tenancy: clubId must be set for non-super-admins
  let club = null;
  if (session.user.isSuperAdmin) {
    // Super-admins have no fixed club; they browse via root domain
    return { ...session, club: null };
  }

  if (session.user.clubId) {
    try {
      const [clubData] = await db
        .select()
        .from(clubs)
        .where(eq(clubs.id, session.user.clubId))
        .limit(1);
      
      if (clubData) {
        const activeAddons = await getClubAddons(clubData.id);
        club = {
          ...clubData,
          plan: clubData.plan as PlanId,
          activeAddons: activeAddons as AddonId[],
        };
      }
    } catch (error) {
      console.error("Error fetching club context:", error);
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

export async function requireClubAuth() {
  const sessionWithClub = await getSessionWithClub();
  if (!sessionWithClub) {
    throw new Error("UNAUTHORIZED");
  }
  if (sessionWithClub.user.isSuperAdmin) {
    return sessionWithClub;
  }
  if (!sessionWithClub.club) {
    throw new Error("Kein Verein zugeordnet");
  }
  return sessionWithClub;
}

// Require club and return the club object directly (for actions that only need the club)
export async function requireClub() {
  const sessionWithClub = await getSessionWithClub();
  if (!sessionWithClub) {
    throw new Error("UNAUTHORIZED");
  }
  if (!sessionWithClub.club) {
    throw new Error("Kein Verein zugeordnet");
  }
  return sessionWithClub.club;
}

// Require club ID and return it directly
export async function requireClubId() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (!session.user.clubId) {
    throw new Error("Kein Verein zugeordnet");
  }
  return session.user.clubId;
}

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
