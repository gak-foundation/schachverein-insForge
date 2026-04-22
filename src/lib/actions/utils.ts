"use server";

import { getSession } from "@/lib/auth/session";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";

export async function getCurrentClubId(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const user = await getAuthUserWithClub(session.user.id);

  return user?.activeClubId ?? null;
}

export async function requireClubId(): Promise<string> {
  const clubId = await getCurrentClubId();
  if (!clubId) {
    throw new Error("Kein Verein ausgewählt");
  }
  return clubId;
}
