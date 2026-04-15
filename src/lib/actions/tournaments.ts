"use server";

import { db } from "@/lib/db";
import { tournaments, seasons, clubMemberships, tournamentParticipants, members, games } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";
import { generateRoundRobinPairings } from "@/lib/pairings/round-robin";
import { generateSwissPairings } from "@/lib/pairings/swiss";
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

  return db
    .select({
      id: tournamentParticipants.id,
      memberId: tournamentParticipants.memberId,
      score: tournamentParticipants.score,
      rank: tournamentParticipants.rank,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        dwz: members.dwz,
      },
    })
    .from(tournamentParticipants)
    .innerJoin(members, eq(tournamentParticipants.memberId, members.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId))
    .orderBy(tournamentParticipants.rank);
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

  // Basic TRF format - this is a placeholder implementation
  const participants = await db
    .select({
      id: tournamentParticipants.id,
      memberId: tournamentParticipants.memberId,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        dwz: members.dwz,
      },
    })
    .from(tournamentParticipants)
    .innerJoin(members, eq(tournamentParticipants.memberId, members.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  let trf = "012 XXXXXXXXXXXXXXXX\n";
  trf += `022 ${tournament.name}\n`;
  trf += `032 ${tournament.location || ""}\n`;
  trf += `042 ${tournament.startDate || new Date().toISOString().split('T')[0]}\n`;

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const name = `${p.member.lastName}, ${p.member.firstName}`;
    trf += `001 ${String(i + 1).padStart(4, '0')} ${name.padEnd(33, ' ')} ${String(p.member.dwz || 0).padStart(4, '0')}   0.0\n`;
  }

  return trf;
}
