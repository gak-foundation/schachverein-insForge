import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  date,
  integer,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentStatusEnum, contributionFrequencyEnum } from "./enums";
import { clubs } from "./clubs";
import { members } from "./members";

export const sepaExports = pgTable(
  "sepa_exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    xmlContent: text("xml_content").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentCount: integer("payment_count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("sepa_exports_club_idx").on(table.clubId),
  }),
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: varchar("description", { length: 300 }).notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    dueDate: date("due_date"),
    paidAt: timestamp("paid_at"),
    sepaMandateReference: varchar("sepa_mandate_reference", { length: 35 }),
    sepaExportId: uuid("sepa_export_id").references(() => sepaExports.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    year: integer("year").notNull(),
    dunningLevel: integer("dunning_level").default(0).notNull(),
    lastDunningAt: timestamp("last_dunning_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("payments_club_idx").on(table.clubId),
    sepaExportIdx: index("payments_sepa_export_idx").on(table.sepaExportId),
  }),
);

export const contributionRates = pgTable(
  "contribution_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    frequency: contributionFrequencyEnum("frequency").default("yearly").notNull(),
    description: text("description"),
    validFrom: date("valid_from"),
    validUntil: date("valid_until"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("contribution_rates_club_idx").on(table.clubId),
  }),
);

export const sepaExportsRelations = relations(sepaExports, ({ one, many }) => ({
  club: one(clubs, {
    fields: [sepaExports.clubId],
    references: [clubs.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  club: one(clubs, {
    fields: [payments.clubId],
    references: [clubs.id],
  }),
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
  sepaExport: one(sepaExports, {
    fields: [payments.sepaExportId],
    references: [sepaExports.id],
  }),
}));

export const contributionRatesRelations = relations(contributionRates, ({ one, many }) => ({
  club: one(clubs, {
    fields: [contributionRates.clubId],
    references: [clubs.id],
  }),
  members: many(members),
}));
