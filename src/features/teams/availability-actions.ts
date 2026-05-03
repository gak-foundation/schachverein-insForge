"use server";

import { createServiceClient } from "@/lib/insforge";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";

export async function getUpcomingMatchesForAvailability() {
  const clubId = await requireClubId();
  const today = new Date().toISOString().split("T")[0];
  const client = createServiceClient();

  const { data: clubTeams, error: teamsError } = await client
    .from('teams')
    .select('id, name')
    .eq('club_id', clubId);

  if (teamsError || !clubTeams?.length) return [];

  const teamIds = clubTeams.map((t: any) => t.id);

  const { data: upcomingMatches, error: matchesError } = await client
    .from('matches')
    .select('*')
    .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
    .gte('match_date', today)
    .order('match_date');

  if (matchesError || !upcomingMatches) return [];

  return upcomingMatches.map((m: any) => {
    const team = clubTeams.find((t: any) => t.id === m.home_team_id || t.id === m.away_team_id);
    return {
      id: m.id,
      date: m.match_date,
      opponent: team?.name || "Unbekannt",
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
    };
  });
}

export async function getMemberAvailability() {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const client = createServiceClient();

  const { data, error } = await client
    .from('availability')
    .select('*')
    .eq('member_id', session.user.memberId);

  if (error) throw error;
  return data || [];
}

export async function updateAvailability(matchId: string, status: "available" | "unavailable" | "maybe") {
  const session = await getSession();
  if (!session || !session.user.memberId) {
    throw new Error("Nicht autorisiert");
  }

  const memberId = session.user.memberId;
  const client = createServiceClient();

  const { data: existing, error } = await client
    .from('availability')
    .select('*')
    .eq('match_id', matchId)
    .eq('member_id', memberId)
    .maybeSingle();

  if (error) throw error;

  if (existing) {
    const { error: uError } = await client
      .from('availability')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (uError) throw uError;
  } else {
    // Need to get the date from the match
    const { data: match, error: mError } = await client
      .from('matches')
      .select('match_date')
      .eq('id', matchId)
      .single();
    
    if (mError || !match) throw new Error("Match nicht gefunden");

    const { error: iError } = await client
      .from('availability')
      .insert([{
        match_id: matchId,
        member_id: memberId,
        status,
        date: match.match_date,
      }]);
    if (iError) throw iError;
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/teams");
}

export async function getMatchAvailability(matchId: string) {
  await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from('availability')
    .select('*, members!member_id(first_name, last_name)')
    .eq('match_id', matchId);

  if (error) throw error;

  return (data || []).map((a: any) => ({
    id: a.id,
    status: a.status,
    memberId: a.member_id,
    firstName: a.members.first_name,
    lastName: a.members.last_name,
  }));
}
