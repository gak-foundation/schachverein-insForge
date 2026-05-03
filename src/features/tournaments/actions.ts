"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";
import { generateRoundRobinPairings } from "@/lib/pairings/round-robin";
import { generateTRFFromTournament } from "@/lib/trf/generator";

export async function getTournaments() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('tournaments')
    .select('id, name, type, start_date, location, is_completed')
    .eq('club_id', clubId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    startDate: t.start_date,
    location: t.location,
    isCompleted: t.is_completed,
  }));
}

export async function getTournamentById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('club_id', clubId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createTournament(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const seasonId = (formData.get("seasonId") as string) || null;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const timeControl = (formData.get("timeControl") as string) || null;
  const numberOfRounds = formData.get("numberOfRounds") ? Number(formData.get("numberOfRounds")) : null;
  const description = (formData.get("description") as string) || null;

  if (seasonId) {
    const { data: season, error } = await client
      .from('seasons')
      .select('*')
      .eq('id', seasonId)
      .eq('club_id', clubId)
      .single();

    if (error || !season) {
      throw new Error("Saison nicht gefunden");
    }
  }

  const { error } = await client.from('tournaments').insert([{
    club_id: clubId,
    name,
    type: type as "swiss" | "round_robin" | "rapid" | "blitz" | "team_match" | "club_championship",
    season_id: seasonId,
    start_date: startDate,
    end_date: endDate,
    location,
    time_control: timeControl,
    number_of_rounds: numberOfRounds,
    description,
  }]);

  if (error) throw error;

  revalidatePath("/dashboard/tournaments");
}

export async function updateTournament(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const id = formData.get("id") as string;

  const { data: tournament, error } = await client
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('club_id', clubId)
    .single();

  if (error || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const timeControl = (formData.get("timeControl") as string) || null;
  const numberOfRounds = formData.get("numberOfRounds") ? Number(formData.get("numberOfRounds")) : null;
  const description = (formData.get("description") as string) || null;

  const { error: uError } = await client
    .from('tournaments')
    .update({
      name,
      start_date: startDate,
      end_date: endDate,
      location,
      time_control: timeControl,
      number_of_rounds: numberOfRounds,
      description,
    })
    .eq('id', id);

  if (uError) throw uError;

  revalidatePath("/dashboard/tournaments");
}

export async function deleteTournament(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: tournament, error } = await client
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('club_id', clubId)
    .single();

  if (error || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { error: dError } = await client
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (dError) throw dError;

  revalidatePath("/dashboard/tournaments");
}

export async function getTournamentParticipants(tournamentId: string) {
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

  const { data, error } = await client
    .from('tournament_participants')
    .select('*, members!member_id(*)')
    .eq('tournament_id', tournamentId)
    .order('score', { ascending: false })
    .order('rank', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTournamentGames(tournamentId: string, round?: number) {
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

  let query = client
    .from('games')
    .select('*, white:members!white_id(*), black:members!black_id(*)')
    .eq('tournament_id', tournamentId);

  if (round !== undefined) {
    query = query.eq('round', round);
  }

  const { data, error } = await query
    .order('round', { ascending: true })
    .order('board_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateGameResult(gameId: string, result: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: game, error } = await client
    .from('games')
    .select('*, tournament:tournaments!tournament_id(*)')
    .eq('id', gameId)
    .single();

  if (error || !game || !game.tournament || game.tournament.club_id !== clubId) {
    throw new Error("Spiel nicht gefunden");
  }

  // Update the game result
  const { error: uError } = await client
    .from('games')
    .update({
      result,
      played_at: new Date().toISOString(),
    })
    .eq('id', gameId);

  if (uError) throw uError;

  // Recalculate everything for this tournament
  const tournamentId = game.tournament_id;
  if (!tournamentId) return;

  const { data: allGames, error: agError } = await client
    .from('games')
    .select('*')
    .eq('tournament_id', tournamentId);
  if (agError) throw agError;

  const { data: participants, error: pError } = await client
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId);
  if (pError) throw pError;

  // 1. Calculate basic scores
  const scores: Record<string, number> = {};
  (participants || []).forEach(p => scores[p.member_id] = 0);

  (allGames || []).forEach(g => {
    if (!g.result) return;
    if (g.result === "1-0" && g.white_id) {
      if (scores[g.white_id] !== undefined) scores[g.white_id] += 1;
    } else if (g.result === "0-1" && g.black_id) {
      if (scores[g.black_id] !== undefined) scores[g.black_id] += 1;
    } else if (g.result === "1/2-1/2") {
      if (g.white_id && scores[g.white_id] !== undefined) scores[g.white_id] += 0.5;
      if (g.black_id && scores[g.black_id] !== undefined) scores[g.black_id] += 0.5;
    } else if (g.result === "+-" && g.white_id) {
      if (scores[g.white_id] !== undefined) scores[g.white_id] += 1;
    } else if (g.result === "-+" && g.black_id) {
      if (scores[g.black_id] !== undefined) scores[g.black_id] += 1;
    } else if (g.result === "+/+") {
      if (g.white_id && scores[g.white_id] !== undefined) scores[g.white_id] += 1;
      if (g.black_id && scores[g.black_id] !== undefined) scores[g.black_id] += 1;
    }
  });

  // 2. Calculate Tie-Breaks (Buchholz & Sonneborn-Berger)
  const buchholz: Record<string, number> = {};
  const sonnebornBerger: Record<string, number> = {};
  (participants || []).forEach(p => {
    buchholz[p.member_id] = 0;
    sonnebornBerger[p.member_id] = 0;
  });

  (participants || []).forEach(p => {
    const memberId = p.member_id;
    const playerGames = (allGames || []).filter(g => g.white_id === memberId || g.black_id === memberId);
    
    playerGames.forEach(g => {
      if (!g.result) return;
      const opponentId = g.white_id === memberId ? g.black_id : g.white_id;
      if (!opponentId) return;
      const opponentScore = scores[opponentId] || 0;
      
      // Buchholz: Sum of opponents' scores
      buchholz[memberId] += opponentScore;
      
      // Sonneborn-Berger: Opponent's score * result (1.0 for win, 0.5 for draw, 0.0 for loss)
      const isWhite = g.white_id === memberId;
      if (g.result === "1-0") {
        if (isWhite) sonnebornBerger[memberId] += opponentScore;
      } else if (g.result === "0-1") {
        if (!isWhite) sonnebornBerger[memberId] += opponentScore;
      } else if (g.result === "1/2-1/2") {
        sonnebornBerger[memberId] += 0.5 * opponentScore;
      } else if (g.result === "+-") {
        if (isWhite) sonnebornBerger[memberId] += opponentScore;
      } else if (g.result === "-+") {
        if (!isWhite) sonnebornBerger[memberId] += opponentScore;
      } else if (g.result === "+/+") {
        sonnebornBerger[memberId] += opponentScore;
      }
    });
  });

  // 3. Update participants in database
  for (const p of (participants || [])) {
    const { error: upError } = await client
      .from('tournament_participants')
      .update({
        score: scores[p.member_id].toFixed(1),
        buchholz: buchholz[p.member_id].toFixed(2),
        sonneborn_berger: sonnebornBerger[p.member_id].toFixed(2),
      })
      .eq('id', p.id);
    if (upError) throw upError;
  }

  // 4. Update ranks based on Score -> Buchholz -> Sonneborn-Berger
  const { data: updatedParticipants, error: upError } = await client
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId);
  if (upError) throw upError;

  // Sort: Score DESC, Buchholz DESC, Sonneborn-Berger DESC
  (updatedParticipants || []).sort((a, b) => {
    const scoreA = parseFloat(a.score || "0");
    const scoreB = parseFloat(b.score || "0");
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    const bhA = parseFloat(a.buchholz || "0");
    const bhB = parseFloat(b.buchholz || "0");
    if (bhB !== bhA) return bhB - bhA;
    
    const sbA = parseFloat(a.sonneborn_berger || "0");
    const sbB = parseFloat(b.sonneborn_berger || "0");
    return sbB - sbA;
  });

  for (let i = 0; i < (updatedParticipants || []).length; i++) {
    const { error } = await client
      .from('tournament_participants')
      .update({ rank: i + 1 })
      .eq('id', updatedParticipants![i].id);
    if (error) throw error;
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

export async function addTournamentParticipant(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const tournamentId = formData.get("tournamentId") as string;
  const memberId = formData.get("memberId") as string;

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { data: membership, error: mError } = await client
    .from('club_memberships')
    .select('*')
    .eq('member_id', memberId)
    .eq('club_id', clubId)
    .single();

  if (mError || !membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  const { error } = await client.from('tournament_participants').insert([{
    tournament_id: tournamentId,
    member_id: memberId,
  }]);
  if (error) throw error;

  revalidatePath("/dashboard/tournaments");
}

export async function removeTournamentParticipant(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: participant, error } = await client
    .from('tournament_participants')
    .select('tournament_id')
    .eq('id', id)
    .single();

  if (error || !participant) {
    throw new Error("Teilnehmer nicht gefunden");
  }

  const { data: tournament, error: tError } = await client
    .from('tournaments')
    .select('*')
    .eq('id', participant.tournament_id)
    .eq('club_id', clubId)
    .single();

  if (tError || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { error: dError } = await client
    .from('tournament_participants')
    .delete()
    .eq('id', id);
  if (dError) throw dError;

  revalidatePath("/dashboard/tournaments");
}

export async function generateRoundRobinRounds(tournamentId: string) {
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

  if (tournament.type !== "round_robin" && tournament.type !== "club_championship") {
    throw new Error("Nur für Rundenturnier und Vereinsmeisterschaft verfügbar");
  }

  const { data: participants, error: pError } = await client
    .from('tournament_participants')
    .select('member_id, members!member_id(*)')
    .eq('tournament_id', tournamentId);

  if (pError) throw pError;

  if ((participants || []).length < 2) {
    throw new Error("Mindestens 2 Teilnehmer erforderlich");
  }

  // Generate pairings using Berger table
  const pairingParticipants = (participants || []).map((p: any) => ({
    id: p.member_id,
    name: `${p.members.first_name} ${p.members.last_name}`,
    rating: p.members.dwz || p.members.elo || undefined,
  }));

  const rounds = generateRoundRobinPairings(pairingParticipants);

  // Get existing games to avoid duplicates
  const { data: existingGames, error: egError } = await client
    .from('games')
    .select('round')
    .eq('tournament_id', tournamentId);
  if (egError) throw egError;

  const existingRounds = new Set((existingGames || []).map(g => g.round));

  // Create games for each round
  for (const round of rounds) {
    if (existingRounds.has(round.round)) {
      continue; // Skip rounds that already exist
    }

    for (const pairing of round.pairings) {
      const { error: igError } = await client.from('games').insert([{
        club_id: clubId,
        tournament_id: tournamentId,
        round: round.round,
        board_number: pairing.board || 1,
        white_id: pairing.white.id,
        black_id: pairing.black.id,
        result: null,
      }]);
      if (igError) throw igError;
    }
  }

  // Update number of rounds
  const { error: uError } = await client
    .from('tournaments')
    .update({ number_of_rounds: rounds.length })
    .eq('id', tournamentId);
  if (uError) throw uError;

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);

  return { success: true, rounds: rounds.length };
}

export async function updateTournamentResults(
  tournamentId: string,
  participants: { id?: string; memberId: string; score: string }[]
) {
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

  for (const participant of participants) {
    if (participant.id) {
      const { error } = await client
        .from('tournament_participants')
        .update({
          score: participant.score,
        })
        .eq('id', participant.id);
      if (error) throw error;
    }
  }

  const { data: allParticipants, error: apError } = await client
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('score', { ascending: false });
  if (apError) throw apError;

  for (let i = 0; i < (allParticipants || []).length; i++) {
    const { error } = await client
      .from('tournament_participants')
      .update({ rank: i + 1 })
      .eq('id', allParticipants![i].id);
    if (error) throw error;
  }

  revalidatePath("/dashboard/tournaments");
}

export async function importTRF(tournamentId: string, trfData: string) {
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

  const { error: uError } = await client
    .from('tournaments')
    .update({ trf_data: trfData })
    .eq('id', tournamentId);
  if (uError) throw uError;

  revalidatePath("/dashboard/tournaments");

  const lines = trfData.split("\n");
  const playerLines = lines.filter(line => line.startsWith("001"));
  const gameLines = lines.filter(line => line.startsWith("026") || line.startsWith("027") || line.startsWith("028") || line.startsWith("029") || line.startsWith("030"));

  return {
    success: true,
    imported: {
      players: playerLines.length,
      games: gameLines.length,
    },
    errors: [],
    preview: {
      players: playerLines.map(line => line.substring(8).trim()),
      games: gameLines.length,
    },
  };
}

export async function addTournamentParticipantForm(formData: FormData) {
  return addTournamentParticipant(formData);
}

export async function removeTournamentParticipantForm(formData: FormData) {
  const id = formData.get("participantId") as string;
  return removeTournamentParticipant(id);
}

export async function generateTRF(tournamentId: string) {
  return generateTRFFromTournament(tournamentId);
}

import { getPairingQueue } from "@/lib/jobs/pairing-worker";

export async function generateSwissRound(tournamentId: string) {
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

  if (tournament.type !== "swiss") {
    throw new Error("Nur für Schweizer System verfügbar");
  }

  // Calculate current max round
  const { data: existingGames, error: egError } = await client
    .from('games')
    .select('round')
    .eq('tournament_id', tournamentId);
  if (egError) throw egError;

  const maxRound = (existingGames || []).length > 0 
    ? Math.max(...(existingGames || []).map(g => g.round || 0))
    : 0;
  
  const nextRound = maxRound + 1;

  if (tournament.number_of_rounds && nextRound > tournament.number_of_rounds) {
    throw new Error("Maximale Rundenanzahl bereits erreicht");
  }

  // 1. Generate TRF from current tournament state
  const trf = await generateTRFFromTournament(tournamentId);

  // 2. Queue the pairing job
  const queue = getPairingQueue();
  if (!queue) {
    throw new Error("Pairing-Service nicht verfügbar (Redis-Verbindung fehlt)");
  }

  const job = await queue.add(`pairing-${tournamentId}-${nextRound}`, {
    tournamentId,
    trfContent: trf,
    options: {
      system: "dutch",
      round: nextRound,
    },
  });

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);

  return {
    success: true,
    jobId: job.id,
    message: "Die Auslosung wurde gestartet und wird im Hintergrund verarbeitet.",
  };
}

export async function saveAllRoundResults(
  tournamentId: string,
  results: { whiteId: string; blackId: string; result: string; round: number; boardNumber: number }[]
) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const inserts = results.map((r, i) => ({
    tournament_id: tournamentId,
    club_id: clubId,
    white_id: r.whiteId,
    black_id: r.blackId,
    result: r.result,
    round: r.round,
    board_number: r.boardNumber || i + 1,
  }));

  const { error } = await client.from("games").insert(inserts);
  if (error) throw new Error("Fehler beim Speichern der Ergebnisse: " + error.message);

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return { saved: inserts.length };
}
