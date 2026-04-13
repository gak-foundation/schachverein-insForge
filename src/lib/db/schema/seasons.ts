import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { seasonTypeEnum } from "./enums";
import { clubs } from "./clubs";
import { teams } from "./teams";
import { tournaments } from "./tournaments";

export const seasons = pgTable(
  "seasons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    year: integer("year").notNull(),
    type: seasonTypeEnum("type").default("club_internal").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("seasons_club_idx").on(table.clubId),
  }),
);

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  club: one(clubs, {
    fields: [seasons.clubId],
    references: [clubs.id],
  }),
  teams: many(teams),
  tournaments: many(tournaments),
}));
