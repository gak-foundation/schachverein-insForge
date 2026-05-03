/**
 * TRF (Tournament Report File) Generator
 * Format-Spezifikation: https://www.swisschess.ch/media/attached/2021/09/TRF-16.pdf
 */

import { createServiceClient } from "@/lib/insforge";
import { requireClubId } from "@/lib/actions/utils";

export interface TRFGenerationOptions {
  includeAllRounds?: boolean;
  currentRound?: number;
}

export async function generateTRFFromTournament(
  tournamentId: string,
  options: TRFGenerationOptions = {}
): Promise<string> {
  const client = createServiceClient();
  const clubId = await requireClubId();

  const { data: tournament, error } = await client
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .eq("club_id", clubId)
    .single();

  if (error || !tournament) {
    throw new Error("Turnier nicht gefunden");
  }

  const { data: participants, error: participantsError } = await client
    .from("tournament_participants")
    .select("*, members(first_name, last_name, dwz, fide_id)")
    .eq("tournament_id", tournamentId);

  if (participantsError) {
    throw new Error("Failed to fetch participants");
  }

  const { data: tournamentGames, error: gamesError } = await client
    .from("games")
    .select("id, round, board_number, white_id, black_id, result")
    .eq("tournament_id", tournamentId);

  if (gamesError) {
    throw new Error("Failed to fetch games");
  }

  const sortedGames = (tournamentGames || []).sort((a: any, b: any) => {
    if (a.round !== b.round) return (a.round || 0) - (b.round || 0);
    return (a.board_number || 0) - (b.board_number || 0);
  });

  const playerMap = new Map(
    (participants || []).map((p: any, idx: number) => [
      p.member_id,
      { ...p, trfId: String(idx + 1).padStart(4, "0") },
    ])
  );

  const maxRound =
    sortedGames.length > 0
      ? Math.max(...sortedGames.map((g: any) => g.round || 0))
      : tournament.number_of_rounds || 1;

  const currentRound = options.currentRound || maxRound;

  let trf = "";

  trf += `012 ${tournament.name.padEnd(70, " ")}\n`;
  if (tournament.location) {
    trf += `022 ${tournament.location.padEnd(40, " ")}\n`;
  }
  trf += `032 GER\n`;
  trf += `042 ${tournament.start_date || new Date().toISOString().split("T")[0]}\n`;
  if (tournament.end_date) {
    trf += `052 ${tournament.end_date}\n`;
  }
  trf += `062 ${tournament.number_of_rounds || maxRound}\n`;
  trf += `072 ${currentRound}\n`;
  if (tournament.time_control) {
    trf += `082 ${tournament.time_control.padEnd(30, " ")}\n`;
  }

  participants?.forEach((p: any, idx: number) => {
    const trfId = String(idx + 1).padStart(4, "0");
    const member = p.members;
    const name = member
      ? `${member.last_name}, ${member.first_name}`.padEnd(33, " ")
      : "".padEnd(33, " ");
    const rating = String(member?.dwz || 0).padStart(4, "0");
    const score = String(parseFloat(p.score || "0").toFixed(1)).padStart(4, " ");
    const rank = String(p.rank || idx + 1).padStart(4, " ");

    let line = `001 ${trfId} ${name} GER    ${rating}           ${score} ${rank}`;

    for (let round = 1; round <= currentRound; round++) {
      const game = sortedGames.find(
        (g: any) =>
          g.round === round &&
          (g.white_id === p.member_id || g.black_id === p.member_id)
      );

      if (game) {
        const isWhite = game.white_id === p.member_id;
        const opponentId = isWhite ? game.black_id : game.white_id;
        const opponentTrfId =
          (opponentId ? playerMap.get(opponentId)?.trfId : null) || "0000";

        let resultCode = " ";
        if (game.result) {
          if (game.result === "1-0") {
            resultCode = isWhite ? "1" : "0";
          } else if (game.result === "0-1") {
            resultCode = isWhite ? "0" : "1";
          } else if (game.result === "1/2-1/2") {
            resultCode = "=";
          } else if (game.result === "+-") {
            resultCode = isWhite ? "+" : "-";
          } else if (game.result === "-+") {
            resultCode = isWhite ? "-" : "+";
          } else if (game.result === "+/+") {
            resultCode = "=";
          }
        }

        const color = isWhite ? "w" : "b";
        line += ` ${opponentTrfId} ${resultCode.padEnd(3, " ")}${color}`;
      } else {
        line += ` 0000     `;
      }
    }

    trf += line + "\n";
  });

  return trf;
}
