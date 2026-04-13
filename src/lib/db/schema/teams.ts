import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  date,
  index,
} from "drizzle-orm/pg-core";
import { clubs } from "./clubs";
import { members } from "./members";
import { seasons } from "./seasons";

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id),
    league: varchar("league", { length: 200 }),
    captainId: uuid("captain_id").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("teams_club_idx").on(table.clubId),
  }),
);

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
    boardNumber: integer("board_number").notNull(),
    isJoker: boolean("is_joker").default(false),
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
  isRegular: boolean("is_regular").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
