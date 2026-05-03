"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";
import { parsePgn } from "@/lib/pgn";

export async function uploadPgn(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const pgnContent = formData.get("pgn") as string;
  const tournamentId = formData.get("tournamentId") as string | null;

  const parsedGames = parsePgn(pgnContent);

  const gamesToInsert = parsedGames.map((g) => ({
    club_id: clubId,
    tournament_id: tournamentId,
    white_name: g.white,
    black_name: g.black,
    result: g.result,
    lichess_url: g.pgn?.includes("lichess.org") ? g.pgn.match(/\[Site "(https:\/\/lichess\.org\/[^"]+)"\]/)?.[1] || null : null,
    event: g.event,
    date: g.date,
    round: g.round ? parseInt(g.round) : null,
  }));

  if (gamesToInsert.length > 0) {
    const { error } = await client.from('games').insert(gamesToInsert);
    if (error) throw error;
  }

  revalidatePath("/dashboard/games");
  return { success: true, count: gamesToInsert.length };
}

export async function getClubGames() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('games')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getGameById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('games')
    .select('*')
    .eq('id', id)
    .eq('club_id', clubId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}
