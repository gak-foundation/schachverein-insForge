import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clubs } from "./clubs";
import { members } from "./members";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    location: varchar("location", { length: 300 }),
    isAllDay: boolean("is_all_day").default(false),
    recurrenceRule: text("recurrence_rule"), // e.g., RRULE:FREQ=WEEKLY;BYDAY=TU
    createdBy: uuid("created_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("events_club_idx").on(table.clubId),
  }),
);

export const eventsRelations = relations(events, ({ one }) => ({
  club: one(clubs, {
    fields: [events.clubId],
    references: [clubs.id],
  }),
  creator: one(members, {
    fields: [events.createdBy],
    references: [members.id],
  }),
}));
