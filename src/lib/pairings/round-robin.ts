/**
 * Round-Robin (Rundenturnier) Pairing Generator
 * Implements Berger Tables for even and odd number of participants
 */

export interface RoundRobinParticipant {
  id: string;
  name: string;
  rating?: number;
}

export interface Pairing {
  white: RoundRobinParticipant;
  black: RoundRobinParticipant;
  board?: number;
}

export interface Round {
  round: number;
  pairings: Pairing[];
  bye?: RoundRobinParticipant;
}

/**
 * Generate Berger Table for round-robin tournament
 * For odd number of players, one player gets a bye each round
 */
export function generateRoundRobinPairings(
  participants: RoundRobinParticipant[]
): Round[] {
  const n = participants.length;
  
  if (n < 2) {
    throw new Error("Mindestens 2 Teilnehmer erforderlich");
  }

  // For odd number of players, add a "bye" placeholder
  const hasBye = n % 2 !== 0;
  const players = [...participants];
  
  if (hasBye) {
    players.push({ id: "bye", name: "Freilos" });
  }

  const totalPlayers = players.length;
  const numRounds = totalPlayers - 1;
  const rounds: Round[] = [];

  // Berger table algorithm
  // Fixed player at position 0, others rotate
  for (let round = 0; round < numRounds; round++) {
    const roundPairings: Pairing[] = [];

    // Create pairings for this round
    for (let i = 0; i < totalPlayers / 2; i++) {
      const white = players[i];
      const black = players[totalPlayers - 1 - i];

      // Skip bye pairings
      if (white.id === "bye") {
        continue;
      }
      if (black.id === "bye") {
        continue;
      }

      // Alternate colors each round
      if (round % 2 === 0) {
        roundPairings.push({ white, black, board: i + 1 });
      } else {
        roundPairings.push({ white: black, black: white, board: i + 1 });
      }
    }

    rounds.push({
      round: round + 1,
      pairings: roundPairings,
    });

    // Rotate players (keep first player fixed)
    const last = players[players.length - 1];
    for (let i = players.length - 1; i > 1; i--) {
      players[i] = players[i - 1];
    }
    players[1] = last;
  }

  return rounds;
}

/**
 * Generate cross table (Kreuztabelle) for completed round-robin tournament
 */
export interface CrossTableEntry {
  participant: RoundRobinParticipant;
  results: (string | null)[]; // Results against each opponent
  totalPoints: number;
  rank: number;
}

export function generateCrossTable(
  participants: RoundRobinParticipant[],
  games: {
    whiteId: string;
    blackId: string;
    result: "1-0" | "0-1" | "1/2-1/2" | null;
  }[]
): CrossTableEntry[] {
  const table: CrossTableEntry[] = participants.map((p) => ({
    participant: p,
    results: new Array(participants.length).fill(null),
    totalPoints: 0,
    rank: 0,
  }));

  // Fill in results
  games.forEach((game) => {
    const whiteIdx = participants.findIndex((p) => p.id === game.whiteId);
    const blackIdx = participants.findIndex((p) => p.id === game.blackId);

    if (whiteIdx === -1 || blackIdx === -1) return;

    let whiteResult: string;
    let blackResult: string;
    let whitePoints = 0;
    let blackPoints = 0;

    switch (game.result) {
      case "1-0":
        whiteResult = "1";
        blackResult = "0";
        whitePoints = 1;
        break;
      case "0-1":
        whiteResult = "0";
        blackResult = "1";
        blackPoints = 1;
        break;
      case "1/2-1/2":
        whiteResult = "½";
        blackResult = "½";
        whitePoints = 0.5;
        blackPoints = 0.5;
        break;
      default:
        whiteResult = "*";
        blackResult = "*";
    }

    table[whiteIdx].results[blackIdx] = whiteResult;
    table[blackIdx].results[whiteIdx] = blackResult;
    table[whiteIdx].totalPoints += whitePoints;
    table[blackIdx].totalPoints += blackPoints;
  });

  // Sort by points (descending) and assign ranks
  table.sort((a, b) => b.totalPoints - a.totalPoints);
  
  let currentRank = 1;
  let previousPoints = -1;
  
  table.forEach((entry, index) => {
    if (entry.totalPoints !== previousPoints) {
      currentRank = index + 1;
    }
    entry.rank = currentRank;
    previousPoints = entry.totalPoints;
  });

  return table;
}

/**
 * Calculate standings from games
 */
export interface StandingsEntry {
  participant: RoundRobinParticipant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  buchholz?: number;
  sonnebornBerger?: number;
  rank: number;
}

export function calculateStandings(
  participants: RoundRobinParticipant[],
  games: {
    whiteId: string;
    blackId: string;
    result: "1-0" | "0-1" | "1/2-1/2" | null;
  }[]
): StandingsEntry[] {
  const standings = new Map<string, StandingsEntry>();

  participants.forEach((p) => {
    standings.set(p.id, {
      participant: p,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      rank: 0,
    });
  });

  games.forEach((game) => {
    if (!game.result) return;

    const white = standings.get(game.whiteId);
    const black = standings.get(game.blackId);

    if (!white || !black) return;

    white.played++;
    black.played++;

    switch (game.result) {
      case "1-0":
        white.wins++;
        white.points += 1;
        black.losses++;
        break;
      case "0-1":
        black.wins++;
        black.points += 1;
        white.losses++;
        break;
      case "1/2-1/2":
        white.draws++;
        black.draws++;
        white.points += 0.5;
        black.points += 0.5;
        break;
    }
  });

  const sorted = Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    // Tie-break: wins
    if (b.wins !== a.wins) return b.wins - a.wins;
    return 0;
  });

  // Assign ranks
  let currentRank = 1;
  let previousPoints = -1;
  
  sorted.forEach((entry, index) => {
    if (entry.points !== previousPoints) {
      currentRank = index + 1;
    }
    entry.rank = currentRank;
    previousPoints = entry.points;
  });

  return sorted;
}
