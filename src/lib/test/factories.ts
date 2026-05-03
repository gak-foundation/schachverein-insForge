import type {
  Tournament,
  Member,
  ClubMembership,
  TournamentParticipant,
  Payment,
  Team,
  Event,
} from "@/lib/db/schema";

export type MockTournament = Tournament;
export type MockMember = Member;
export type MockClubMembership = ClubMembership;
export type MockTournamentParticipant = TournamentParticipant;
export type MockPayment = Payment;
export type MockTeam = Team;
export type MockEvent = Event;

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
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } as any;
}

export function createMockMember(overrides?: Partial<MockMember>): MockMember {
  return {
    id: "member-1",
    clubId: "club-1",
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
    lichessId: null,
    isLichessVerified: null,
    lichessAccessToken: null,
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
    mandateUrl: null,
    contributionRateId: null,
    notes: null,
    medicalNotes: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    photoConsent: null,
    newsletterConsent: null,
    resultPublicationConsent: null,
    deletionRequestedAt: null,
    anonymizedAt: null,
    heritageGameId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } as any;
}

export function createMockClubMembership(overrides?: Partial<MockClubMembership>): MockClubMembership {
  return {
    id: "membership-1",
    clubId: "club-1",
    memberId: "member-1",
    role: "mitglied",
    joinedAt: "2024-01-01T00:00:00.000Z",
    isPrimary: true,
    status: "active",
    invitedBy: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
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
    createdAt: "2024-01-01T00:00:00.000Z",
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
    invoiceNumber: null,
    year: 2024,
    dunningLevel: 0,
    lastDunningAt: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
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
    createdAt: "2024-01-01T00:00:00.000Z",
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
    startDate: "2024-01-15T19:00:00.000Z",
    endDate: null,
    location: null,
    isAllDay: false,
    recurrenceRule: null,
    createdBy: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } as any;
}
