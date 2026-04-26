"use server";

import { db } from "@/lib/db";
import { availability, matches, members, teams } from "@/lib/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";

export async function getUpcomingMatchesForAvailability() {
  const clubId = await requireClubId();
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      id: matches.id,
      date: matches.matchDate,
      opponent: teams.name, // Using home or away team name as opponent context
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
    })
    .from(matches)
    .innerJoin(teams, sql`${matches.homeTeamId} = ${teams.id} OR ${matches.awayTeamId} = ${teams.id}`)
    .where(and(
      eq(teams.clubId, clubId),
      gte(matches.matchDate, today)
    ))
    .orderBy(matches.matchDate);
}

export async function getMemberAvailability() {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  return db
    .select()
    .from(availability)
    .where(eq(availability.memberId, session.user.memberId));
}

export async function updateAvailability(matchId: string, status: "available" | "unavailable" | "maybe") {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const memberId = session.user.memberId;

  const [existing] = await db
    .select()
    .from(availability)
    .where(and(
      eq(availability.matchId, matchId),
      eq(availability.memberId, memberId)
    ));

  if (existing) {
    await db
      .update(availability)
      .set({ status, updatedAt: new Date() })
      .where(eq(availability.id, existing.id));
  } else {
    // Need to get the date from the match
    const [match] = await db
      .select({ matchDate: matches.matchDate })
      .from(matches)
      .where(eq(matches.id, matchId));
    
    if (!match) throw new Error("Match nicht gefunden");

    await db.insert(availability).values({
      matchId,
      memberId,
      status,
      date: match.matchDate,
    } as any);
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/teams");
}

export async function getMatchAvailability(matchId: string) {
  await requireClubId();

  return db
    .select({
      id: availability.id,
      status: availability.status,
      memberId: availability.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
    })
    .from(availability)
    .innerJoin(members, eq(availability.memberId, members.id))
    .where(eq(availability.matchId, matchId));
}

