import {
  tournaments,
  members,
  clubMemberships,
  tournamentParticipants,
  payments,
  teams,
  events,
} from "@/lib/db/schema";

export type MockTournament = typeof tournaments.$inferSelect;
export type MockMember = typeof members.$inferSelect;
export type MockClubMembership = typeof clubMemberships.$inferSelect;
export type MockTournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type MockPayment = typeof payments.$inferSelect;
export type MockTeam = typeof teams.$inferSelect;
export type MockEvent = typeof events.$inferSelect;

export function createMockTournament(overrides?: Partial<MockTournament>): MockTournament {
  return {
    id: "tournament-1",
    clubId: "club-1",
    name: "Test Turnier",
    type: "swiss",
    seasonId: null,
    startDate: "2024-01-01",
    endDate: null,
    location: null,
    timeControl: null,
    numberOfRounds: null,
    description: null,
    isCompleted: false,
    trfData: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockMember(overrides?: Partial<MockMember>): MockMember {
  return {
    id: "member-1",
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    phone: null,
    dateOfBirth: null,
    gender: null,
    dwz: null,
    elo: null,
    dwzId: null,
    lichessUsername: null,
    chesscomUsername: null,
    fideId: null,
    status: "active",
    role: "mitglied",
    joinedAt: null,
    parentId: null,
    permissions: [],
    sepaMandateReference: null,
    sepaIban: null,
    sepaBic: null,
    mandateSignedAt: null,
    contributionRateId: null,
    notes: null,
    photoConsent: false,
    newsletterConsent: false,
    resultPublicationConsent: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockClubMembership(overrides?: Partial<MockClubMembership>): MockClubMembership {
  return {
    id: "membership-1",
    clubId: "club-1",
    memberId: "member-1",
    role: "mitglied",
    joinedAt: new Date("2024-01-01"),
    isPrimary: true,
    status: "active",
    invitedBy: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockTournamentParticipant(
  overrides?: Partial<MockTournamentParticipant>,
): MockTournamentParticipant {
  return {
    id: "participant-1",
    tournamentId: "tournament-1",
    memberId: "member-1",
    score: "0",
    buchholz: null,
    sonnebornBerger: null,
    rank: null,
    pairingNumber: null,
    createdAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockPayment(overrides?: Partial<MockPayment>): MockPayment {
  return {
    id: "payment-1",
    clubId: "club-1",
    memberId: "member-1",
    amount: "100.00",
    description: "Mitgliedsbeitrag",
    status: "pending",
    dueDate: null,
    paidAt: null,
    sepaMandateReference: null,
    year: 2024,
    dunningLevel: 0,
    lastDunningAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockTeam(overrides?: Partial<MockTeam>): MockTeam {
  return {
    id: "team-1",
    clubId: "club-1",
    name: "1. Mannschaft",
    seasonId: "season-1",
    league: null,
    captainId: null,
    createdAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}

export function createMockEvent(overrides?: Partial<MockEvent>): MockEvent {
  return {
    id: "event-1",
    clubId: "club-1",
    title: "Vereinsabend",
    description: null,
    eventType: "club_evening",
    startDate: new Date("2024-01-15T19:00:00"),
    endDate: null,
    location: null,
    isAllDay: false,
    recurrenceRule: null,
    createdBy: null,
    createdAt: new Date("2024-01-01"),
    deletionRequestedAt: null,
    heritageGameId: null,
    ...overrides,
  } as any;
}
