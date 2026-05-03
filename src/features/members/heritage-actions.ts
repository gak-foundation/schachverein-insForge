"use server";

import { createServiceClient } from "@/lib/insforge";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function setHeritageGame(gameId: string) {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const memberId = session.user.memberId;
  const client = createServiceClient();

  // Verify game exists and belongs to member (optionally)
  const { data: game, error } = await client
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle();

  if (error) throw error;
  if (!game) {
    throw new Error("Partie nicht gefunden");
  }

  const { error: uError } = await client
    .from('members')
    .update({ heritage_game_id: gameId })
    .eq('id', memberId);

  if (uError) throw uError;

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function getHeritageGame(memberId: string) {
  const client = createServiceClient();

  const { data: member, error } = await client
    .from('members')
    .select('heritage_game_id')
    .eq('id', memberId)
    .maybeSingle();

  if (error) throw error;
  if (!member?.heritage_game_id) return null;

  const { data: game, error: gError } = await client
    .from('games')
    .select('*')
    .eq('id', member.heritage_game_id)
    .maybeSingle();

  if (gError) throw gError;

  return game || null;
}
