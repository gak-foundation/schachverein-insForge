import { Chess } from "chess.js";

export function parsePgn(pgn: string): {
  valid: boolean;
  fen: string | null;
  moves: number;
  result: string | null;
  headers: Record<string, string>;
  error?: string;
} {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history();
    const headers: Record<string, string> = {};

    const headerLines = pgn.split("\n").filter((l) => l.startsWith("["));
    for (const line of headerLines) {
      const match = line.match(/\[(\w+)\s+"(.*)"\]/);
      if (match) {
        headers[match[1]] = match[2];
      }
    }

    return {
      valid: true,
      fen: chess.fen(),
      moves: history.length,
      result: headers.Result ?? null,
      headers,
    };
  } catch (e) {
    return {
      valid: false,
      fen: null,
      moves: 0,
      result: null,
      headers: {},
      error: e instanceof Error ? e.message : "Ungueltiges PGN",
    };
  }
}

export function extractEcoFromPgn(pgn: string): string | null {
  const headerLines = pgn.split("\n").filter((l) => l.startsWith("["));
  for (const line of headerLines) {
    const match = line.match(/\[ECO\s+"(.*)"\]/);
    if (match) return match[1];
  }
  return null;
}

export function splitPgnGames(pgnText: string): string[] {
  const games: string[] = [];
  const lines = pgnText.split("\n");
  let currentGame: string[] = [];
  let inMovements = false;

  for (const line of lines) {
    if (line.startsWith("[") && !inMovements) {
      currentGame.push(line);
    } else if (line.trim() === "" && currentGame.length > 0) {
      if (inMovements) {
        games.push(currentGame.join("\n"));
        currentGame = [];
        inMovements = false;
      }
    } else {
      inMovements = true;
      currentGame.push(line);
    }
  }

  if (currentGame.length > 0) {
    games.push(currentGame.join("\n"));
  }

  return games;
}