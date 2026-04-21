import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  date,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { matchStatusEnum, gameResultEnum } from "./enums";
import { seasons } from "./seasons";
import { teams } from "./teams";
import { tournaments } from "./tournaments";
import { games } from "./tournaments";
import { members } from "./members";

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id),
    tournamentId: uuid("tournament_id").references(() => tournaments.id),
    homeTeamId: uuid("home_team_id")
      .notNull()
      .references(() => teams.id),
    awayTeamId: uuid("away_team_id")
      .notNull()
      .references(() => teams.id),
    matchDate: date("match_date"),
    location: varchar("location", { length: 300 }),
    homeScore: decimal("home_score", { precision: 5, scale: 1 }),
    awayScore: decimal("away_score", { precision: 5, scale: 1 }),
    status: matchStatusEnum("status").default("scheduled").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    seasonIdx: index("matches_season_idx").on(table.seasonId),
    dateIdx: index("matches_date_idx").on(table.matchDate),
  }),
);

export const matchResults = pgTable("match_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  gameId: uuid("game_id").references(() => games.id),
  boardNumber: integer("board_number").notNull(),
  homePlayerId: uuid("home_player_id").references(() => members.id),
  awayPlayerId: uuid("away_player_id").references(() => members.id),
  result: gameResultEnum("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchesRelations = relations(matches, ({ one }) => ({
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
    relationName: "homeMatches",
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
    relationName: "awayMatches",
  }),
}));

export const matchResultsRelations = relations(matchResults, ({ one }) => ({
  match: one(matches, {
    fields: [matchResults.matchId],
    references: [matches.id],
  }),
  game: one(games, {
    fields: [matchResults.gameId],
    references: [games.id],
  }),
  homePlayer: one(members, {
    fields: [matchResults.homePlayerId],
    references: [members.id],
    relationName: "homePlayer",
  }),
  awayPlayer: one(members, {
    fields: [matchResults.awayPlayerId],
    references: [members.id],
    relationName: "awayPlayer",
  }),
}));
