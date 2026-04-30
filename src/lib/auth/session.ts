import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cache } from "react";
import { headers } from "next/headers";
import { ROLE_PERMISSIONS, Permission } from "./permissions";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getClubAddons } from "@/lib/billing/queries";
import type { AddonId, PlanId } from "@/lib/billing/addons";
import { getClubById, getClubBySlug } from "@/lib/clubs/queries";

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

    // Fetch additional user data from database.
    // getAuthUserWithClub already handles its own fallbacks (REST vs Drizzle)
    const userData = await getAuthUserWithClub(user.id);


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

  const user = session.user;
  let club = null;

  // 1. Determine which club ID or slug to look for
  let clubIdLookup = user.clubId;
  let clubSlugLookup = null;

  // For Super Admins or context switching, check headers (injected by proxy.ts middleware)
  try {
    const headerList = await headers();
    const headerSlug = headerList.get("x-club-slug");
    if (headerSlug) {
      clubSlugLookup = headerSlug;
    }
  } catch (e) {
    // Headers might not be available in all contexts (e.g. edge cases)
  }

  // 2. Resolve the club
  try {
    let clubData = null;

    // Prefer slug from header (subdomain context)
    if (clubSlugLookup) {
      clubData = await getClubBySlug(clubSlugLookup);
    } 
    // Fallback to user's assigned club
    else if (clubIdLookup) {
      clubData = await getClubById(clubIdLookup);
    }

    if (clubData) {
      const activeAddons = await getClubAddons(clubData.id);
      club = {
        ...clubData,
        plan: clubData.plan as PlanId,
        activeAddons: activeAddons as AddonId[],
      };
    }
  } catch (error) {
    console.error("Error fetching club context in getSessionWithClub:", error);
  }

  // Super-Admins without a club context (e.g. on root domain) are fine
  if (!club && user.isSuperAdmin) {
    return { ...session, club: null };
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
