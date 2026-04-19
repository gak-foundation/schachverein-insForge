import { Chess } from "chess.js";

export function parsePgn(pgn: string) {
  const gameTexts = splitPgnGames(pgn);
  const games: {
    white: string;
    black: string;
    result: string;
    date: string | null;
    event: string | null;
    round: string | null;
    pgn: string;
    moves: number;
  }[] = [];

  for (const text of gameTexts) {
    try {
      const chess = new Chess();
      chess.loadPgn(text);
      const history = chess.history();
      
      const headers: Record<string, string> = {};
      const headerLines = text.split("\n").filter((l) => l.startsWith("["));
      for (const line of headerLines) {
        const match = line.match(/\[(\w+)\s+"(.*)"\]/);
        if (match) {
          headers[match[1]] = match[2];
        }
      }

      games.push({
        white: headers.White || "Unbekannt",
        black: headers.Black || "Unbekannt",
        result: headers.Result || "*",
        date: headers.Date || null,
        event: headers.Event || null,
        round: headers.Round || null,
        pgn: text,
        moves: history.length,
      });
    } catch (e) {
      console.error("Error parsing PGN game:", e);
    }
  }

  return games;
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