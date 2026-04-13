"use server";

import { db } from "@/lib/db";
import { games, tournaments, clubMemberships, members } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";

export async function getGames(tournamentId?: string) {
  const clubId = await requireClubId();

  if (tournamentId) {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(and(
        eq(tournaments.id, tournamentId),
        eq(tournaments.clubId, clubId)
      ));

    if (!tournament) {
      throw new Error("Turnier nicht gefunden");
    }

    return db
      .select({
        id: games.id,
        round: games.round,
        boardNumber: games.boardNumber,
        whiteId: games.whiteId,
        blackId: games.blackId,
        result: games.result,
        pgn: games.pgn,
        fen: games.fen,
        playedAt: games.playedAt,
      })
      .from(games)
      .where(eq(games.tournamentId, tournamentId))
      .orderBy(games.round, games.boardNumber);
  }

  // Get all games from club's tournaments
  const clubTournaments = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.clubId, clubId));

  const tournamentIds = clubTournaments.map(t => t.id);

  if (tournamentIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: games.id,
      round: games.round,
      boardNumber: games.boardNumber,
      whiteId: games.whiteId,
      blackId: games.blackId,
      result: games.result,
      pgn: games.pgn,
      fen: games.fen,
      playedAt: games.playedAt,
    })
    .from(games)
    .where(inArray(games.tournamentId, tournamentIds))
    .orderBy(desc(games.playedAt), games.round, games.boardNumber);
}

export async function getGameById(id: string) {
  const clubId = await requireClubId();

  const [game] = await db
    .select({
      id: games.id,
      tournamentId: games.tournamentId,
      round: games.round,
      boardNumber: games.boardNumber,
      whiteId: games.whiteId,
      blackId: games.blackId,
      result: games.result,
      pgn: games.pgn,
      fen: games.fen,
      playedAt: games.playedAt,
    })
    .from(games)
    .where(eq(games.id, id));

  if (!game) return null;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, game.tournamentId),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) return null;

  return game;
}

export async function createGame(formData: FormData) {
  const clubId = await requireClubId();

  const tournamentId = formData.get("tournamentId") as string;
  const round = Number(formData.get("round"));
  const boardNumber = formData.get("boardNumber") ? Number(formData.get("boardNumber")) : null;
  const whiteId = formData.get("whiteId") as string;
  const blackId = formData.get("blackId") as string;
  const result = formData.get("result") as string;
  const pgn = (formData.get("pgn") as string) || null;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, tournamentId),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const memberships = await db
    .select()
    .from(clubMemberships)
    .where(and(
      inArray(clubMemberships.memberId, [whiteId, blackId]),
      eq(clubMemberships.clubId, clubId)
    ));

  if (memberships.length !== 2) {
    throw new Error("Beide Spieler müssen Vereinsmitglieder sein");
  }

  await db.insert(games).values({
    tournamentId,
    round,
    boardNumber,
    whiteId,
    blackId,
    result: result as any,
    pgn,
  });

  revalidatePath("/dashboard/tournaments");
}

export async function updateGameResult(gameId: string, result: string, pgn?: string) {
  const clubId = await requireClubId();

  const [game] = await db
    .select({
      id: games.id,
      tournamentId: games.tournamentId,
    })
    .from(games)
    .where(eq(games.id, gameId));

  if (!game) {
    throw new Error("Partie nicht gefunden");
  }

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, game.tournamentId),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  await db
    .update(games)
    .set({
      result: result as any,
      pgn: pgn ?? null,
    })
    .where(eq(games.id, gameId));

  revalidatePath("/dashboard/tournaments");
}

export async function exportTournamentPGN(tournamentId: string) {
  const clubId = await requireClubId();

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, tournamentId),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const gamesList = await db
    .select({
      id: games.id,
      round: games.round,
      boardNumber: games.boardNumber,
      whiteId: games.whiteId,
      blackId: games.blackId,
      result: games.result,
      pgn: games.pgn,
      playedAt: games.playedAt,
    })
    .from(games)
    .where(eq(games.tournamentId, tournamentId))
    .orderBy(games.round, games.boardNumber);

  const memberIds = [...new Set([...gamesList.map(g => g.whiteId), ...gamesList.map(g => g.blackId)])];
  const membersList = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
    })
    .from(members)
    .where(inArray(members.id, memberIds));

  const memberMap = new Map(membersList.map(m => [m.id, `${m.firstName} ${m.lastName}`]));

  let pgn = `[Event "${tournament.name}"]\n`;
  pgn += `[Site "${tournament.location || ""}"]\n`;
  pgn += `[Date "${tournament.startDate || new Date().toISOString().split('T')[0]}"]\n\n`;

  for (const game of gamesList) {
    if (game.pgn) {
      pgn += game.pgn + "\n\n";
    } else {
      pgn += `[White "${memberMap.get(game.whiteId) || "Unknown"}"]\n`;
      pgn += `[Black "${memberMap.get(game.blackId) || "Unknown"}"]\n`;
      pgn += `[Result "${game.result || "*"}"}]\n`;
      pgn += `[Round "${game.round}"]\n\n`;
      pgn += "1. *\n\n";
    }
  }

  return pgn;
}
