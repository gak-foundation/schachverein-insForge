"use server";

import { createServiceClient } from "@/lib/insforge";

export async function getPublicEvents(clubSlug: string, limit?: number) {
  const client = createServiceClient();

  const { data: club, error: clubError } = await client
    .from("clubs")
    .select("id")
    .eq("slug", clubSlug)
    .single();

  if (clubError || !club) return [];

  const query = client
    .from("events")
    .select("id, title, description, event_type, start_date, end_date, location, is_all_day")
    .eq("club_id", club.id)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true });

  if (limit) {
    const { data, error } = await query.limit(limit);
    if (error) return [];
    return (data || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      eventType: e.event_type,
      startDate: e.start_date,
      endDate: e.end_date,
      location: e.location,
      isAllDay: e.is_all_day,
    }));
  }

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    eventType: e.event_type,
    startDate: e.start_date,
    endDate: e.end_date,
    location: e.location,
    isAllDay: e.is_all_day,
  }));
}

export async function getPublicTeams(clubSlug: string) {
  const client = createServiceClient();
  const currentYear = new Date().getFullYear();

  const { data: club, error: clubError } = await client
    .from("clubs")
    .select("id")
    .eq("slug", clubSlug)
    .single();

  if (clubError || !club) return [];

  const { data: seasons } = await client
    .from("seasons")
    .select("id, name")
    .eq("club_id", club.id)
    .eq("year", currentYear);

  const seasonIds = seasons?.map((s: any) => s.id) || [];
  if (seasonIds.length === 0) return [];

  const { data: teamsData, error } = await client
    .from("teams")
    .select("id, name, league, captain_id, season_id")
    .in("season_id", seasonIds)
    .order("name", { ascending: true });

  if (error || !teamsData) return [];

  const captainIds = [...new Set(teamsData.map((t: any) => t.captain_id).filter(Boolean))];
  const captainMap = new Map<string, string>();
  if (captainIds.length > 0) {
    const { data: captains } = await client
      .from("members")
      .select("id, first_name, last_name")
      .in("id", captainIds);

    captains?.forEach((c: any) => {
      captainMap.set(c.id, `${c.last_name}, ${c.first_name}`);
    });
  }

  const seasonMap = new Map(seasons?.map((s: any) => [s.id, s.name]) || []);

  return teamsData.map((t: any) => ({
    id: t.id,
    name: t.name,
    league: t.league,
    captainName: t.captain_id ? captainMap.get(t.captain_id) : undefined,
    seasonName: seasonMap.get(t.season_id),
  }));
}

export async function getPublicTournaments(clubSlug: string) {
  const client = createServiceClient();

  const { data: club, error: clubError } = await client
    .from("clubs")
    .select("id")
    .eq("slug", clubSlug)
    .single();

  if (clubError || !club) return [];

  const { data, error } = await client
    .from("tournaments")
    .select("id, name, type, start_date, end_date, location, is_completed")
    .eq("club_id", club.id)
    .order("start_date", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    startDate: t.start_date,
    endDate: t.end_date,
    location: t.location,
    isCompleted: t.is_completed,
  }));
}

export async function getClubStats(clubSlug: string) {
  const client = createServiceClient();

  const { data: club, error: clubError } = await client
    .from("clubs")
    .select("id")
    .eq("slug", clubSlug)
    .single();

  if (clubError || !club) return { memberCount: 0, teamCount: 0, matchesThisYear: 0 };

  const { count: activeMemberCount } = await client
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("club_id", club.id)
    .eq("status", "active");

  const { count: teamCount } = await client
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("club_id", club.id);

  const currentYear = new Date().getFullYear();
  const { data: seasons } = await client
    .from("seasons")
    .select("id")
    .eq("club_id", club.id)
    .eq("year", currentYear);

  let matchesThisYear = 0;
  if (seasons && seasons.length > 0) {
    const seasonIds = seasons.map((s: any) => s.id);
    const { count: matchCount } = await client
      .from("matches")
      .select("*", { count: "exact", head: true })
      .in("season_id", seasonIds);
    matchesThisYear = matchCount || 0;
  }

  return {
    memberCount: activeMemberCount || 0,
    teamCount: teamCount || 0,
    matchesThisYear,
  };
}

export async function getUpcomingMatches(clubSlug: string, limit = 5) {
  const client = createServiceClient();

  const { data: club, error: clubError } = await client
    .from("clubs")
    .select("id")
    .eq("slug", clubSlug)
    .single();

  if (clubError || !club) return [];

  const { data: seasons, error: seasonError } = await client
    .from("seasons")
    .select("id")
    .eq("club_id", club.id);

  if (seasonError || !seasons || seasons.length === 0) return [];
  const seasonIds = seasons.map((s: any) => s.id);

  const { data: result, error } = await client
    .from("matches")
    .select("id, match_date, location, home_team_id, away_team_id, home_score, away_score, status")
    .in("season_id", seasonIds)
    .gte("match_date", new Date().toISOString().split("T")[0])
    .neq("status", "cancelled")
    .order("match_date", { ascending: true })
    .limit(limit);

  if (error || !result || result.length === 0) return [];

  const teamIds = [
    ...new Set([
      ...result.map((m: any) => m.home_team_id),
      ...result.map((m: any) => m.away_team_id),
    ]),
  ].filter(Boolean);

  const teamMap = new Map<string, string>();
  if (teamIds.length > 0) {
    const { data: teamData } = await client
      .from("teams")
      .select("id, name")
      .in("id", teamIds);

    if (teamData) {
      teamData.forEach((t: any) => teamMap.set(t.id, t.name));
    }
  }

  return result.map((match: any) => ({
    id: match.id,
    matchDate: match.match_date,
    location: match.location,
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    homeScore: match.home_score,
    awayScore: match.away_score,
    status: match.status,
    homeTeamName: teamMap.get(match.home_team_id) || "Unbekannt",
    awayTeamName: teamMap.get(match.away_team_id) || "Unbekannt",
  }));
}
