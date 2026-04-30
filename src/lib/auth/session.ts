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

    // Check if user is a hard-coded super admin via ENV
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const isHardcodedAdmin = user.email ? superAdminEmails.includes(user.email) : false;

    // Fetch additional user data from database using Drizzle.
    // Degrade gracefully on DB errors to prevent redirect loops.
    let userData = null;
    try {
      userData = await getAuthUserWithClub(user.id);
    } catch (dbError: any) {
      if (dbError?.digest === 'DYNAMIC_SERVER_USAGE' || dbError?.message?.includes('dynamic-server-error')) {
        throw dbError;
      }

      const isPoolerError = dbError.message?.includes('Tenant or user not found') || dbError.code === 'XX000';
      
      // In development, we don't want to spam the console if the fallback works
      if (process.env.NODE_ENV !== 'development' || !isPoolerError) {
        console.error(
          "DB fetch failed in getSession (degraded session returned):",
          `code=${dbError.code || 'unknown'} severity=${dbError.severity || 'unknown'} message=${dbError.message}`
        );
      }

      // Fallback: try Supabase REST API which properly passes JWT claims for RLS
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('auth_user')
          .select('id, name, email, email_verified, image, role, permissions, member_id, club_id, is_super_admin')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          userData = {
            id: data.id,
            name: data.name,
            email: data.email,
            emailVerified: data.email_verified,
            image: data.image,
            role: data.role,
            permissions: data.permissions || [],
            memberId: data.member_id,
            clubId: data.club_id,
            isSuperAdmin: data.is_super_admin || false,
          };
        }
      } catch {
        // Both Drizzle and Supabase REST failed, session will be degraded
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: userData?.name || user.user_metadata?.name || user.email?.split("@")[0],
        role: userData?.role || (isHardcodedAdmin ? "admin" : "mitglied"),
        permissions: userData?.permissions || [],
        memberId: userData?.memberId,
        clubId: userData?.clubId,
        isSuperAdmin: userData?.isSuperAdmin || isHardcodedAdmin || false,
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
