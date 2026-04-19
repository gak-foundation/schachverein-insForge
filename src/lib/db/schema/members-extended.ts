import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  integer,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { availabilityStatusEnum, membershipStatusEnum } from "./enums";
import { members } from "./members";
import { matches } from "./matches";

export const dwzHistory = pgTable(
  "dwz_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    dwz: integer("dwz").notNull(),
    elo: integer("elo"),
    source: varchar("source", { length: 50 }).default("manual"),
    recordedAt: date("recorded_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    memberDateIdx: index("dwz_history_member_date_idx").on(
      table.memberId,
      table.recordedAt,
    ),
  }),
);

export const memberStatusHistory = pgTable(
  "member_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    oldStatus: membershipStatusEnum("old_status"),
    newStatus: membershipStatusEnum("new_status").notNull(),
    reason: text("reason"),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
    changedBy: uuid("changed_by"), // ID of the user who made the change
  },
  (table) => ({
    memberIdx: index("member_status_history_member_idx").on(table.memberId),
  }),
);

export const availability = pgTable("availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  matchId: uuid("match_id").references(() => matches.id),
  date: date("date").notNull(),
  status: availabilityStatusEnum("status").default("available").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dwzHistoryRelations = relations(dwzHistory, ({ one }) => ({
  member: one(members, {
    fields: [dwzHistory.memberId],
    references: [members.id],
  }),
}));

export const memberStatusHistoryRelations = relations(memberStatusHistory, ({ one }) => ({
  member: one(members, {
    fields: [memberStatusHistory.memberId],
    references: [members.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  member: one(members, {
    fields: [availability.memberId],
    references: [members.id],
  }),
}));
