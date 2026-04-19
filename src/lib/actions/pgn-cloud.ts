"use server";

import { db } from "@/lib/db";
import { games, members, tournaments } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";
import { parsePgn } from "@/lib/pgn";

export async function uploadPgn(formData: FormData) {
  const clubId = await requireClubId();
  const pgnContent = formData.get("pgn") as string;
  const tournamentId = formData.get("tournamentId") as string | null;

  const parsedGames = parsePgn(pgnContent);

  const gamesToInsert = parsedGames.map((g) => ({
    clubId,
    tournamentId,
    whiteName: g.white,
    blackName: g.black,
    result: g.result,
    lichessUrl: g.pgn?.includes("lichess.org") ? g.pgn.match(/\[Site "(https:\/\/lichess\.org\/[^"]+)"\]/)?.[1] || null : null,
    event: g.event,
    date: g.date,
    round: g.round ? parseInt(g.round) : null,
  }));

  if (gamesToInsert.length > 0) {
    await db.insert(games).values(gamesToInsert as any);
  }

  revalidatePath("/dashboard/games");
  return { success: true, count: gamesToInsert.length };
}

export async function getClubGames() {
  const clubId = await requireClubId();

  return db
    .select()
    .from(games)
    .where(eq(games.clubId, clubId))
    .orderBy(desc(games.createdAt));
}

export async function getGameById(id: string) {
  const clubId = await requireClubId();

  const [game] = await db
    .select()
    .from(games)
    .where(and(
      eq(games.id, id),
      eq(games.clubId, clubId)
    ));

  return game || null;
}
