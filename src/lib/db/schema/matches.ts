import type { MatchStatus, GameResult } from "./enums";

export const matches = "matches" as const;

export interface Match {
  id: string;
  seasonId: string;
  tournamentId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string | null;
  location: string | null;
  homeScore: string | null;
  awayScore: string | null;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewMatch {
  id?: string;
  seasonId: string;
  tournamentId?: string | null;
  homeTeamId: string;
  awayTeamId: string;
  matchDate?: string | null;
  location?: string | null;
  homeScore?: string | null;
  awayScore?: string | null;
  status?: MatchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const matchResults = "match_results" as const;

export interface MatchResult {
  id: string;
  matchId: string;
  gameId: string | null;
  boardNumber: number;
  homePlayerId: string | null;
  awayPlayerId: string | null;
  result: GameResult | null;
  createdAt: string;
}

export interface NewMatchResult {
  id?: string;
  matchId: string;
  gameId?: string | null;
  boardNumber: number;
  homePlayerId?: string | null;
  awayPlayerId?: string | null;
  result?: GameResult | null;
  createdAt?: string;
}
