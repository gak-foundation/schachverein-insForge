// Core domain types for the Schachverein app

// ─── Member ────────────────────────────────────────────────────

export type MemberRole =
  | "admin"
  | "vorstand"
  | "sportwart"
  | "jugendwart"
  | "kassenwart"
  | "trainer"
  | "mitglied"
  | "eltern";

export type MembershipStatus = "active" | "inactive" | "resigned" | "honorary";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  dwz?: number;
  elo?: number;
  dwzId?: string;
  lichessUsername?: string;
  chesscomUsername?: string;
  fideId?: string;
  status: MembershipStatus;
  role: MemberRole;
  joinedAt?: string;
  parentId?: string;
  permissions: string[];
  sepaMandateReference?: string;
  photoConsent: boolean;
  newsletterConsent: boolean;
  resultPublicationConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Chess ──────────────────────────────────────────────────────

export type GameResult = "1-0" | "0-1" | "1/2-1/2" | "+-" | "-+" | "+/+";

export type TournamentType =
  | "swiss"
  | "round_robin"
  | "rapid"
  | "blitz"
  | "team_match"
  | "club_championship";

export interface Game {
  id: string;
  tournamentId: string;
  round: number;
  boardNumber?: number;
  whiteId: string;
  blackId: string;
  result?: GameResult;
  lichessUrl?: string;
  fen?: string;
  opening?: string;
  ecoCode?: string;
  timeControl?: string;
  playedAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  seasonId?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  timeControl?: string;
  numberOfRounds?: number;
  isCompleted: boolean;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  memberId: string;
  score: number;
  buchholz?: number;
  sonnebornBerger?: number;
  rank?: number;
  pairingNumber?: number;
}

// ─── Teams ──────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  seasonId: string;
  league?: string;
  captainId?: string;
}

export interface BoardOrder {
  id: string;
  teamId: string;
  seasonId: string;
  memberId: string;
  boardNumber: number;
  isJoker: boolean;
}

// ─── Finance ────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  status: PaymentStatus;
  dueDate?: string;
  paidAt?: string;
  sepaMandateReference?: string;
  year: number;
}

// ─── Calendar ────────────────────────────────────────────────────

export type EventType = "training" | "match" | "tournament" | "meeting";

export interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay: boolean;
  createdBy?: string;
}