import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  pgEnum,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────

export const memberRoleEnum = pgEnum("member_role", [
  "admin",
  "vorstand",
  "sportwart",
  "jugendwart",
  "kassenwart",
  "trainer",
  "mitglied",
  "eltern",
]);

export const gameResultEnum = pgEnum("game_result", [
  "1-0",
  "0-1",
  "1/2-1/2",
  "+-",
  "-+",
  "+/+",
]);

export const tournamentTypeEnum = pgEnum("tournament_type", [
  "swiss",
  "round_robin",
  "rapid",
  "blitz",
  "team_match",
  "club_championship",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "inactive",
  "resigned",
  "honorary",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
]);

export const seasonTypeEnum = pgEnum("season_type", [
  "bundesliga",
  "bezirksliga",
  "kreisklasse",
  "club_internal",
]);

// ─── Members ──────────────────────────────────────────────────

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }),

    // Chess-specific
    dwz: integer("dwz"),
    elo: integer("elo"),
    dwzId: varchar("dwz_id", { length: 50 }),
    lichessUsername: varchar("lichess_username", { length: 100 }),
    chesscomUsername: varchar("chesscom_username", { length: 100 }),
    fideId: varchar("fide_id", { length: 20 }),

    // Membership
    status: membershipStatusEnum("status").default("active").notNull(),
    role: memberRoleEnum("role").default("mitglied").notNull(),
    joinedAt: date("joined_at").defaultNow(),

    // Family
    parentId: uuid("parent_id"),

    // Permissions (RBAC)
    permissions: jsonb("permissions").$type<string[]>().default([]),

    // SEPA
    sepaMandateReference: varchar("sepa_mandate_reference", { length: 35 }),
    sepaIban: varchar("sepa_iban", { length: 34 }), // encrypted at rest
    sepaBic: varchar("sepa_bic", { length: 11 }),

    // Meta
    notes: text("notes"),
    photoConsent: boolean("photo_consent").default(false),
    newsletterConsent: boolean("newsletter_consent").default(false),
    resultPublicationConsent: boolean("result_publication_consent").default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("members_email_idx").on(table.email),
    dwzIdIdx: index("members_dwz_id_idx").on(table.dwzId),
    parentIdIdx: index("members_parent_id_idx").on(table.parentId),
  }),
);

export const membersRelations = relations(members, ({ many, one }) => ({
  parent: one(members, {
    fields: [members.parentId],
    references: [members.id],
    relationName: "parent",
  }),
  children: many(members, { relationName: "parent" }),
  teamMemberships: many(teamMemberships),
  tournamentParticipations: many(tournamentParticipants),
  gamesAsWhite: many(games, {
    relationName: "white",
  }),
  gamesAsBlack: many(games, {
    relationName: "black",
  }),
  payments: many(payments),
}));

// ─── Seasons ──────────────────────────────────────────────────

export const seasons = pgTable("seasons", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g. "Saison 2025/2026"
  year: integer("year").notNull(),
  type: seasonTypeEnum("type").default("club_internal").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasonsRelations = relations(seasons, ({ many }) => ({
  teams: many(teams),
  tournaments: many(tournaments),
}));

// ─── Teams ────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // e.g. "1. Mannschaft"
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id),
  league: varchar("league", { length: 200 }), // e.g. "Bezirksliga Nord"
  captainId: uuid("captain_id").references(() => members.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  season: one(seasons, {
    fields: [teams.seasonId],
    references: [seasons.id],
  }),
  captain: one(members, {
    fields: [teams.captainId],
    references: [members.id],
  }),
  boardOrders: many(boardOrders),
  teamMemberships: many(teamMemberships),
}));

// ─── Board Orders (Brettreihenfolge) ──────────────────────────

export const boardOrders = pgTable(
  "board_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    boardNumber: integer("board_number").notNull(), // 1-8 typically
    isJoker: boolean("is_joker").default(false), // Aufruecker-Regel
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    teamBoardIdx: index("board_orders_team_season_idx").on(
      table.teamId,
      table.seasonId,
    ),
  }),
);

export const boardOrdersRelations = relations(boardOrders, ({ one }) => ({
  team: one(teams, {
    fields: [boardOrders.teamId],
    references: [teams.id],
  }),
  season: one(seasons, {
    fields: [boardOrders.seasonId],
    references: [seasons.id],
  }),
  member: one(members, {
    fields: [boardOrders.memberId],
    references: [members.id],
  }),
}));

// ─── Team Memberships (Mannschafts-Zugehoerigkeit) ───────────

export const teamMemberships = pgTable("team_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id),
  isRegular: boolean("is_regular").default(true), // Stammspieler vs. Ersatzspieler
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembershipsRelations = relations(
  teamMemberships,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamMemberships.teamId],
      references: [teams.id],
    }),
    member: one(members, {
      fields: [teamMemberships.memberId],
      references: [members.id],
    }),
    season: one(seasons, {
      fields: [teamMemberships.seasonId],
      references: [seasons.id],
    }),
  }),
);

// ─── Tournaments ──────────────────────────────────────────────

export const tournaments = pgTable("tournaments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  type: tournamentTypeEnum("type").notNull(),
  seasonId: uuid("season_id").references(() => seasons.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  location: varchar("location", { length: 300 }),
  description: text("description"),
  timeControl: varchar("time_control", { length: 50 }), // e.g. "15+10", "90+30"
  numberOfRounds: integer("number_of_rounds"),
  isCompleted: boolean("is_completed").default(false),
  // Swiss pairing data
  trfData: text("trf_data"), // TRF format for bbpPairings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  season: one(seasons, {
    fields: [tournaments.seasonId],
    references: [seasons.id],
  }),
  participants: many(tournamentParticipants),
  games: many(games),
}));

// ─── Tournament Participants ─────────────────────────────────

export const tournamentParticipants = pgTable("tournament_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  score: decimal("score", { precision: 4, scale: 1 }).default("0"),
  buchholz: decimal("buchholz", { precision: 6, scale: 2 }),
  sonnebornBerger: decimal("sonneborn_berger", { precision: 6, scale: 2 }),
  rank: integer("rank"),
  pairingNumber: integer("pairing_number"), // Swiss pairing number
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tournamentParticipantsRelations = relations(
  tournamentParticipants,
  ({ one }) => ({
    tournament: one(tournaments, {
      fields: [tournamentParticipants.tournamentId],
      references: [tournaments.id],
    }),
    member: one(members, {
      fields: [tournamentParticipants.memberId],
      references: [members.id],
    }),
  }),
);

// ─── Games (Partien) ──────────────────────────────────────────

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    round: integer("round").notNull(),
    boardNumber: integer("board_number"), // Brett-Nr. bei Mannschaftskämpfen
    whiteId: uuid("white_id")
      .notNull()
      .references(() => members.id),
    blackId: uuid("black_id")
      .notNull()
      .references(() => members.id),
    result: gameResultEnum("result"),
    pgn: text("pgn"), // Full PGN notation
    fen: varchar("fen", { length: 100 }), // Final position
    opening: varchar("opening", { length: 200 }), // ECO code + name
    ecoCode: varchar("eco_code", { length: 10 }),
    timeControl: varchar("time_control", { length: 50 }),
    playedAt: timestamp("played_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tournamentRoundIdx: index("games_tournament_round_idx").on(
      table.tournamentId,
      table.round,
    ),
    whiteIdx: index("games_white_idx").on(table.whiteId),
    blackIdx: index("games_black_idx").on(table.blackId),
  }),
);

export const gamesRelations = relations(games, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [games.tournamentId],
    references: [tournaments.id],
  }),
  white: one(members, {
    fields: [games.whiteId],
    references: [members.id],
    relationName: "white",
  }),
  black: one(members, {
    fields: [games.blackId],
    references: [members.id],
    relationName: "black",
  }),
}));

// ─── Events / Calendar ───────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull(), // training, match, tournament, meeting
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 300 }),
  isAllDay: boolean("is_all_day").default(false),
  createdBy: uuid("created_by").references(() => members.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Payments ─────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 300 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  sepaMandateReference: varchar("sepa_mandate_reference", { length: 35 }),
  year: integer("year").notNull(), // e.g. 2026 for "Beitrag 2026"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
}));

// ─── Audit Log (DSGVO) ───────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 50 }).notNull(), // create, update, delete, login
  entity: varchar("entity", { length: 50 }).notNull(), // member, payment, etc.
  entityId: uuid("entity_id"),
  changes: jsonb("changes"), // { field: { old, new } }
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Auth (for NextAuth/Drizzle adapter) ─────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  memberId: uuid("member_id").references(() => members.id), // Link to club member
  role: memberRoleEnum("role").default("mitglied").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", {
    length: 255,
  }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});