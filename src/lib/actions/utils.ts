"use server";

import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";

export async function getCurrentClubId(): Promise<string | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  return session?.user?.activeClubId as string | null ?? null;
}

export async function requireClubId(): Promise<string> {
  const clubId = await getCurrentClubId();
  if (!clubId) {
    throw new Error("Kein Verein ausgewählt");
  }
  return clubId;
}
