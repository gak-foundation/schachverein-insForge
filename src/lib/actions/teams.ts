"use server";

import { db } from "@/lib/db";
import { teams, seasons, clubMemberships, teamMemberships, boardOrders, matches, members } from "@/lib/db/schema";
import { eq, desc, and, inArray, SQL } from "drizzle-orm";
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

export async function createMatch(formData: FormData) {
  const clubId = await requireClubId();

  const seasonId = formData.get("seasonId") as string;
  const homeTeamId = formData.get("homeTeamId") as string;
  const awayTeamId = formData.get("awayTeamId") as string;
  const matchDate = (formData.get("matchDate") as string) || null;
  const location = (formData.get("location") as string) || null;

  const teamIds = [homeTeamId, awayTeamId];
  const teamsList = await db
    .select()
    .from(teams)
    .where(and(
      inArray(teams.id, teamIds),
      eq(teams.clubId, clubId)
    ));

  if (teamsList.length !== 2) {
    throw new Error("Mannschaften nicht gefunden");
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

  await db.insert(matches).values({
    seasonId,
    homeTeamId,
    awayTeamId,
    matchDate,
    location,
  });

  revalidatePath("/dashboard/teams");
}
