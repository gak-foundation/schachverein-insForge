/**
 * Demo-Daten für den Schachverein "SG Beispielstadt"
 * Diese Daten werden verwendet, um potenziellen Kunden die Plattform zu demonstrieren.
 * Alle Daten sind fiktiv und dienen nur zu Demonstrationszwecken.
 */

// Demo-Vereinsdaten
export const demoClub = {
  id: "demo-club-001",
  name: "SG Beispielstadt",
  slug: "demo",
  logoUrl: null,
  website: "https://beispielstadt-schach.de",
  address: {
    street: "Schachstraße 42",
    zipCode: "12345",
    city: "Beispielstadt",
    country: "Deutschland",
  },
  contactEmail: "vorstand@beispielstadt-schach.de",
  plan: "pro" as const,
  isActive: true,
  createdAt: new Date("2010-09-01"),
};

// Demo-Mitglieder
export const demoMembers = [
  {
    id: "demo-member-001",
    firstName: "Klaus",
    lastName: "Müller",
    email: "klaus.mueller@example.de",
    phone: "+49 123 456789",
    dwz: 1850,
    elo: 1920,
    role: "admin",
    status: "active",
    joinedAt: new Date("2010-09-01"),
    sepaIban: "DE89370400440532013000",
    sepaBic: "COBADEFFXXX",
  },
  {
    id: "demo-member-002",
    firstName: "Sabine",
    lastName: "Schmidt",
    email: "sabine.schmidt@example.de",
    phone: "+49 123 456790",
    dwz: 2100,
    elo: 2150,
    role: "vorstand",
    status: "active",
    joinedAt: new Date("2012-03-15"),
  },
  {
    id: "demo-member-003",
    firstName: "Thomas",
    lastName: "Weber",
    email: "thomas.weber@example.de",
    dwz: 1650,
    elo: 1700,
    role: "kassenwart",
    status: "active",
    joinedAt: new Date("2015-06-20"),
  },
  {
    id: "demo-member-004",
    firstName: "Anna",
    lastName: "Schneider",
    email: "anna.schneider@example.de",
    dwz: 1950,
    elo: 2000,
    role: "mannschaftsfuehrer",
    status: "active",
    joinedAt: new Date("2016-09-01"),
  },
  {
    id: "demo-member-005",
    firstName: "Michael",
    lastName: "Fischer",
    email: "michael.fischer@example.de",
    dwz: 1750,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2018-01-10"),
  },
  {
    id: "demo-member-006",
    firstName: "Laura",
    lastName: "Hoffmann",
    email: "laura.hoffmann@example.de",
    dwz: 1450,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2019-09-01"),
  },
  {
    id: "demo-member-007",
    firstName: "Stefan",
    lastName: "Bauer",
    email: "stefan.bauer@example.de",
    dwz: 1900,
    elo: 1950,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2020-03-15"),
  },
  {
    id: "demo-member-008",
    firstName: "Julia",
    lastName: "Koch",
    email: "julia.koch@example.de",
    dwz: 1550,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2021-09-01"),
  },
  {
    id: "demo-member-009",
    firstName: "Andreas",
    lastName: "Richter",
    email: "andreas.richter@example.de",
    dwz: 1800,
    elo: 1850,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2022-01-15"),
  },
  {
    id: "demo-member-010",
    firstName: "Maria",
    lastName: "Klein",
    email: "maria.klein@example.de",
    dwz: 1400,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2023-09-01"),
  },
  {
    id: "demo-member-011",
    firstName: "Peter",
    lastName: "Wolf",
    email: "peter.wolf@example.de",
    dwz: 2050,
    elo: 2100,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2020-09-01"),
  },
  {
    id: "demo-member-012",
    firstName: "Christina",
    lastName: "Neumann",
    email: "christina.neumann@example.de",
    dwz: 1500,
    role: "mitglied",
    status: "active",
    joinedAt: new Date("2022-09-01"),
  },
];

// Demo-Saison
export const demoSeason = {
  id: "demo-season-001",
  name: "Saison 2025/26",
  year: 2025,
  type: "club_internal",
  startDate: new Date("2025-09-01"),
  endDate: new Date("2026-08-31"),
};

// Demo-Mannschaften
export const demoTeams = [
  {
    id: "demo-team-001",
    name: "1. Mannschaft",
    league: "Oberliga",
    captainId: "demo-member-002",
    captainName: "Sabine Schmidt",
  },
  {
    id: "demo-team-002",
    name: "2. Mannschaft",
    league: "Landesliga",
    captainId: "demo-member-004",
    captainName: "Anna Schneider",
  },
  {
    id: "demo-team-003",
    name: "3. Mannschaft",
    league: "Bezirksliga",
    captainId: "demo-member-007",
    captainName: "Stefan Bauer",
  },
  {
    id: "demo-team-004",
    name: "Jugendmannschaft",
    league: "Jugendliga",
    captainId: "demo-member-005",
    captainName: "Michael Fischer",
  },
];

// Demo-Turniere
export const demoTournaments = [
  {
    id: "demo-tournament-001",
    name: "Vereinsmeisterschaft 2025",
    type: "swiss",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2026-03-31"),
    location: "Vereinsheim SG Beispielstadt",
    isCompleted: false,
    participants: 24,
  },
  {
    id: "demo-tournament-002",
    name: "Schnellschach-Open",
    type: "rapid",
    startDate: new Date("2025-11-15"),
    endDate: new Date("2025-11-15"),
    location: "Stadthalle Beispielstadt",
    isCompleted: false,
    participants: 48,
  },
  {
    id: "demo-tournament-003",
    name: "Blitzmeisterschaft",
    type: "blitz",
    startDate: new Date("2025-09-20"),
    endDate: new Date("2025-09-20"),
    location: "Vereinsheim SG Beispielstadt",
    isCompleted: true,
    participants: 32,
  },
  {
    id: "demo-tournament-004",
    name: "Jugendturnier",
    type: "swiss",
    startDate: new Date("2026-01-25"),
    endDate: new Date("2026-01-25"),
    location: "Vereinsheim SG Beispielstadt",
    isCompleted: false,
    participants: 16,
  },
];

// Demo-Events/Termine
export const demoEvents = [
  {
    id: "demo-event-001",
    title: "Training Dienstag",
    eventType: "training",
    startDate: new Date("2026-04-22T19:00:00"),
    endDate: new Date("2026-04-22T22:00:00"),
    location: "Vereinsheim SG Beispielstadt",
    isAllDay: false,
  },
  {
    id: "demo-event-002",
    title: "Training Donnerstag",
    eventType: "training",
    startDate: new Date("2026-04-24T19:00:00"),
    endDate: new Date("2026-04-24T22:00:00"),
    location: "Vereinsheim SG Beispielstadt",
    isAllDay: false,
  },
  {
    id: "demo-event-003",
    title: "Mitgliederversammlung",
    eventType: "meeting",
    startDate: new Date("2026-05-15T19:00:00"),
    endDate: new Date("2026-05-15T21:00:00"),
    location: "Vereinsheim SG Beispielstadt",
    isAllDay: false,
  },
  {
    id: "demo-event-004",
    title: "Sommerfest",
    eventType: "event",
    startDate: new Date("2026-06-20T14:00:00"),
    endDate: new Date("2026-06-20T22:00:00"),
    location: "Biergarten am Stadtsee",
    isAllDay: false,
  },
  {
    id: "demo-event-005",
    title: "Blitzturnier",
    eventType: "tournament",
    startDate: new Date("2026-07-05T14:00:00"),
    endDate: new Date("2026-07-05T18:00:00"),
    location: "Vereinsheim SG Beispielstadt",
    isAllDay: false,
  },
];

// Demo-Mannschaftskämpfe
export const demoMatches = [
  {
    id: "demo-match-001",
    homeTeamId: "demo-team-001",
    awayTeamId: "opponent-001",
    homeTeamName: "SG Beispielstadt 1",
    awayTeamName: "SC Beispieldorf",
    matchDate: new Date("2026-04-25"),
    location: "Vereinsheim SG Beispielstadt",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
  },
  {
    id: "demo-match-002",
    homeTeamId: "opponent-002",
    awayTeamId: "demo-team-001",
    homeTeamName: "SV Musterstadt",
    awayTeamName: "SG Beispielstadt 1",
    matchDate: new Date("2026-05-09"),
    location: "Schachzentrums Musterstadt",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
  },
  {
    id: "demo-match-003",
    homeTeamId: "demo-team-002",
    awayTeamId: "opponent-003",
    homeTeamName: "SG Beispielstadt 2",
    awayTeamName: "SC Beispielberg",
    matchDate: new Date("2026-04-26"),
    location: "Vereinsheim SG Beispielstadt",
    homeScore: 4.5,
    awayScore: 3.5,
    status: "completed",
  },
];

// Dashboard-Statistiken
export const demoDashboardStats = {
  memberCount: demoMembers.length,
  teamCount: demoTeams.length,
  activeTournaments: demoTournaments.filter(t => !t.isCompleted).length,
  pendingPayments: 3,
  avgDwz: Math.round(demoMembers.reduce((sum, m) => sum + (m.dwz || 0), 0) / demoMembers.filter(m => m.dwz).length),
  gamesThisMonth: 24,
  upcomingMatches: demoMatches.filter(m => m.status === "scheduled" && new Date(m.matchDate) >= new Date()),
  upcomingEvents: demoEvents.filter(e => new Date(e.startDate) >= new Date()).slice(0, 5),
};

// Finanz-Demo-Daten
export const demoFinanceData = {
  currentBalance: 12450.50,
  monthlyIncome: 850.00,
  monthlyExpenses: 320.00,
  pendingPayments: [
    { memberId: "demo-member-005", amount: 120.00, dueDate: "2026-04-30", description: "Jahresbeitrag 2025/26" },
    { memberId: "demo-member-008", amount: 120.00, dueDate: "2026-04-30", description: "Jahresbeitrag 2025/26" },
    { memberId: "demo-member-012", amount: 80.00, dueDate: "2026-04-30", description: "Jahresbeitrag 2025/26 (ermäßigt)" },
  ],
};

// Beitragssätze
export const demoContributionRates = [
  { id: "demo-rate-001", name: "Vollmitglied", amount: 120, validFrom: new Date("2024-09-01") },
  { id: "demo-rate-002", name: "Ermäßigt", amount: 80, validFrom: new Date("2024-09-01") },
  { id: "demo-rate-003", name: "Jugend", amount: 60, validFrom: new Date("2024-09-01") },
  { id: "demo-rate-004", name: "Passive Mitgliedschaft", amount: 30, validFrom: new Date("2024-09-01") },
];

// Demo-Benutzer für das Dashboard
export const demoUser = {
  id: "demo-user-001",
  name: "Klaus Müller",
  email: "klaus.mueller@example.de",
  role: "admin",
  permissions: ["members_write", "tournaments_write", "teams_write", "finance_write", "events_write"],
  memberId: "demo-member-001",
  isSuperAdmin: false,
};

// Feature-Flags für den Demo-Verein
export const demoFeatures = {
  tournaments: true,
  teams: true,
  payments: true,
  documents: true,
  apiAccess: true,
  customDomain: false,
  prioritySupport: true,
};
