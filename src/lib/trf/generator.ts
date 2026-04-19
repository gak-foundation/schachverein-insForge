/**
 * TRF (Tournament Report File) Generator
 * Format-Spezifikation: https://www.swisschess.ch/media/attached/2021/09/TRF-16.pdf
 */

import { db } from "@/lib/db";
import { tournaments, tournamentParticipants, games, members } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireClubId } from "@/lib/actions/utils";

export interface TRFGenerationOptions {
  includeAllRounds?: boolean;
  currentRound?: number;
}

export async function generateTRFFromTournament(
  tournamentId: string,
  options: TRFGenerationOptions = {}
): Promise<string> {
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

  const participants = await db
    .select({
      id: tournamentParticipants.id,
      memberId: tournamentParticipants.memberId,
      score: tournamentParticipants.score,
      rank: tournamentParticipants.rank,
      member: {
        firstName: members.firstName,
        lastName: members.lastName,
        dwz: members.dwz,
        fideId: members.fideId,
      },
    })
    .from(tournamentParticipants)
    .innerJoin(members, eq(tournamentParticipants.memberId, members.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  const tournamentGames = await db
    .select({
      id: games.id,
      round: games.round,
      boardNumber: games.boardNumber,
      whiteId: games.whiteId,
      blackId: games.blackId,
      result: games.result,
    })
    .from(games)
    .where(eq(games.tournamentId, tournamentId))
    .orderBy(games.round, games.boardNumber);

  // Build player map
  const playerMap = new Map(participants.map((p, idx) => [p.memberId, { ...p, trfId: String(idx + 1).padStart(4, '0') }]));

  // Calculate max round
  const maxRound = tournamentGames.length > 0 
    ? Math.max(...tournamentGames.map(g => g.round || 0))
    : tournament.numberOfRounds || 1;

  const currentRound = options.currentRound || maxRound;

  let trf = "";

  // Tournament header
  trf += `012 ${tournament.name.padEnd(70, ' ')}\n`;
  if (tournament.location) {
    trf += `022 ${tournament.location.padEnd(40, ' ')}\n`;
  }
  trf += `032 GER\n`;
  trf += `042 ${tournament.startDate || new Date().toISOString().split('T')[0]}\n`;
  if (tournament.endDate) {
    trf += `052 ${tournament.endDate}\n`;
  }
  trf += `062 ${tournament.numberOfRounds || maxRound}\n`;
  trf += `072 ${currentRound}\n`;
  if (tournament.timeControl) {
    trf += `082 ${tournament.timeControl.padEnd(30, ' ')}\n`;
  }

  // Player entries
  participants.forEach((p, idx) => {
    const trfId = String(idx + 1).padStart(4, '0');
    const name = `${p.member.lastName}, ${p.member.firstName}`.padEnd(33, ' ');
    const rating = String(p.member.dwz || 0).padStart(4, '0');
    const score = String(parseFloat(p.score || "0").toFixed(1)).padStart(4, ' ');
    const rank = String(p.rank || idx + 1).padStart(4, ' ');

    let line = `001 ${trfId} ${name} GER    ${rating}           ${score} ${rank}`;

    // Add opponent/results for each round
    for (let round = 1; round <= currentRound; round++) {
      const game = tournamentGames.find(
        g => g.round === round && (g.whiteId === p.memberId || g.blackId === p.memberId)
      );

      if (game) {
        const isWhite = game.whiteId === p.memberId;
        const opponentId = isWhite ? game.blackId : game.whiteId;
        const opponentTrfId = (opponentId ? playerMap.get(opponentId)?.trfId : null) || "0000";
        
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
        line += ` ${opponentTrfId} ${resultCode.padEnd(3, ' ')}${color}`;
      } else {
        line += ` 0000     `;
      }
    }

    trf += line + "\n";
  });

  return trf;
}
