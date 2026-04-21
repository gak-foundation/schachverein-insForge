"use server";

import { db } from "@/lib/db";
import { tournaments, seasons, clubMemberships, tournamentParticipants, members, games } from "@/lib/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";
import { generateRoundRobinPairings } from "@/lib/pairings/round-robin";
import { generateTRFFromTournament } from "@/lib/trf/generator";

export async function getTournaments() {
  const clubId = await requireClubId();

  return db
    .select({
      id: tournaments.id,
      name: tournaments.name,
      type: tournaments.type,
      startDate: tournaments.startDate,
      location: tournaments.location,
      isCompleted: tournaments.isCompleted,
    })
    .from(tournaments)
    .where(eq(tournaments.clubId, clubId))
    .orderBy(desc(tournaments.startDate));
}

export async function getTournamentById(id: string) {
  const clubId = await requireClubId();

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, id),
      eq(tournaments.clubId, clubId)
    ));

  return tournament ?? null;
}

export async function createTournament(formData: FormData) {
  const clubId = await requireClubId();

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
    const [season] = await db
      .select()
      .from(seasons)
      .where(and(
        eq(seasons.id, seasonId),
        eq(seasons.clubId, clubId)
      ));

    if (!season) {
      throw new Error("Saison nicht gefunden");
    }
  }

  await db.insert(tournaments).values({
    clubId,
    name,
    type: type as "swiss" | "round_robin" | "rapid" | "blitz" | "team_match" | "club_championship",
    seasonId,
    startDate,
    endDate,
    location,
    timeControl,
    numberOfRounds,
    description,
  });

  revalidatePath("/dashboard/tournaments");
}

export async function updateTournament(formData: FormData) {
  const clubId = await requireClubId();
  const id = formData.get("id") as string;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, id),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const timeControl = (formData.get("timeControl") as string) || null;
  const numberOfRounds = formData.get("numberOfRounds") ? Number(formData.get("numberOfRounds")) : null;
  const description = (formData.get("description") as string) || null;

  await db
    .update(tournaments)
    .set({
      name,
      startDate,
      endDate,
      location,
      timeControl,
      numberOfRounds,
      description,
    })
    .where(eq(tournaments.id, id));

  revalidatePath("/dashboard/tournaments");
}

export async function deleteTournament(id: string) {
  const clubId = await requireClubId();

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, id),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  await db.delete(tournaments).where(eq(tournaments.id, id));

  revalidatePath("/dashboard/tournaments");
}

export async function getTournamentParticipants(tournamentId: string) {
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

  return db.query.tournamentParticipants.findMany({
    where: eq(tournamentParticipants.tournamentId, tournamentId),
    with: {
      member: true,
    },
    orderBy: [desc(tournamentParticipants.score), asc(tournamentParticipants.rank)],
  });
}

export async function getTournamentGames(tournamentId: string, round?: number) {
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

  const conditions = [eq(games.tournamentId, tournamentId)];
  if (round !== undefined) {
    conditions.push(eq(games.round, round));
  }

  return db.query.games.findMany({
    where: and(...conditions),
    with: {
      white: true,
      black: true,
    },
    orderBy: [asc(games.round), asc(games.boardNumber)],
  });
}

export async function updateGameResult(gameId: string, result: typeof games.$inferInsert.result) {
  const clubId = await requireClubId();

  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    with: {
      tournament: true,
    },
  });

  if (!game || !game.tournament || game.tournament.clubId !== clubId) {
    throw new Error("Spiel nicht gefunden");
  }

  // Update the game result
  await db
    .update(games)
    .set({
      result,
      playedAt: new Date(),
    })
    .where(eq(games.id, gameId));

  // Recalculate everything for this tournament
  const tournamentId = game.tournamentId;
  if (!tournamentId) return;

  const allGames = await db.select().from(games).where(eq(games.tournamentId, tournamentId));
  const participants = await db.select().from(tournamentParticipants).where(eq(tournamentParticipants.tournamentId, tournamentId));

  // 1. Calculate basic scores
  const scores: Record<string, number> = {};
  participants.forEach(p => scores[p.memberId] = 0);

  allGames.forEach(g => {
    if (!g.result) return;
    if (g.result === "1-0" && g.whiteId) {
      if (scores[g.whiteId] !== undefined) scores[g.whiteId] += 1;
    } else if (g.result === "0-1" && g.blackId) {
      if (scores[g.blackId] !== undefined) scores[g.blackId] += 1;
    } else if (g.result === "1/2-1/2") {
      if (g.whiteId && scores[g.whiteId] !== undefined) scores[g.whiteId] += 0.5;
      if (g.blackId && scores[g.blackId] !== undefined) scores[g.blackId] += 0.5;
    } else if (g.result === "+-" && g.whiteId) {
      if (scores[g.whiteId] !== undefined) scores[g.whiteId] += 1;
    } else if (g.result === "-+" && g.blackId) {
      if (scores[g.blackId] !== undefined) scores[g.blackId] += 1;
    } else if (g.result === "+/+") {
      if (g.whiteId && scores[g.whiteId] !== undefined) scores[g.whiteId] += 1;
      if (g.blackId && scores[g.blackId] !== undefined) scores[g.blackId] += 1;
    }
  });

  // 2. Calculate Tie-Breaks (Buchholz & Sonneborn-Berger)
  const buchholz: Record<string, number> = {};
  const sonnebornBerger: Record<string, number> = {};
  participants.forEach(p => {
    buchholz[p.memberId] = 0;
    sonnebornBerger[p.memberId] = 0;
  });

  participants.forEach(p => {
    const memberId = p.memberId;
    const playerGames = allGames.filter(g => g.whiteId === memberId || g.blackId === memberId);
    
    playerGames.forEach(g => {
      if (!g.result) return;
      const opponentId = g.whiteId === memberId ? g.blackId : g.whiteId;
      if (!opponentId) return;
      const opponentScore = scores[opponentId] || 0;
      
      // Buchholz: Sum of opponents' scores
      buchholz[memberId] += opponentScore;
      
      // Sonneborn-Berger: Opponent's score * result (1.0 for win, 0.5 for draw, 0.0 for loss)
      const isWhite = g.whiteId === memberId;
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
  for (const p of participants) {
    await db
      .update(tournamentParticipants)
      .set({
        score: scores[p.memberId].toFixed(1),
        buchholz: buchholz[p.memberId].toFixed(2),
        sonnebornBerger: sonnebornBerger[p.memberId].toFixed(2),
      })
      .where(eq(tournamentParticipants.id, p.id));
  }

  // 4. Update ranks based on Score -> Buchholz -> Sonneborn-Berger
  const updatedParticipants = await db
    .select()
    .from(tournamentParticipants)
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  // Sort: Score DESC, Buchholz DESC, Sonneborn-Berger DESC
  updatedParticipants.sort((a, b) => {
    const scoreA = parseFloat(a.score || "0");
    const scoreB = parseFloat(b.score || "0");
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    const bhA = parseFloat(a.buchholz || "0");
    const bhB = parseFloat(b.buchholz || "0");
    if (bhB !== bhA) return bhB - bhA;
    
    const sbA = parseFloat(a.sonnebornBerger || "0");
    const sbB = parseFloat(b.sonnebornBerger || "0");
    return sbB - sbA;
  });

  for (let i = 0; i < updatedParticipants.length; i++) {
    await db
      .update(tournamentParticipants)
      .set({ rank: i + 1 })
      .where(eq(tournamentParticipants.id, updatedParticipants[i].id));
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

export async function addTournamentParticipant(formData: FormData) {
  const clubId = await requireClubId();

  const tournamentId = formData.get("tournamentId") as string;
  const memberId = formData.get("memberId") as string;

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

  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(and(
      eq(clubMemberships.memberId, memberId),
      eq(clubMemberships.clubId, clubId)
    ));

  if (!membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  await db.insert(tournamentParticipants).values({
    tournamentId,
    memberId,
  });

  revalidatePath("/dashboard/tournaments");
}

export async function removeTournamentParticipant(id: string) {
  const clubId = await requireClubId();

  const [participant] = await db
    .select({
      tournamentId: tournamentParticipants.tournamentId,
    })
    .from(tournamentParticipants)
    .where(eq(tournamentParticipants.id, id));

  if (!participant) {
    throw new Error("Teilnehmer nicht gefunden");
  }

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(and(
      eq(tournaments.id, participant.tournamentId),
      eq(tournaments.clubId, clubId)
    ));

  if (!tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  await db.delete(tournamentParticipants).where(eq(tournamentParticipants.id, id));

  revalidatePath("/dashboard/tournaments");
}

export async function generateRoundRobinRounds(tournamentId: string) {
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

  if (tournament.type !== "round_robin" && tournament.type !== "club_championship") {
    throw new Error("Nur für Rundenturnier und Vereinsmeisterschaft verfügbar");
  }

  const participants = await db
    .select({
      id: tournamentParticipants.memberId,
      member: members,
    })
    .from(tournamentParticipants)
    .innerJoin(members, eq(tournamentParticipants.memberId, members.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  if (participants.length < 2) {
    throw new Error("Mindestens 2 Teilnehmer erforderlich");
  }

  // Generate pairings using Berger table
  const pairingParticipants = participants.map(p => ({
    id: p.id,
    name: `${p.member.firstName} ${p.member.lastName}`,
    rating: p.member.dwz || p.member.elo || undefined,
  }));

  const rounds = generateRoundRobinPairings(pairingParticipants);

  // Get existing games to avoid duplicates
  const existingGames = await db
    .select({ round: games.round })
    .from(games)
    .where(eq(games.tournamentId, tournamentId));

  const existingRounds = new Set(existingGames.map(g => g.round));

  // Create games for each round
  for (const round of rounds) {
    if (existingRounds.has(round.round)) {
      continue; // Skip rounds that already exist
    }

    for (const pairing of round.pairings) {
      await db.insert(games).values({
        clubId,
        tournamentId,
        round: round.round,
        boardNumber: pairing.board || 1,
        whiteId: pairing.white.id,
        blackId: pairing.black.id,
        result: null,
      });
    }
  }

  // Update number of rounds
  await db
    .update(tournaments)
    .set({ numberOfRounds: rounds.length })
    .where(eq(tournaments.id, tournamentId));

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);

  return { success: true, rounds: rounds.length };
}

export async function updateTournamentResults(
  tournamentId: string,
  participants: { id?: string; memberId: string; score: string }[]
) {
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

  for (const participant of participants) {
    if (participant.id) {
      await db
        .update(tournamentParticipants)
        .set({
          score: participant.score,
        })
        .where(eq(tournamentParticipants.id, participant.id));
    }
  }

  const allParticipants = await db
    .select()
    .from(tournamentParticipants)
    .where(eq(tournamentParticipants.tournamentId, tournamentId))
    .orderBy(desc(tournamentParticipants.score));

  for (let i = 0; i < allParticipants.length; i++) {
    await db
      .update(tournamentParticipants)
      .set({ rank: i + 1 })
      .where(eq(tournamentParticipants.id, allParticipants[i].id));
  }

  revalidatePath("/dashboard/tournaments");
}

export async function importTRF(tournamentId: string, trfData: string) {
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

  await db
    .update(tournaments)
    .set({ trfData })
    .where(eq(tournaments.id, tournamentId));

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

  if (tournament.type !== "swiss") {
    throw new Error("Nur für Schweizer System verfügbar");
  }

  // Calculate current max round
  const existingGames = await db
    .select({ round: games.round })
    .from(games)
    .where(eq(games.tournamentId, tournamentId));

  const maxRound = existingGames.length > 0 
    ? Math.max(...existingGames.map(g => g.round || 0))
    : 0;
  
  const nextRound = maxRound + 1;

  if (tournament.numberOfRounds && nextRound > tournament.numberOfRounds) {
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
