"use server";

import { db } from "@/lib/db";
import { teams, seasons, clubMemberships, teamMemberships, boardOrders, matches, members, matchResults } from "@/lib/db/schema";
import { eq, desc, asc, and, inArray, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireClubId } from "./utils";

export async function getTeams() {
  const clubId = await requireClubId();

  return db
    .select({
      id: teams.id,
      name: teams.name,
      seasonId: teams.seasonId,
      league: teams.league,
      captainId: teams.captainId,
    })
    .from(teams)
    .where(eq(teams.clubId, clubId))
    .orderBy(desc(teams.createdAt));
}

export async function getTeamById(id: string) {
  const clubId = await requireClubId();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, id),
      eq(teams.clubId, clubId)
    ));

  return team ?? null;
}

export async function createTeam(formData: FormData) {
  const clubId = await requireClubId();

  const name = formData.get("name") as string;
  const seasonId = formData.get("seasonId") as string;
  const league = (formData.get("league") as string) || null;
  const captainId = (formData.get("captainId") as string) || null;

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

  if (captainId) {
    const [membership] = await db
      .select()
      .from(clubMemberships)
      .where(and(
        eq(clubMemberships.memberId, captainId),
        eq(clubMemberships.clubId, clubId)
      ));

    if (!membership) {
      throw new Error("Mannschaftsführer ist kein Vereinsmitglied");
    }
  }

  await db.insert(teams).values({
    clubId,
    name,
    seasonId,
    league,
    captainId,
  });

  revalidatePath("/dashboard/teams");
}

export async function updateTeam(formData: FormData) {
  const clubId = await requireClubId();
  const id = formData.get("id") as string;

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, id),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const name = formData.get("name") as string;
  const seasonId = formData.get("seasonId") as string;
  const league = (formData.get("league") as string) || null;
  const captainId = (formData.get("captainId") as string) || null;

  // Validate season exists
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

  // Validate captain if provided
  if (captainId) {
    const [membership] = await db
      .select()
      .from(clubMemberships)
      .where(and(
        eq(clubMemberships.memberId, captainId),
        eq(clubMemberships.clubId, clubId)
      ));

    if (!membership) {
      throw new Error("Mannschaftsführer ist kein Vereinsmitglied");
    }
  }

  await db
    .update(teams)
    .set({
      name,
      seasonId,
      league,
      captainId,
    })
    .where(eq(teams.id, id));

  revalidatePath("/dashboard/teams");
}

export async function deleteTeam(id: string) {
  const clubId = await requireClubId();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, id),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  await db.delete(teams).where(eq(teams.id, id));

  revalidatePath("/dashboard/teams");
}

export async function getTeamMembers(teamId: string) {
  const clubId = await requireClubId();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, teamId),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  return db
    .select({
      id: teamMemberships.id,
      memberId: teamMemberships.memberId,
      isRegular: teamMemberships.isRegular,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        dwz: members.dwz,
      },
    })
    .from(teamMemberships)
    .innerJoin(members, eq(teamMemberships.memberId, members.id))
    .where(eq(teamMemberships.teamId, teamId));
}

export async function addTeamMember(formData: FormData) {
  const clubId = await requireClubId();

  const teamId = formData.get("teamId") as string;
  const memberId = formData.get("memberId") as string;
  const isRegular = formData.get("isRegular") === "true";

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, teamId),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
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

  await db.insert(teamMemberships).values({
    teamId,
    memberId,
    seasonId: team.seasonId,
    isRegular,
  });

  revalidatePath("/dashboard/teams");
}

export async function removeTeamMember(id: string) {
  const clubId = await requireClubId();

  const [membership] = await db
    .select({
      teamId: teamMemberships.teamId,
    })
    .from(teamMemberships)
    .where(eq(teamMemberships.id, id));

  if (!membership) {
    throw new Error("Mitgliedschaft nicht gefunden");
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, membership.teamId),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  await db.delete(teamMemberships).where(eq(teamMemberships.id, id));

  revalidatePath("/dashboard/teams");
}

export async function getBoardOrders(teamId: string, seasonId: string) {
  const clubId = await requireClubId();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, teamId),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  return db
    .select({
      id: boardOrders.id,
      memberId: boardOrders.memberId,
      boardNumber: boardOrders.boardNumber,
      isJoker: boardOrders.isJoker,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        dwz: members.dwz,
      },
    })
    .from(boardOrders)
    .innerJoin(members, eq(boardOrders.memberId, members.id))
    .where(and(
      eq(boardOrders.teamId, teamId),
      eq(boardOrders.seasonId, seasonId)
    ))
    .orderBy(boardOrders.boardNumber);
}

export async function setBoardOrder(formData: FormData) {
  const clubId = await requireClubId();

  const teamId = formData.get("teamId") as string;
  const seasonId = formData.get("seasonId") as string;
  const memberId = formData.get("memberId") as string;
  const boardNumber = Number(formData.get("boardNumber"));
  const isJoker = formData.get("isJoker") === "true";

  const [team] = await db
    .select()
    .from(teams)
    .where(and(
      eq(teams.id, teamId),
      eq(teams.clubId, clubId)
    ));

  if (!team) {
    throw new Error("Mannschaft nicht gefunden");
  }

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

  const [existing] = await db
    .select()
    .from(boardOrders)
    .where(and(
      eq(boardOrders.teamId, teamId),
      eq(boardOrders.seasonId, seasonId),
      eq(boardOrders.boardNumber, boardNumber)
    ));

  if (existing) {
    await db
      .update(boardOrders)
      .set({ memberId, isJoker })
      .where(eq(boardOrders.id, existing.id));
  } else {
    await db.insert(boardOrders).values({
      teamId,
      seasonId,
      memberId,
      boardNumber,
      isJoker,
    });
  }

  revalidatePath("/dashboard/teams");
}

export async function getMatches(seasonId?: string) {
  const clubId = await requireClubId();

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(teams.clubId, clubId),
  ];

  if (seasonId) {
    conditions.push(eq(matches.seasonId, seasonId));
  }

  return db
    .select({
      id: matches.id,
      seasonId: matches.seasonId,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      matchDate: matches.matchDate,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.homeTeamId, teams.id))
    .where(and(...conditions.filter(Boolean)))
    .orderBy(desc(matches.matchDate));
}

export async function getMatchById(id: string) {
  const clubId = await requireClubId();

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      homeTeam: true,
      awayTeam: true,
      season: true,
    },
  });

  if (!match || match.homeTeam.clubId !== clubId) {
    return null;
  }

  return match;
}

export async function getMatchResults(matchId: string) {
  return db.query.matchResults.findMany({
    where: eq(matchResults.matchId, matchId),
    with: {
      homePlayer: true,
      awayPlayer: true,
    },
    orderBy: [asc(matchResults.boardNumber)],
  });
}

export async function updateMatchResult(
  matchId: string,
  boardResults: {
    boardNumber: number;
    homePlayerId: string | null;
    awayPlayerId: string | null;
    result: typeof matchResults.$inferInsert.result;
  }[]
) {
  const clubId = await requireClubId();
  const match = await getMatchById(matchId);

  if (!match) {
    throw new Error("Mannschaftskampf nicht gefunden");
  }

  let homeTotalScore = 0;
  let awayTotalScore = 0;

  for (const br of boardResults) {
    // Calculate scores for this board
    let homeScore = 0;
    let awayScore = 0;

    if (br.result === "1-0") {
      homeScore = 1;
    } else if (br.result === "0-1") {
      awayScore = 1;
    } else if (br.result === "1/2-1/2") {
      homeScore = 0.5;
      awayScore = 0.5;
    } else if (br.result === "+-") {
      homeScore = 1;
    } else if (br.result === "-+") {
      awayScore = 1;
    } else if (br.result === "+/+") {
      homeScore = 1;
      awayScore = 1;
    }

    homeTotalScore += homeScore;
    awayTotalScore += awayScore;

    // Upsert board result
    const [existing] = await db
      .select()
      .from(matchResults)
      .where(and(
        eq(matchResults.matchId, matchId),
        eq(matchResults.boardNumber, br.boardNumber)
      ));

    if (existing) {
      await db
        .update(matchResults)
        .set({
          homePlayerId: br.homePlayerId,
          awayPlayerId: br.awayPlayerId,
          result: br.result,
        })
        .where(eq(matchResults.id, existing.id));
    } else {
      await db.insert(matchResults).values({
        matchId,
        boardNumber: br.boardNumber,
        homePlayerId: br.homePlayerId,
        awayPlayerId: br.awayPlayerId,
        result: br.result,
      });
    }
  }

  // Update match total score and status
  await db
    .update(matches)
    .set({
      homeScore: homeTotalScore.toString(),
      awayScore: awayTotalScore.toString(),
      status: "completed",
    })
    .where(eq(matches.id, matchId));

  revalidatePath(`/dashboard/teams/matches/${matchId}`);
  revalidatePath("/dashboard/teams");
}

/**
 * Validates a proposed line-up against the official board orders for a season.
 * Returns a list of violations (e.g. board number jumping).
 */
export async function validateLineup(
  teamId: string, 
  seasonId: string, 
  proposedPlayerIds: (string | null)[]
) {
  const officialOrder = await getBoardOrders(teamId, seasonId);
  const violations: string[] = [];

  // Map of memberId to their official board number
  const boardMap = new Map(officialOrder.map(o => [o.memberId, o.boardNumber]));

  let lastBoardNum = 0;
  for (let i = 0; i < proposedPlayerIds.length; i++) {
    const playerId = proposedPlayerIds[i];
    if (!playerId) continue;

    const boardNum = boardMap.get(playerId);
    if (!boardNum) {
      violations.push(`Spieler an Brett ${i + 1} ist nicht in der offiziellen Rangliste gemeldet.`);
      continue;
    }

    if (boardNum < lastBoardNum) {
      violations.push(`Brettfolge verletzt: Spieler an Brett ${i + 1} (Rang ${boardNum}) steht hinter Rang ${lastBoardNum}.`);
    }
    lastBoardNum = boardNum;
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}

