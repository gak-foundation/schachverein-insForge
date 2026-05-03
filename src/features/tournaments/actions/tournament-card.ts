"use server";

import { createServiceClient } from "@/lib/insforge";

export type TournamentCardData = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  description: string | null;
  timeControl: string | null;
  numberOfRounds: number | null;
  isCompleted: boolean;
  isPublic: boolean;
  maxParticipants: number | null;
  participantCount: number;
  standings: Array<{
    id: string;
    memberName: string;
    rank: number | null;
    score: number;
    dwz: number | null;
  }>;
};

export async function getTournamentCardData(
  tournamentId: string
): Promise<TournamentCardData | null> {
  if (!tournamentId) return null;

  const client = createServiceClient();

  const { data: tournament, error } = await client
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (error || !tournament) return null;

  const { count, error: countError } = await client
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  const participantCount = countError ? 0 : (count ?? 0);

  let standings: TournamentCardData["standings"] = [];
  if (participantCount > 0) {
    const { data: participants } = await client
      .from("tournament_participants")
      .select("id, member_id, rank, score")
      .eq("tournament_id", tournamentId)
      .order("rank", { ascending: true });

    if (participants && participants.length > 0) {
      const memberIds = participants.map((p: any) => p.member_id);
      const { data: members } = await client
        .from("members")
        .select("id, first_name, last_name, dwz")
        .in("id", memberIds);

      const memberMap = new Map<string, any>();
      if (members) {
        members.forEach((m: any) => memberMap.set(m.id, m));
      }

      standings = participants.map((p: any) => {
        const member = memberMap.get(p.member_id);
        return {
          id: p.id,
          memberName: member ? `${member.last_name}, ${member.first_name}` : "Unbekannt",
          rank: p.rank,
          score: parseFloat(p.score || "0"),
          dwz: member?.dwz ?? null,
        };
      });
    }
  }

  return {
    id: tournament.id,
    name: tournament.name,
    type: tournament.type,
    startDate: tournament.start_date,
    endDate: tournament.end_date,
    location: tournament.location,
    description: tournament.description,
    timeControl: tournament.time_control,
    numberOfRounds: tournament.number_of_rounds,
    isCompleted: tournament.is_completed ?? false,
    isPublic: tournament.is_public ?? false,
    maxParticipants: tournament.max_participants ?? null,
    participantCount,
    standings,
  };
}

export async function getTournamentsForSelector(
  clubId: string
): Promise<Array<{ id: string; name: string; date: string; type: string }>> {
  if (!clubId) return [];

  const client = createServiceClient();

  const { data, error } = await client
    .from("tournaments")
    .select("id, name, start_date, type")
    .eq("club_id", clubId)
    .order("start_date", { ascending: false });

  if (error || !data) return [];

  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    date: t.start_date ? new Date(t.start_date).toLocaleDateString("de-DE") : "",
    type: t.type,
  }));
}
