"use server";

import { db } from "@/lib/db";
import { games, tournaments, clubMemberships, members } from "@/lib/db/schema";
import { eq, and, inArray, desc, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";

import { parsePgn, extractEcoFromPgn, splitPgnGames } from "@/lib/pgn";

export async function getGames(options: { 
  tournamentId?: string;
  memberId?: string;
  ecoCode?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const clubId = await requireClubId();
  const { tournamentId, memberId, ecoCode, page = 1, pageSize = 50 } = options;
  const offset = (page - 1) * pageSize;

  const tournamentConditions = [eq(tournaments.clubId, clubId)];
  if (tournamentId) {
    tournamentConditions.push(eq(tournaments.id, tournamentId));
  }

  const clubTournaments = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(and(...tournamentConditions));

  const tournamentIds = clubTournaments.map(t => t.id);

  if (tournamentIds.length === 0) {
    return [];
  }

  // Filter out null tournamentId if necessary, though inArray handles it
  const conditions = [inArray(games.tournamentId, tournamentIds)];
  
  if (memberId) {
    conditions.push(or(eq(games.whiteId, memberId), eq(games.blackId, memberId))!);
  }

  if (ecoCode) {
    conditions.push(eq(games.ecoCode, ecoCode));
  }

  return db.query.games.findMany({
    where: and(...conditions),
    with: {
      white: true,
      black: true,
      tournament: true,
    },
    orderBy: [desc(games.playedAt), desc(games.createdAt)],
    limit: pageSize,
    offset: offset,
  });
}

// Helper to handle potentially null IDs in inArray
function filterNotNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

export async function importBulkPgn(tournamentId: string, pgnContent: string) {
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

  const pgnGames = splitPgnGames(pgnContent);
  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  // Fetch all club members for mapping
  const clubMembers = await db
    .select({ id: members.id, firstName: members.firstName, lastName: members.lastName })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(eq(clubMemberships.clubId, clubId));

  const findMemberId = (name: string) => {
    if (!name || name === "?" || name === "Unknown") return null;
    const lowerName = name.toLowerCase();
    
    // Try to find by Lastname, Firstname or Firstname Lastname
    return clubMembers.find(m => {
      const full1 = `${m.firstName} ${m.lastName}`.toLowerCase();
      const full2 = `${m.lastName}, ${m.firstName}`.toLowerCase();
      const lastOnly = m.lastName.toLowerCase();
      return lowerName.includes(full1) || lowerName.includes(full2) || lowerName === lastOnly;
    })?.id;
  };

  for (const pgn of pgnGames) {
    try {
      const parsedGames = parsePgn(pgn);
      if (parsedGames.length === 0) {
        results.errors.push(`Ungültiges PGN oder keine Spiele gefunden`);
        results.skipped++;
        continue;
      }
      
      const parsed = parsedGames[0];

      const whiteId = findMemberId(parsed.white);
      const blackId = findMemberId(parsed.black);

      if (!whiteId || !blackId) {
        results.errors.push(`Spieler nicht gefunden: ${parsed.white} vs ${parsed.black}`);
        results.skipped++;
        continue;
      }

      const ecoCode = extractEcoFromPgn(pgn);
      const round = parsed.round ? parseInt(parsed.round) : 1;
      const lichessUrl = null;

      await db.insert(games).values({
        clubId,
        tournamentId,
        round,
        whiteId,
        blackId,
        result: parsed.result as any,
        lichessUrl: lichessUrl,
        ecoCode: ecoCode,
        playedAt: parsed.date ? new Date(parsed.date) : new Date(),
      });

      results.imported++;
    } catch (error) {
      results.errors.push(`Fehler beim Import: ${error instanceof Error ? error.message : String(error)}`);
      results.skipped++;
    }
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return results;
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
      lichessUrl: games.lichessUrl,
      fen: games.fen,
      playedAt: games.playedAt,
    })
    .from(games)
    .where(eq(games.id, id));

  if (!game || !game.tournamentId) return null;

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
  const lichessUrl = (formData.get("lichessUrl") as string) || null;

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
    clubId,
    tournamentId,
    round,
    boardNumber,
    whiteId,
    blackId,
    result: result as any,
    lichessUrl,
  });

  revalidatePath("/dashboard/tournaments");
}

export async function updateBasicGameResult(gameId: string, result: string, lichessUrl?: string) {
  const clubId = await requireClubId();

  const [game] = await db
    .select({
      id: games.id,
      tournamentId: games.tournamentId,
    })
    .from(games)
    .where(eq(games.id, gameId));

  if (!game || !game.tournamentId) {
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
      lichessUrl: lichessUrl ?? null,
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
      lichessUrl: games.lichessUrl,
      playedAt: games.playedAt,
    })
    .from(games)
    .where(eq(games.tournamentId, tournamentId))
    .orderBy(games.round, games.boardNumber);

  const memberIds = filterNotNull([...new Set([...gamesList.map(g => g.whiteId), ...gamesList.map(g => g.blackId)])]);
  
  if (memberIds.length === 0) {
    return "";
  }

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
    const whiteName = game.whiteId ? memberMap.get(game.whiteId) : "Unknown";
    const blackName = game.blackId ? memberMap.get(game.blackId) : "Unknown";
    pgn += `[White "${whiteName || "Unknown"}"]\n`;
    pgn += `[Black "${blackName || "Unknown"}"]\n`;
    pgn += `[Result "${game.result || "*"}"}]\n`;
    pgn += `[Round "${game.round}"]\n`;
    if (game.lichessUrl) {
      pgn += `[Site "${game.lichessUrl}"]\n`;
    }
    pgn += "\n1. *\n\n";
  }

  return pgn;
}
