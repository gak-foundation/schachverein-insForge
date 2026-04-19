"use server";

import { db } from "@/lib/db";
import { members, games } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function setHeritageGame(gameId: string) {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const memberId = session.user.memberId;

  // Verify game exists and belongs to member (optionally)
  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId));

  if (!game) {
    throw new Error("Partie nicht gefunden");
  }

  await db
    .update(members)
    .set({ heritageGameId: gameId })
    .where(eq(members.id, memberId));

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function getHeritageGame(memberId: string) {
  const [member] = await db
    .select({ heritageGameId: members.heritageGameId })
    .from(members)
    .where(eq(members.id, memberId));

  if (!member?.heritageGameId) return null;

  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.id, member.heritageGameId));

  return game || null;
}
