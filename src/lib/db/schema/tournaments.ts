import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  integer,
  boolean,
  text,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tournamentTypeEnum, gameResultEnum } from "./enums";
import { clubs } from "./clubs";
import { members } from "./members";
import { seasons } from "./seasons";

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 300 }).notNull(),
    type: tournamentTypeEnum("type").notNull(),
    seasonId: uuid("season_id").references(() => seasons.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    location: varchar("location", { length: 300 }),
    description: text("description"),
    timeControl: varchar("time_control", { length: 50 }),
    numberOfRounds: integer("number_of_rounds"),
    isCompleted: boolean("is_completed").default(false),
    trfData: text("trf_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("tournaments_club_idx").on(table.clubId),
  }),
);

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
  pairingNumber: integer("pairing_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    tournamentId: uuid("tournament_id").references(() => tournaments.id),
    round: integer("round"),
    boardNumber: integer("board_number"),
    whiteId: uuid("white_id").references(() => members.id),
    blackId: uuid("black_id").references(() => members.id),
    whiteName: varchar("white_name", { length: 200 }),
    blackName: varchar("black_name", { length: 200 }),
    result: gameResultEnum("result"),
    lichessUrl: text("lichess_url"),
    fen: varchar("fen", { length: 100 }),
    opening: varchar("opening", { length: 200 }),
    ecoCode: varchar("eco_code", { length: 10 }),
    event: varchar("event", { length: 300 }),
    date: varchar("date", { length: 20 }),
    timeControl: varchar("time_control", { length: 50 }),
    playedAt: timestamp("played_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("games_club_idx").on(table.clubId),
    tournamentRoundIdx: index("games_tournament_round_idx").on(
      table.tournamentId,
      table.round,
    ),
    whiteIdx: index("games_white_idx").on(table.whiteId),
    blackIdx: index("games_black_idx").on(table.blackId),
  }),
);

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  club: one(clubs, {
    fields: [tournaments.clubId],
    references: [clubs.id],
  }),
  season: one(seasons, {
    fields: [tournaments.seasonId],
    references: [seasons.id],
  }),
  participants: many(tournamentParticipants),
  games: many(games),
}));

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

export const gamesRelations = relations(games, ({ one }) => ({
  club: one(clubs, {
    fields: [games.clubId],
    references: [clubs.id],
  }),
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
