"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";

import { parsePgn, extractEcoFromPgn, splitPgnGames } from "@/lib/pgn";

export async function getGames(options: { 
  tournamentId?: string;
  memberId?: string;
  ecoCode?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const { tournamentId, memberId, ecoCode, page = 1, pageSize = 50 } = options;
  const offset = (page - 1) * pageSize;

  let tQuery = client.from('tournaments').select('id').eq('club_id', clubId);
  if (tournamentId) {
    tQuery = tQuery.eq('id', tournamentId);
  }

  const { data: clubTournaments, error: tError } = await tQuery;
  if (tError) throw tError;

  const tournamentIds = (clubTournaments || []).map(t => t.id);

  if (tournamentIds.length === 0) {
    return [];
  }

  let query = client
    .from('games')
    .select('*, white:members!white_id(*), black:members!black_id(*), tournament:tournaments!tournament_id(*)')
    .in('tournament_id', tournamentIds);
  
  if (memberId) {
    query = query.or(`white_id.eq.${memberId},black_id.eq.${memberId}`);
  }

  if (ecoCode) {
    query = query.eq('eco_code', ecoCode);
  }

  const { data, error } = await query
    .order('played_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;
  return data || [];
}

// Helper to handle potentially null IDs in inArray
function filterNotNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

export async function importBulkPgn(tournamentId: string, pgnContent: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const pgnGames = splitPgnGames(pgnContent);
  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  // Fetch all club members for mapping
  const { data: clubMembers, error: cmError } = await client
    .from('members')
    .select('id, first_name, last_name, club_memberships!inner(*)')
    .eq('club_memberships.club_id', clubId);

  if (cmError) throw cmError;

  const findMemberId = (name: string) => {
    if (!name || name === "?" || name === "Unknown") return null;
    const lowerName = name.toLowerCase();
    
    // Try to find by Lastname, Firstname or Firstname Lastname
    return (clubMembers || []).find(m => {
      const full1 = `${m.first_name} ${m.last_name}`.toLowerCase();
      const full2 = `${m.last_name}, ${m.first_name}`.toLowerCase();
      const lastOnly = m.last_name.toLowerCase();
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

      const { error: iError } = await client.from('games').insert([{
        club_id: clubId,
        tournament_id: tournamentId,
        round,
        white_id: whiteId,
        black_id: blackId,
        result: parsed.result,
        lichess_url: lichessUrl,
        eco_code: ecoCode,
        played_at: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
      }]);
      if (iError) throw iError;

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
  const client = createServiceClient();

  const { data: game, error } = await client
    .from('games')
    .select('id, tournament_id, round, board_number, white_id, black_id, result, lichess_url, fen, played_at')
    .eq('id', id)
    .single();

  if (error || !game || !game.tournament_id) return null;

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', game.tournament_id)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) return null;

  return {
    ...game,
    whiteId: game.white_id,
    blackId: game.black_id,
    boardNumber: game.board_number,
    playedAt: game.played_at,
    lichessUrl: game.lichess_url,
  };
}

export async function createGame(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const tournamentId = formData.get("tournamentId") as string;
  const round = Number(formData.get("round"));
  const boardNumber = formData.get("boardNumber") ? Number(formData.get("boardNumber")) : null;
  const whiteId = formData.get("whiteId") as string;
  const blackId = formData.get("blackId") as string;
  const result = formData.get("result") as string;
  const lichessUrl = (formData.get("lichessUrl") as string) || null;

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { data: memberships, error: mError } = await client
    .from('club_memberships')
    .select('*')
    .in('member_id', [whiteId, blackId])
    .eq('club_id', clubId);

  if (mError) throw mError;

  if ((memberships || []).length !== 2) {
    throw new Error("Beide Spieler müssen Vereinsmitglieder sein");
  }

  const { error: iError } = await client.from('games').insert([{
    club_id: clubId,
    tournament_id: tournamentId,
    round,
    board_number: boardNumber,
    white_id: whiteId,
    black_id: blackId,
    result,
    lichess_url: lichessUrl,
  }]);
  if (iError) throw iError;

  revalidatePath("/dashboard/tournaments");
}

export async function updateBasicGameResult(gameId: string, result: string, lichessUrl?: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: game, error } = await client
    .from('games')
    .select('id, tournament_id')
    .eq('id', gameId)
    .single();

  if (error || !game || !game.tournament_id) {
    throw new Error("Partie nicht gefunden");
  }

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', game.tournament_id)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { error: uError } = await client
    .from('games')
    .update({
      result,
      lichess_url: lichessUrl ?? null,
    })
    .eq('id', gameId);
  if (uError) throw uError;

  revalidatePath("/dashboard/tournaments");
}

export async function exportTournamentPGN(tournamentId: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { data: gamesList, error } = await client
    .from('games')
    .select('id, round, board_number, white_id, black_id, result, lichess_url, played_at')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('board_number', { ascending: true });

  if (error) throw error;

  const memberIds = filterNotNull([...new Set([...(gamesList || []).map(g => g.white_id), ...(gamesList || []).map(g => g.black_id)])]);
  
  if (memberIds.length === 0) {
    return "";
  }

  const { data: membersList, error: mError } = await client
    .from('members')
    .select('id, first_name, last_name')
    .in('id', memberIds);

  if (mError) throw mError;

  const memberMap = new Map((membersList || []).map(m => [m.id, `${m.first_name} ${m.last_name}`]));

  let pgn = `[Event "${tournament.name}"]\n`;
  pgn += `[Site "${tournament.location || ""}"]\n`;
  pgn += `[Date "${tournament.start_date || new Date().toISOString().split('T')[0]}"]\n\n`;

  for (const game of (gamesList || [])) {
    const whiteName = game.white_id ? memberMap.get(game.white_id) : "Unknown";
    const blackName = game.black_id ? memberMap.get(game.black_id) : "Unknown";
    pgn += `[White "${whiteName || "Unknown"}"]\n`;
    pgn += `[Black "${blackName || "Unknown"}"]\n`;
    pgn += `[Result "${game.result || "*"}"}]\n`;
    pgn += `[Round "${game.round}"]\n`;
    if (game.lichess_url) {
      pgn += `[Site "${game.lichess_url}"]\n`;
    }
    pgn += "\n1. *\n\n";
  }

  return pgn;
}
