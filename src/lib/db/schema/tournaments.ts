import type { TournamentType, GameResult } from "./enums";

export const tournaments = "tournaments" as const;

export interface Tournament {
  id: string;
  clubId: string;
  name: string;
  type: TournamentType;
  seasonId: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  description: string | null;
  timeControl: string | null;
  numberOfRounds: number | null;
  isCompleted: boolean | null;
  trfData: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewTournament {
  id?: string;
  clubId: string;
  name: string;
  type: TournamentType;
  seasonId?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  timeControl?: string | null;
  numberOfRounds?: number | null;
  isCompleted?: boolean | null;
  trfData?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const tournamentParticipants = "tournament_participants" as const;

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  memberId: string;
  score: string | null;
  buchholz: string | null;
  sonnebornBerger: string | null;
  rank: number | null;
  pairingNumber: number | null;
  createdAt: string;
}

export interface NewTournamentParticipant {
  id?: string;
  tournamentId: string;
  memberId: string;
  score?: string | null;
  buchholz?: string | null;
  sonnebornBerger?: string | null;
  rank?: number | null;
  pairingNumber?: number | null;
  createdAt?: string;
}

export const games = "games" as const;

export interface Game {
  id: string;
  clubId: string;
  tournamentId: string | null;
  round: number | null;
  boardNumber: number | null;
  whiteId: string | null;
  blackId: string | null;
  whiteName: string | null;
  blackName: string | null;
  result: GameResult | null;
  lichessUrl: string | null;
  fen: string | null;
  opening: string | null;
  ecoCode: string | null;
  event: string | null;
  date: string | null;
  timeControl: string | null;
  playedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewGame {
  id?: string;
  clubId: string;
  tournamentId?: string | null;
  round?: number | null;
  boardNumber?: number | null;
  whiteId?: string | null;
  blackId?: string | null;
  whiteName?: string | null;
  blackName?: string | null;
  result?: GameResult | null;
  lichessUrl?: string | null;
  fen?: string | null;
  opening?: string | null;
  ecoCode?: string | null;
  event?: string | null;
  date?: string | null;
  timeControl?: string | null;
  playedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
