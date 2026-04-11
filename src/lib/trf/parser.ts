/**
 * TRF (Tournament Report File) Parser
 * Format-Spezifikation: https://www.swisschess.ch/media/attached/2021/09/TRF-16.pdf
 */

export interface TRFTournament {
  name: string;
  city?: string;
  federation?: string;
  startDate?: string;
  endDate?: string;
  numberOfRounds: number;
  currentRound?: number;
  timeControl?: string;
  chiefArbiter?: string;
  deputyArbiter?: string;
  rateOfPlay?: string;
}

export interface TRFPlayer {
  id: string;
  name: string;
  federation?: string;
  title?: string;
  rating?: number;
  birthDate?: string;
  gender?: string;
  club?: string;
  points: number;
  rank?: number;
  opponents: (string | null)[];
  results: (string | null)[];
  colors: (string | null)[];
}

export interface TRFGame {
  round: number;
  whiteId: string;
  blackId: string;
  result: string | null;
}

export interface ParsedTRF {
  tournament: TRFTournament;
  players: TRFPlayer[];
  games: TRFGame[];
}

// TRF Field codes
const FIELD_CODES: Record<string, string> = {
  "012": "name",
  "022": "city",
  "032": "federation",
  "042": "startDate",
  "052": "endDate",
  "062": "numberOfRounds",
  "072": "currentRound",
  "082": "timeControl",
  "092": "chiefArbiter",
  "102": "deputyArbiter",
  "132": "rateOfPlay",
};

// Player field positions (fixed width format)
const PLAYER_FIELDS = {
  id: { start: 4, end: 8 },
  name: { start: 14, end: 47 },
  federation: { start: 48, end: 50 },
  title: { start: 52, end: 55 },
  rating: { start: 57, end: 61 },
  birthDate: { start: 63, end: 72 },
  gender: { start: 73, end: 73 },
  club: { start: 75, end: 88 },
  points: { start: 89, end: 93 },
  rank: { start: 95, end: 98 },
};

export function parseTRF(content: string): ParsedTRF {
  const lines = content.split("\n").map((line) => line.replace("\r", ""));

  const tournament: Partial<TRFTournament> = {
    numberOfRounds: 0,
  };
  const players: TRFPlayer[] = [];

  for (const line of lines) {
    if (line.length < 3) continue;

    const code = line.substring(0, 3);
    const value = line.substring(3).trim();

    // Tournament fields
    if (code in FIELD_CODES && FIELD_CODES[code]) {
      const fieldName = FIELD_CODES[code];
      if (fieldName === "numberOfRounds") {
        tournament.numberOfRounds = parseInt(value, 10) || 0;
      } else {
        (tournament as Record<string, string | number | undefined>)[fieldName] = value;
      }
      continue;
    }

    // Player entry (001)
    if (code === "001" && line.length >= 94) {
      const player = parsePlayerLine(line);
      if (player) {
        players.push(player);
      }
    }
  }

  // Extract games from player pairings
  const games = extractGames(players);

  return {
    tournament: tournament as TRFTournament,
    players,
    games,
  };
}

function parsePlayerLine(line: string): TRFPlayer | null {
  try {
    const id = line.substring(PLAYER_FIELDS.id.start, PLAYER_FIELDS.id.end).trim();
    const name = line.substring(PLAYER_FIELDS.name.start, PLAYER_FIELDS.name.end).trim();

    if (!id || !name) return null;

    const ratingStr = line.substring(PLAYER_FIELDS.rating.start, PLAYER_FIELDS.rating.end).trim();
    const pointsStr = line.substring(PLAYER_FIELDS.points.start, PLAYER_FIELDS.points.end).trim();
    const rankStr = line.substring(PLAYER_FIELDS.rank.start, PLAYER_FIELDS.rank.end).trim();

    // Parse opponents and results (fields 99+)
    const opponents: (string | null)[] = [];
    const results: (string | null)[] = [];
    const colors: (string | null)[] = [];

    let pos = 99;
    while (pos + 9 <= line.length) {
      const oppStr = line.substring(pos, pos + 4).trim();
      const resStr = line.substring(pos + 4, pos + 8).trim();
      const colStr = line.substring(pos + 8, pos + 9).trim();

      if (oppStr) {
        opponents.push(oppStr);
        results.push(resStr || null);
        colors.push(colStr || null);
      } else {
        opponents.push(null);
        results.push(null);
        colors.push(null);
      }

      pos += 10;
    }

    return {
      id,
      name,
      federation: line.substring(PLAYER_FIELDS.federation.start, PLAYER_FIELDS.federation.end).trim() || undefined,
      title: line.substring(PLAYER_FIELDS.title.start, PLAYER_FIELDS.title.end).trim() || undefined,
      rating: ratingStr ? parseInt(ratingStr, 10) : undefined,
      birthDate: line.substring(PLAYER_FIELDS.birthDate.start, PLAYER_FIELDS.birthDate.end).trim() || undefined,
      gender: line.substring(PLAYER_FIELDS.gender.start, PLAYER_FIELDS.gender.end).trim() || undefined,
      club: line.substring(PLAYER_FIELDS.club.start, PLAYER_FIELDS.club.end).trim() || undefined,
      points: pointsStr ? parseFloat(pointsStr) : 0,
      rank: rankStr ? parseInt(rankStr, 10) : undefined,
      opponents,
      results,
      colors,
    };
  } catch {
    return null;
  }
}

function extractGames(players: TRFPlayer[]): TRFGame[] {
  const games: TRFGame[] = [];
  const processedPairs = new Set<string>();

  for (const player of players) {
    for (let roundIndex = 0; roundIndex < player.opponents.length; roundIndex++) {
      const opponentId = player.opponents[roundIndex];
      const result = player.results[roundIndex];
      const color = player.colors[roundIndex];

      if (!opponentId) continue;

      // Create unique key for this pairing
      const pairKey = [player.id, opponentId].sort().join("-");
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      // Determine white/black based on color indicator
      let whiteId = player.id;
      let blackId = opponentId;

      // w = white, b = black, otherwise use numeric comparison
      if (color === "b") {
        whiteId = opponentId;
        blackId = player.id;
      }

      games.push({
        round: roundIndex + 1,
        whiteId,
        blackId,
        result: normalizeResult(result),
      });
    }
  }

  return games;
}

function normalizeResult(result: string | null): string | null {
  if (!result) return null;

  const normalized = result.trim().toLowerCase();

  switch (normalized) {
    case "1":
    case "1-0":
    case "1.0":
      return "1-0";
    case "0":
    case "0-1":
    case "0.0":
      return "0-1";
    case "=":
    case "1/2":
    case "1/2-1/2":
    case "0.5":
      return "1/2-1/2";
    case "+":
      return "+-"; // Forfeit win
    case "-":
      return "-+"; // Forfeit loss
    default:
      return null;
  }
}

export function validateTRF(parsed: ParsedTRF): string[] {
  const errors: string[] = [];

  if (!parsed.tournament.name) {
    errors.push("Turniername fehlt (Feld 012)");
  }

  if (parsed.players.length === 0) {
    errors.push("Keine Spieler gefunden (Feld 001)");
  }

  if (parsed.tournament.numberOfRounds <= 0) {
    errors.push("Ungültige Anzahl Runden (Feld 062)");
  }

  // Check for duplicate player IDs
  const seenIds = new Set<string>();
  for (const player of parsed.players) {
    if (seenIds.has(player.id)) {
      errors.push(`Doppelte Spieler-ID: ${player.id}`);
    }
    seenIds.add(player.id);
  }

  return errors;
}
