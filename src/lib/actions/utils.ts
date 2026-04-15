"use server";

import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { authUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentClubId(): Promise<string | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({ activeClubId: authUsers.activeClubId })
    .from(authUsers)
    .where(eq(authUsers.id, session.user.id));

  return user?.activeClubId ?? null;
}

export async function requireClubId(): Promise<string> {
  const clubId = await getCurrentClubId();
  if (!clubId) {
    throw new Error("Kein Verein ausgewählt");
  }
  return clubId;
}
