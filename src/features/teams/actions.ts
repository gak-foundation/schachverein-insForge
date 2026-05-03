"use server";

import { createServiceClient } from "@/lib/insforge";
import { revalidatePath } from "next/cache";
import { requireClubId } from "@/lib/actions/utils";

export async function getTeams() {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from("teams")
    .select("id, name, season_id, league, captain_id")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error in getTeams:", error);
    return [];
  }

  return data || [];
}

export async function getTeamById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data, error } = await client
    .from("teams")
    .select("*")
    .eq("id", id)
    .eq("club_id", clubId)
    .single();

  if (error) {
    console.error("Error in getTeamById:", error);
    return null;
  }

  return data;
}

export async function createTeam(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const name = formData.get("name") as string;
  const seasonId = formData.get("seasonId") as string;
  const league = (formData.get("league") as string) || null;
  const captainId = (formData.get("captainId") as string) || null;

  // Validate season exists
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("id")
    .eq("id", seasonId)
    .eq("club_id", clubId)
    .single();

  if (seasonError || !season) {
    throw new Error("Saison nicht gefunden");
  }

  // Validate captain if provided
  if (captainId) {
    const { data: membership, error: membershipError } = await client
      .from("club_memberships")
      .select("id")
      .eq("member_id", captainId)
      .eq("club_id", clubId)
      .single();

    if (membershipError || !membership) {
      throw new Error("Mannschaftsführer ist kein Vereinsmitglied");
    }
  }

  const { error } = await client.from("teams").insert({
    club_id: clubId,
    name,
    season_id: seasonId,
    league,
    captain_id: captainId,
  });

  if (error) {
    console.error("Error creating team:", error);
    throw new Error("Fehler beim Erstellen der Mannschaft");
  }

  revalidatePath("/dashboard/teams");
}

export async function updateTeam(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const id = formData.get("id") as string;

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", id)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const name = formData.get("name") as string;
  const seasonId = formData.get("seasonId") as string;
  const league = (formData.get("league") as string) || null;
  const captainId = (formData.get("captainId") as string) || null;

  // Validate season exists
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("id")
    .eq("id", seasonId)
    .eq("club_id", clubId)
    .single();

  if (seasonError || !season) {
    throw new Error("Saison nicht gefunden");
  }

  // Validate captain if provided
  if (captainId) {
    const { data: membership, error: membershipError } = await client
      .from("club_memberships")
      .select("id")
      .eq("member_id", captainId)
      .eq("club_id", clubId)
      .single();

    if (membershipError || !membership) {
      throw new Error("Mannschaftsführer ist kein Vereinsmitglied");
    }
  }

  const { error } = await client
    .from("teams")
    .update({ name, season_id: seasonId, league, captain_id: captainId })
    .eq("id", id);

  if (error) {
    console.error("Error updating team:", error);
    throw new Error("Fehler beim Aktualisieren der Mannschaft");
  }

  revalidatePath("/dashboard/teams");
}

export async function deleteTeam(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", id)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const { error } = await client.from("teams").delete().eq("id", id);

  if (error) {
    console.error("Error deleting team:", error);
    throw new Error("Fehler beim Löschen der Mannschaft");
  }

  revalidatePath("/dashboard/teams");
}

export async function getTeamMembers(teamId: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const { data, error } = await client
    .from("team_memberships")
    .select("id, member_id, is_regular, members(first_name, last_name, dwz)")
    .eq("team_id", teamId);

  if (error) {
    console.error("Error in getTeamMembers:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    memberId: item.member_id,
    isRegular: item.is_regular,
    member: item.members,
  }));
}

export async function addTeamMember(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const teamId = formData.get("teamId") as string;
  const memberId = formData.get("memberId") as string;
  const isRegular = formData.get("isRegular") === "true";

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("season_id")
    .eq("id", teamId)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  // Verify membership
  const { data: membership, error: membershipError } = await client
    .from("club_memberships")
    .select("id")
    .eq("member_id", memberId)
    .eq("club_id", clubId)
    .single();

  if (membershipError || !membership) {
    throw new Error("Mitglied ist nicht im Verein");
  }

  const { error } = await client.from("team_memberships").insert({
    team_id: teamId,
    member_id: memberId,
    season_id: team.season_id,
    is_regular: isRegular,
  });

  if (error) {
    console.error("Error adding team member:", error);
    throw new Error("Fehler beim Hinzufügen des Mitglieds");
  }

  revalidatePath("/dashboard/teams");
}

export async function removeTeamMember(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // Get membership
  const { data: membership, error: membershipError } = await client
    .from("team_memberships")
    .select("team_id")
    .eq("id", id)
    .single();

  if (membershipError || !membership) {
    throw new Error("Mitgliedschaft nicht gefunden");
  }

  // Verify team belongs to club
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", membership.team_id)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const { error } = await client
    .from("team_memberships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing team member:", error);
    throw new Error("Fehler beim Entfernen des Mitglieds");
  }

  revalidatePath("/dashboard/teams");
}

export async function getBoardOrders(teamId: string, seasonId: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  const { data, error } = await client
    .from("board_orders")
    .select("id, member_id, board_number, is_joker, members(first_name, last_name, dwz)")
    .eq("team_id", teamId)
    .eq("season_id", seasonId)
    .order("board_number", { ascending: true });

  if (error) {
    console.error("Error in getBoardOrders:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    memberId: item.member_id,
    boardNumber: item.board_number,
    isJoker: item.is_joker,
    member: item.members,
  }));
}

export async function setBoardOrder(formData: FormData) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const teamId = formData.get("teamId") as string;
  const seasonId = formData.get("seasonId") as string;
  const memberId = formData.get("memberId") as string;
  const boardNumber = Number(formData.get("boardNumber"));
  const isJoker = formData.get("isJoker") === "true";

  // Verify team exists
  const { data: team, error: teamError } = await client
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .eq("club_id", clubId)
    .single();

  if (teamError || !team) {
    throw new Error("Mannschaft nicht gefunden");
  }

  // Verify season exists
  const { data: season, error: seasonError } = await client
    .from("seasons")
    .select("id")
    .eq("id", seasonId)
    .eq("club_id", clubId)
    .single();

  if (seasonError || !season) {
    throw new Error("Saison nicht gefunden");
  }

  // Check for existing board order at this position
  const { data: existing, error: existingError } = await client
    .from("board_orders")
    .select("id")
    .eq("team_id", teamId)
    .eq("season_id", seasonId)
    .eq("board_number", boardNumber)
    .single();

  if (existing && !existingError) {
    // Update existing
    const { error } = await client
      .from("board_orders")
      .update({ member_id: memberId, is_joker: isJoker })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating board order:", error);
      throw new Error("Fehler beim Aktualisieren");
    }
  } else {
    // Insert new
    const { error } = await client.from("board_orders").insert({
      team_id: teamId,
      season_id: seasonId,
      member_id: memberId,
      board_number: boardNumber,
      is_joker: isJoker,
    });

    if (error) {
      console.error("Error creating board order:", error);
      throw new Error("Fehler beim Erstellen");
    }
  }

  revalidatePath("/dashboard/teams");
}

export async function getMatches(seasonId?: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  let query = client
    .from("matches")
    .select(
      "id, season_id, home_team_id, away_team_id, match_date, home_score, away_score, status"
    )
    .eq("teams.club_id", clubId)
    .order("match_date", { ascending: false });

  // Note: The join with teams for club filtering needs to be handled via a different approach
  // or we can filter matches by checking if their teams belong to the club

  const { data, error } = await query;

  if (error) {
    console.error("Error in getMatches:", error);
    return [];
  }

  // Filter by season if provided
  let matches = data || [];
  if (seasonId) {
    matches = matches.filter((m: any) => m.season_id === seasonId);
  }

  return matches;
}

export async function getMatchById(id: string) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const { data: match, error } = await client
    .from("matches")
    .select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), seasons(*)")
    .eq("id", id)
    .single();

  if (error || !match) {
    return null;
  }

  // Verify club ownership via home team
  if (match.home_team?.club_id !== clubId) {
    return null;
  }

  return match;
}

export async function getMatchResults(matchId: string) {
  const client = createServiceClient();

  const { data, error } = await client
    .from("match_results")
    .select("*, home_player:members!home_player_id(*), away_player:members!away_player_id(*)")
    .eq("match_id", matchId)
    .order("board_number", { ascending: true });

  if (error) {
    console.error("Error in getMatchResults:", error);
    return [];
  }

  return data || [];
}

export async function updateMatchResult(
  matchId: string,
  boardResults: {
    boardNumber: number;
    homePlayerId: string | null;
    awayPlayerId: string | null;
    result: string | null;
  }[]
) {
  await requireClubId();
  const client = createServiceClient();
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

    // Check for existing result
    const { data: existing, error: existingError } = await client
      .from("match_results")
      .select("id")
      .eq("match_id", matchId)
      .eq("board_number", br.boardNumber)
      .single();

    if (existing && !existingError) {
      await client
        .from("match_results")
        .update({
          home_player_id: br.homePlayerId,
          away_player_id: br.awayPlayerId,
          result: br.result,
        })
        .eq("id", existing.id);
    } else {
      await client.from("match_results").insert({
        match_id: matchId,
        board_number: br.boardNumber,
        home_player_id: br.homePlayerId,
        away_player_id: br.awayPlayerId,
        result: br.result,
      });
    }
  }

  // Update match total score and status
  const { error } = await client
    .from("matches")
    .update({
      home_score: homeTotalScore.toString(),
      away_score: awayTotalScore.toString(),
      status: "completed",
    })
    .eq("id", matchId);

  if (error) {
    console.error("Error updating match:", error);
  }

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
  const boardMap = new Map(
    officialOrder.map((o) => [o.memberId, o.boardNumber])
  );

  let lastBoardNum = 0;
  for (let i = 0; i < proposedPlayerIds.length; i++) {
    const playerId = proposedPlayerIds[i];
    if (!playerId) continue;

    const boardNum = boardMap.get(playerId);
    if (!boardNum) {
      violations.push(
        `Spieler an Brett ${i + 1} ist nicht in der offiziellen Rangliste gemeldet.`
      );
      continue;
    }

    if (boardNum < lastBoardNum) {
      violations.push(
        `Brettfolge verletzt: Spieler an Brett ${i + 1} (Rang ${boardNum}) steht hinter Rang ${lastBoardNum}.`
      );
    }
    lastBoardNum = boardNum;
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}
