"use server";

import { db } from "@/lib/db";
import { members, teams, seasons, tournaments, games, events, payments, matches, dwzHistory, auditLog, tournamentParticipants, teamMemberships, boardOrders, authUsers } from "@/lib/db/schema";
import { eq, desc, sql, and, or } from "drizzle-orm";
import { createMemberSchema } from "@/lib/validations";
import { generateRoundRobinPairings, Round } from "@/lib/pairings/round-robin";
import { revalidatePath } from "next/cache";
import { parseMemberCSV, exportMembersToCSV } from "@/lib/csv/members";
import { parseTRF, validateTRF } from "@/lib/trf/parser";
import { auth } from "@/lib/auth/better-auth";
import { logAudit, logAuthAction, logMemberAction, logFinanceAction } from "@/lib/audit";
import { createInvitation, validateInvitation, consumeInvitation } from "@/lib/auth/invitations";

// ─── Members ──────────────────────────────────────────────────

export async function getMembers(search?: string, role?: string, status?: string) {
  let query = db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phone,
      dateOfBirth: members.dateOfBirth,
      gender: members.gender,
      dwz: members.dwz,
      elo: members.elo,
      dwzId: members.dwzId,
      lichessUsername: members.lichessUsername,
      chesscomUsername: members.chesscomUsername,
      role: members.role,
      status: members.status,
      photoConsent: members.photoConsent,
      newsletterConsent: members.newsletterConsent,
      notes: members.notes,
      createdAt: members.createdAt,
    })
    .from(members);

  if (search) {
    query = query.where(
      or(
        sql`${members.firstName} ILIKE ${`%${search}%`}`,
        sql`${members.lastName} ILIKE ${`%${search}%`}`,
        sql`${members.email} ILIKE ${`%${search}%`}`
      )
    ) as typeof query;
  }

  if (role) {
    query = query.where(sql`${members.role} = ${role}`) as typeof query;
  }

  if (status) {
    query = query.where(sql`${members.status} = ${status}`) as typeof query;
  }

  return query.orderBy(desc(members.createdAt));
}

export async function getMemberById(id: string) {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}

export async function createMember(formData: FormData) {
  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    gender: (formData.get("gender") as string) || undefined,
    dwz: formData.get("dwz") ? Number(formData.get("dwz")) : undefined,
    elo: formData.get("elo") ? Number(formData.get("elo")) : undefined,
    dwzId: (formData.get("dwzId") as string) || undefined,
    lichessUsername: (formData.get("lichessUsername") as string) || undefined,
    chesscomUsername: (formData.get("chesscomUsername") as string) || undefined,
    role: (formData.get("role") as string) || "mitglied",
    status: (formData.get("status") as string) || "active",
    parentId: (formData.get("parentId") as string) || undefined,
    photoConsent: formData.get("photoConsent") === "on",
    newsletterConsent: formData.get("newsletterConsent") === "on",
    resultPublicationConsent: formData.get("resultPublicationConsent") !== null
      ? formData.get("resultPublicationConsent") === "on"
      : true,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validated = createMemberSchema.parse(rawData);

  const [member] = await db
    .insert(members)
    .values({
      ...validated,
      dateOfBirth: validated.dateOfBirth || null,
      parentId: validated.parentId || null,
    })
    .returning();

  await logMemberAction("CREATED", member.id, {
    firstName: { old: null, new: member.firstName },
    lastName: { old: null, new: member.lastName },
    email: { old: null, new: member.email },
    role: { old: null, new: member.role },
  });

  const createAccount = formData.get("createAccount") === "on";
  if (createAccount) {
    const result = await createInvitation(member.id);
    if (result.success) {
      console.log(`Einladung erstellt fuer ${validated.email}: ${result.inviteUrl}`);
    }
  }

  revalidatePath("/dashboard/members");
}

export async function deleteMember(id: string) {
  const member = await getMemberById(id);
  await db.delete(members).where(eq(members.id, id));
  
  await logMemberAction("DELETED", id, {
    firstName: { old: member?.firstName, new: null },
    lastName: { old: member?.lastName, new: null },
    email: { old: member?.email, new: null },
  });
  
  revalidatePath("/dashboard/members");
}

// ─── Teams ────────────────────────────────────────────────────

export async function getTeams() {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      seasonId: teams.seasonId,
      league: teams.league,
      captainId: teams.captainId,
    })
    .from(teams)
    .orderBy(desc(teams.createdAt));
}

export async function getSeasons() {
  return db.select().from(seasons).orderBy(desc(seasons.year));
}

// ─── Tournaments ──────────────────────────────────────────────

export async function getTournaments() {
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
    .orderBy(desc(tournaments.startDate));
}

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const seasonId = (formData.get("seasonId") as string) || null;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const timeControl = (formData.get("timeControl") as string) || null;
  const numberOfRounds = formData.get("numberOfRounds") ? Number(formData.get("numberOfRounds")) : null;
  const description = (formData.get("description") as string) || null;

  await db.insert(tournaments).values({
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

export async function createTeam(formData: FormData) {
  const name = formData.get("name") as string;
  const seasonId = formData.get("seasonId") as string;
  const league = (formData.get("league") as string) || null;
  const captainId = (formData.get("captainId") as string) || null;

  await db.insert(teams).values({
    name,
    seasonId,
    league,
    captainId,
  });

  revalidatePath("/dashboard/teams");
}

export async function createSeason(formData: FormData) {
  const name = formData.get("name") as string;
  const year = Number(formData.get("year"));
  const type = (formData.get("type") as string) || "club_internal";
  const startDate = (formData.get("startDate") as string) || null;
  const endDate = (formData.get("endDate") as string) || null;

  await db.insert(seasons).values({
    name,
    year,
    type: type as "bundesliga" | "bezirksliga" | "kreisklasse" | "club_internal",
    startDate,
    endDate,
  });

  revalidatePath("/dashboard/seasons");
}

export async function getDwzHistory(memberId: string) {
  return db
    .select()
    .from(dwzHistory)
    .where(eq(dwzHistory.memberId, memberId))
    .orderBy(desc(dwzHistory.recordedAt));
}

export async function getAuditLogs(limit = 100) {
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

// ─── Stats ────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members)
    .where(eq(members.status, "active"));

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams);

  const [paymentPending] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payments)
    .where(eq(payments.status, "pending"));

  const [tournamentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tournaments)
    .where(eq(tournaments.isCompleted, false));

  const upcomingEvents = await db
    .select()
    .from(events)
    .where(sql`${events.startDate} >= NOW()`)
    .orderBy(events.startDate)
    .limit(5);

  const [avgDwzResult] = await db
    .select({ avg: sql<number>`round(avg(dwz), 0)::int` })
    .from(members)
    .where(and(eq(members.status, "active"), sql`${members.dwz} IS NOT NULL`));

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [gamesThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(games)
    .where(sql`to_char(${games.createdAt}, 'YYYY-MM') = ${currentMonth}`);

  const upcomingMatches = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      homeTeamName: teams.name,
      location: matches.location,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.homeTeamId, teams.id))
    .where(and(
      or(eq(matches.status, "scheduled"), eq(matches.status, "in_progress")),
      sql`${matches.matchDate} >= CURRENT_DATE`
    ))
    .orderBy(matches.matchDate)
    .limit(3);

  return {
    memberCount: memberCount?.count ?? 0,
    teamCount: teamCount?.count ?? 0,
    pendingPayments: paymentPending?.count ?? 0,
    activeTournaments: tournamentCount?.count ?? 0,
    upcomingEvents,
    avgDwz: avgDwzResult?.avg ?? 0,
    gamesThisMonth: gamesThisMonth?.count ?? 0,
    upcomingMatches,
  };
}


// ─── Events ───────────────────────────────────────────────────

export async function getEvents() {
  return db
    .select()
    .from(events)
    .orderBy(events.startDate);
}

export async function createEvent(formData: FormData) {
  const title = formData.get("title") as string;
  const eventType = formData.get("eventType") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const description = (formData.get("description") as string) || null;
  const isAllDay = formData.get("isAllDay") === "on";

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : null;

  await db.insert(events).values({
    title,
    eventType,
    startDate,
    endDate,
    location,
    description,
    isAllDay,
  });

  revalidatePath("/dashboard/calendar");
}

// ─── Payments ──────────────────────────────────────────────────

export async function getPayments() {
  return db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentStats() {
  const [pending] = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(payments)
    .where(eq(payments.status, "pending"));

  const [paid] = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(payments)
    .where(eq(payments.status, "paid"));

  const [overdue] = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(amount), 0)`,
    })
    .from(payments)
    .where(eq(payments.status, "overdue"));

  return {
    pending: { count: pending?.count ?? 0, total: pending?.total ?? "0" },
    paid: { count: paid?.count ?? 0, total: paid?.total ?? "0" },
    overdue: { count: overdue?.count ?? 0, total: overdue?.total ?? "0" },
  };
}

export async function createPayment(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const year = Number(formData.get("year"));
  const dueDate = (formData.get("dueDate") as string) || null;

  const [payment] = await db.insert(payments).values({
    memberId,
    amount,
    description,
    year,
    dueDate,
  }).returning();

  await logFinanceAction("PAYMENT_CREATED", payment.id, {
    memberId: { old: null, new: memberId },
    amount: { old: null, new: amount },
    description: { old: null, new: description },
    year: { old: null, new: year },
    status: { old: null, new: "pending" },
  });

  revalidatePath("/dashboard/finance");
}

export async function updatePaymentStatus(paymentId: string, newStatus: string, formData: FormData) {
  const [oldPayment] = await db.select().from(payments).where(eq(payments.id, paymentId));

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date(),
  };
  if (newStatus === "paid") {
    updateData.paidAt = new Date();
  }

  await db
    .update(payments)
    .set(updateData)
    .where(eq(payments.id, paymentId));

  await logFinanceAction("PAYMENT_UPDATED", paymentId, {
    status: { old: oldPayment?.status, new: newStatus },
    paidAt: { old: oldPayment?.paidAt, new: newStatus === "paid" ? new Date() : oldPayment?.paidAt },
  });

  revalidatePath("/dashboard/finance");
}

// ─── Games ──────────────────────────────────────────────────────

export async function getGames(tournamentId?: string) {
  if (tournamentId) {
    return db
      .select()
      .from(games)
      .where(eq(games.tournamentId, tournamentId))
      .orderBy(games.round, games.boardNumber);
  }
  return db
    .select()
    .from(games)
    .orderBy(desc(games.createdAt));
}

export async function getGameById(id: string) {
  const [game] = await db.select().from(games).where(eq(games.id, id));
  return game ?? null;
}

export async function createGame(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const round = Number(formData.get("round") || 1);
  const boardNumber = formData.get("boardNumber") ? Number(formData.get("boardNumber")) : null;
  const whiteId = formData.get("whiteId") as string;
  const blackId = formData.get("blackId") as string;
  const resultValue = formData.get("result") as string;
  const timeControl = (formData.get("timeControl") as string) || null;
  const ecoCode = (formData.get("ecoCode") as string) || null;
  const pgn = (formData.get("pgn") as string) || null;

  const result = resultValue ? resultValue as "1-0" | "0-1" | "1/2-1/2" | "+-" | "-+" | "+/+" : null;

  await db.insert(games).values({
    tournamentId,
    round,
    boardNumber,
    whiteId,
    blackId,
    result,
    timeControl,
    ecoCode,
    pgn,
  });

  revalidatePath("/dashboard/games");
}

// ─── CSV Import/Export ──────────────────────────────────────────

export async function importMembersCSV(formData: FormData): Promise<{
  success: boolean;
  imported: number;
  errors: { row: number; message: string }[];
}> {
  const file = formData.get("csvFile") as File;
  if (!file) {
    return { success: false, imported: 0, errors: [{ row: 0, message: "Keine Datei hochgeladen" }] };
  }

  const csvContent = await file.text();
  const { data, errors } = parseMemberCSV(csvContent);

  if (errors.length > 0 && data.length === 0) {
    return { success: false, imported: 0, errors };
  }

  let imported = 0;
  const importErrors: { row: number; message: string }[] = [...errors];

  for (let i = 0; i < data.length; i++) {
    const member = data[i];
    try {
      const validated = createMemberSchema.parse(member);

      const existing = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.email, validated.email))
        .limit(1);

      if (existing.length > 0) {
        importErrors.push({
          row: i + 2,
          message: `E-Mail ${validated.email} existiert bereits`,
        });
        continue;
      }

      await db.insert(members).values({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone ?? null,
        dateOfBirth: validated.dateOfBirth ?? null,
        gender: validated.gender ?? null,
        dwz: validated.dwz ?? null,
        elo: validated.elo ?? null,
        dwzId: validated.dwzId ?? null,
        lichessUsername: validated.lichessUsername ?? null,
        chesscomUsername: validated.chesscomUsername ?? null,
        role: validated.role,
        status: validated.status,
        photoConsent: validated.photoConsent,
        newsletterConsent: validated.newsletterConsent,
        resultPublicationConsent: validated.resultPublicationConsent,
        notes: validated.notes ?? null,
      });

      imported++;
    } catch (error) {
      importErrors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    }
  }

  revalidatePath("/dashboard/members");
  return {
    success: importErrors.length === 0,
    imported,
    errors: importErrors,
  };
}

// ─── TRF Import/Export ────────────────────────────────────────

export async function importTRF(tournamentId: string, trfContent: string): Promise<{
  success: boolean;
  imported: { players: number; games: number };
  errors: string[];
  preview?: { players: string[]; games: number };
}> {
  // Parse TRF
  const parsed = parseTRF(trfContent);

  // Validate
  const validationErrors = validateTRF(parsed);
  if (validationErrors.length > 0) {
    return {
      success: false,
      imported: { players: 0, games: 0 },
      errors: validationErrors,
    };
  }

  // Create player lookup (by DWZ ID or name matching)
  const allMembers = await db.select({
    id: members.id,
    firstName: members.firstName,
    lastName: members.lastName,
    dwzId: members.dwzId,
  }).from(members);

  const playerIdMap = new Map<string, string>(); // TRF ID -> Member ID
  const unmatchedPlayers: string[] = [];

  for (const trfPlayer of parsed.players) {
    // Try to match by DWZ ID first
    let member = allMembers.find(m => m.dwzId === trfPlayer.id);

    if (!member) {
      // Try name matching (last name, first name)
      const nameParts = trfPlayer.name.split(",").map(s => s.trim());
      const lastName = nameParts[0];
      const firstName = nameParts[1] || "";
      member = allMembers.find(m =>
        m.lastName.toLowerCase() === lastName.toLowerCase() &&
        m.firstName.toLowerCase() === firstName.toLowerCase()
      );
    }

    if (member) {
      playerIdMap.set(trfPlayer.id, member.id);
    } else {
      unmatchedPlayers.push(trfPlayer.name);
    }
  }

  if (unmatchedPlayers.length > 0) {
    return {
      success: false,
      imported: { players: 0, games: 0 },
      errors: unmatchedPlayers.map(name => `Spieler nicht gefunden: ${name}`),
      preview: {
        players: parsed.players.map(p => p.name),
        games: parsed.games.length,
      },
    };
  }

  // Add players to tournament
  let playersImported = 0;
  for (const [trfId, memberId] of playerIdMap) {
    const existing = await db
      .select({ id: tournamentParticipants.id })
      .from(tournamentParticipants)
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.memberId, memberId)
      ))
      .limit(1);

    if (existing.length === 0) {
      const trfPlayer = parsed.players.find(p => p.id === trfId);
      await db.insert(tournamentParticipants).values({
        tournamentId,
        memberId,
        score: trfPlayer?.points?.toString() ?? "0",
        rank: trfPlayer?.rank,
      });
      playersImported++;
    }
  }

  // Import games
  let gamesImported = 0;
  for (const game of parsed.games) {
    const whiteId = playerIdMap.get(game.whiteId);
    const blackId = playerIdMap.get(game.blackId);

    if (!whiteId || !blackId) continue;

    // Check if game already exists
    const existingGame = await db
      .select({ id: games.id })
      .from(games)
      .where(and(
        eq(games.tournamentId, tournamentId),
        eq(games.round, game.round),
        eq(games.whiteId, whiteId),
        eq(games.blackId, blackId)
      ))
      .limit(1);

    if (existingGame.length === 0) {
      await db.insert(games).values({
        tournamentId,
        round: game.round,
        whiteId,
        blackId,
        result: game.result as "1-0" | "0-1" | "1/2-1/2" | "+-" | "-+" | "+/+" | null,
      });
      gamesImported++;
    }
  }

  // Update tournament TRF data
  await db
    .update(tournaments)
    .set({
      trfData: trfContent,
      numberOfRounds: parsed.tournament.numberOfRounds || parsed.tournament.numberOfRounds,
    })
    .where(eq(tournaments.id, tournamentId));

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);

  return {
    success: true,
    imported: { players: playersImported, games: gamesImported },
    errors: [],
  };
}

export async function generateTRF(tournamentId: string): Promise<string> {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) throw new Error("Turnier nicht gefunden");

  const participants = await getTournamentParticipants(tournamentId);
  const allGames = await getGames(tournamentId);

  const lines: string[] = [];

  // Tournament header
  lines.push(`012 ${tournament.name}`);
  if (tournament.location) lines.push(`022 ${tournament.location}`);
  if (tournament.startDate) lines.push(`042 ${tournament.startDate}`);
  if (tournament.endDate) lines.push(`052 ${tournament.endDate}`);
  if (tournament.numberOfRounds) lines.push(`062 ${tournament.numberOfRounds}`);
  if (tournament.timeControl) lines.push(`082 ${tournament.timeControl}`);

  // Players
  const playerMap = new Map<string, number>(); // memberId -> TRF ID
  let trfId = 1;
  for (const p of participants) {
    playerMap.set(p.memberId, trfId);
    const member = await getMemberById(p.memberId);
    if (member) {
      const name = `${member.lastName}, ${member.firstName}`;
      const rating = member.dwz?.toString().padStart(4) || "    ";
      const points = p.score?.toString().padStart(4, " ") || " 0.0";
      const rank = p.rank?.toString().padStart(3, " ") || "   ";

      // Build opponent/results string
      const gamesForPlayer = allGames.filter(g =>
        g.whiteId === p.memberId || g.blackId === p.memberId
      );

      const pairingInfo = gamesForPlayer
        .sort((a, b) => a.round - b.round)
        .map(game => {
          const isWhite = game.whiteId === p.memberId;
          const opponentId = isWhite ? game.blackId : game.whiteId;
          const oppTrfId = playerMap.get(opponentId) || 0;
          let result = "*";
          if (game.result) {
            if (game.result === "1-0") result = isWhite ? "1" : "0";
            else if (game.result === "0-1") result = isWhite ? "0" : "1";
            else if (game.result === "1/2-1/2") result = "=";
          }
          const color = isWhite ? "w" : "b";
          return `${oppTrfId.toString().padStart(4)} ${result.padEnd(4)}${color}`;
        })
        .join(" ");

      lines.push(`001 ${trfId.toString().padStart(4)} ${" ".repeat(5)}${name.padEnd(33)} GER          ${rating} ${points} ${rank} ${pairingInfo}`);
    }
    trfId++;
  }

  return lines.join("\n");
}

export async function exportMembersToCSVAction(search?: string, role?: string, status?: string): Promise<string> {
  let query = db.select().from(members);

  if (search) {
    query = query.where(
      or(
        sql`${members.firstName} ILIKE ${`%${search}%`}`,
        sql`${members.lastName} ILIKE ${`%${search}%`}`,
        sql`${members.email} ILIKE ${`%${search}%`}`
      )
    ) as typeof query;
  }

  if (role) {
    query = query.where(sql`${members.role} = ${role}`) as typeof query;
  }

  if (status) {
    query = query.where(sql`${members.status} = ${status}`) as typeof query;
  }

  const allMembers = await query.orderBy(desc(members.createdAt));

  return exportMembersToCSV(allMembers);
}

// ─── Tournament Actions ─────────────────────────────────────────

export async function getTournamentById(id: string) {
  const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
  return tournament ?? null;
}

export async function getTournamentParticipants(tournamentId: string) {
  const result = await db
    .select({
      id: tournamentParticipants.id,
      memberId: tournamentParticipants.memberId,
      score: tournamentParticipants.score,
      buchholz: tournamentParticipants.buchholz,
      sonnebornBerger: tournamentParticipants.sonnebornBerger,
      rank: tournamentParticipants.rank,
      firstName: members.firstName,
      lastName: members.lastName,
      dwz: members.dwz,
      elo: members.elo,
    })
    .from(tournamentParticipants)
    .innerJoin(members, eq(tournamentParticipants.memberId, members.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  return result;
}

export async function addTournamentParticipantForm(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const memberId = formData.get("memberId") as string;

  await db.insert(tournamentParticipants).values({
    tournamentId,
    memberId,
  });

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

export async function removeTournamentParticipantForm(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const participantId = formData.get("participantId") as string;

  await db
    .delete(tournamentParticipants)
    .where(eq(tournamentParticipants.id, participantId));

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
}

// ─── Round-Robin Pairings ───────────────────────────────────────

export async function generateRoundRobinPairingsAction(
  tournamentId: string
): Promise<Round[]> {
  const participants = await getTournamentParticipants(tournamentId);

  if (participants.length < 2) {
    throw new Error("Mindestens 2 Teilnehmer erforderlich");
  }

  const pairings = generateRoundRobinPairings(
    participants.map((p) => ({
      id: p.memberId,
      name: `${p.firstName} ${p.lastName}`,
      rating: p.dwz ?? undefined,
    }))
  );

  // Save pairings to database as games
  for (const round of pairings) {
    for (const pairing of round.pairings) {
      await db.insert(games).values({
        tournamentId,
        round: round.round,
        boardNumber: pairing.board,
        whiteId: pairing.white.id,
        blackId: pairing.black.id,
        result: null,
      });
    }
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return pairings;
}

export async function updateGameResult(formData: FormData) {
  const gameId = formData.get("gameId") as string;
  const result = formData.get("result") as string;

  await db
    .update(games)
    .set({ result: result as "1-0" | "0-1" | "1/2-1/2" | "+-" | "-+" | "+/+" | null })
    .where(eq(games.id, gameId));

  // Update tournament participant scores
  const [game] = await db.select().from(games).where(eq(games.id, gameId));
  if (game) {
    await updateTournamentScores(game.tournamentId);
  }

  revalidatePath(`/dashboard/tournaments/${game?.tournamentId}`);
}

async function updateTournamentScores(tournamentId: string) {
  const allGames = await db
    .select()
    .from(games)
    .where(eq(games.tournamentId, tournamentId));

  const scores = new Map<string, number>();

  for (const game of allGames) {
    if (!game.result) continue;

    const whiteScore = scores.get(game.whiteId) ?? 0;
    const blackScore = scores.get(game.blackId) ?? 0;

    switch (game.result) {
      case "1-0":
        scores.set(game.whiteId, whiteScore + 1);
        break;
      case "0-1":
        scores.set(game.blackId, blackScore + 1);
        break;
      case "1/2-1/2":
        scores.set(game.whiteId, whiteScore + 0.5);
        scores.set(game.blackId, blackScore + 0.5);
        break;
    }
  }

  // Update scores in database
  for (const [memberId, score] of scores) {
    await db
      .update(tournamentParticipants)
      .set({ score: score.toString() })
      .where(
        and(
          eq(tournamentParticipants.tournamentId, tournamentId),
          eq(tournamentParticipants.memberId, memberId)
        )
      );
  }
}

// ─── Additional Actions ───────────────────────────────────────

export async function getTeamById(id: string) {
  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  return team ?? null;
}

export async function getTeamMembers(teamId: string) {
  return db
    .select({
      id: members.id,
      memberId: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      dwz: members.dwz,
      role: members.role,
      boardNumber: boardOrders.boardNumber,
      isRegular: teamMemberships.isRegular,
    })
    .from(teamMemberships)
    .innerJoin(members, eq(teamMemberships.memberId, members.id))
    .leftJoin(boardOrders, and(
      eq(boardOrders.memberId, members.id),
      eq(boardOrders.teamId, teamId)
    ))
    .where(eq(teamMemberships.teamId, teamId));
}

export async function getMatches(teamId?: string) {
  if (teamId) {
    return db
      .select()
      .from(matches)
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
      .orderBy(desc(matches.matchDate));
  }
  return db.select().from(matches).orderBy(desc(matches.matchDate));
}

export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const permissionsStr = (formData.get("permissions") as string) || "[]";
  
  const [oldUser] = await db.select().from(authUsers).where(eq(authUsers.id, userId));
  
  let permissions: string[] = [];
  try {
    permissions = JSON.parse(permissionsStr);
  } catch {
    permissions = [];
  }

  await db
    .update(authUsers)
    .set({ role: role as any, permissions })
    .where(eq(authUsers.id, userId));

  await logAudit({
    action: "ROLE_CHANGED",
    entity: "user",
    entityId: userId,
    category: "ADMIN",
    changes: {
      role: { old: oldUser?.role, new: role },
      permissions: { old: oldUser?.permissions, new: permissions },
    },
  });

  revalidatePath("/dashboard/admin/authUsers");
}

export async function updateMember(id: string, formData: FormData) {
  const oldMember = await getMemberById(id);

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    gender: (formData.get("gender") as string) || undefined,
    dwz: formData.get("dwz") ? Number(formData.get("dwz")) : undefined,
    elo: formData.get("elo") ? Number(formData.get("elo")) : undefined,
    dwzId: (formData.get("dwzId") as string) || undefined,
    lichessUsername: (formData.get("lichessUsername") as string) || undefined,
    chesscomUsername: (formData.get("chesscomUsername") as string) || undefined,
    role: (formData.get("role") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validated = createMemberSchema.partial().parse(rawData);

  await db
    .update(members)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(members.id, id));

  const changes: Record<string, { old: unknown; new: unknown }> = {};
  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined && oldMember?.[key as keyof typeof oldMember] !== value) {
      changes[key] = {
        old: oldMember?.[key as keyof typeof oldMember],
        new: value,
      };
    }
  }

  if (Object.keys(changes).length > 0) {
    await logMemberAction("UPDATED", id, changes);
  }

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
}

// ─── Password Reset ───────────────────────────────────────────

import { authClient } from "@/lib/auth/client";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  // Use Better Auth's password reset API
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo: "/auth/reset-password",
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("password") as string;

  // Use Better Auth's password reset API
  const result = await authClient.resetPassword({
    token,
    newPassword,
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }

  return { success: true };
}

export async function verifyEmail(formData: FormData) {
  const token = formData.get("token") as string;

  // Use Better Auth's email verification API
  const result = await authClient.verifyEmail({
    query: { token },
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }

  return { success: true };
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    throw new Error("Passwoerter stimmen nicht ueberein");
  }

  // Use Better Auth's server-side sign up API
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
  } catch (error: any) {
    throw new Error(error.message ?? "Registrierung fehlgeschlagen");
  }
}

// ─── Member Invitation ────────────────────────────────────────

export async function inviteMember(memberId: string) {
  const result = await createInvitation(memberId);
  return result;
}

export async function validateMemberInvitation(token: string) {
  return validateInvitation(token);
}

export async function acceptMemberInvitation(token: string, userId: string) {
  return consumeInvitation(token, userId);
}
