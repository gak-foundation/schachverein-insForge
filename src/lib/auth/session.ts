import { headers } from "next/headers";
import { auth } from "@/lib/auth/better-auth";
import { clubs } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

type MemberRole = "admin" | "vorstand" | "sportwart" | "jugendwart" | "kassenwart" | "trainer" | "mitglied" | "eltern" | "user";

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  role: MemberRole;
  memberId?: string | null;
  activeClubId?: string | null;
  isSuperAdmin: boolean;
  permissions?: string[];
}

export interface ClubContext {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
}

export interface SessionWithRole {
  user: UserWithRole;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export interface SessionWithClub extends SessionWithRole {
  club: ClubContext | null;
}

export async function getSession(): Promise<SessionWithRole | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session as SessionWithRole | null;
}

export async function getSessionWithClub(): Promise<SessionWithClub | null> {
  const session = await getSession();
  if (!session) return null;

  let club: ClubContext | null = null;

  if (session.user.activeClubId) {
    const [clubData] = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        slug: clubs.slug,
        plan: clubs.plan,
        isActive: clubs.isActive,
      })
      .from(clubs)
      .where(eq(clubs.id, session.user.activeClubId));

    if (clubData) {
      club = clubData as ClubContext;
    }
  }

  return {
    ...session,
    club,
  };
}

export async function getActiveClubId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.activeClubId ?? null;
}

export async function requireClub(): Promise<ClubContext> {
  const session = await getSessionWithClub();
  if (!session?.club) {
    throw new Error("Kein Verein ausgewählt");
  }
  return session.club;
}

export async function requireAuth(): Promise<SessionWithClub> {
  const session = await getSessionWithClub();
  if (!session) {
    throw new Error("Nicht authentifiziert");
  }
  return session;
}

export type Session = SessionWithRole;
export type User = UserWithRole;
