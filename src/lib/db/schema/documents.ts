import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { documentCategoryEnum } from "./enums";
import { clubs } from "./clubs";
import { members } from "./members";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileUrl: text("file_url").notNull(),
    category: documentCategoryEnum("category").default("other").notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    fileSize: integer("file_size"),
    uploadedBy: uuid("uploaded_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("documents_club_idx").on(table.clubId),
  }),
);

export const newsletters = pgTable(
  "newsletters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 300 }).notNull(),
    body: text("body").notNull(),
    sentAt: timestamp("sent_at"),
    sentBy: uuid("sent_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("newsletters_club_idx").on(table.clubId),
  }),
);

export const documentsRelations = relations(documents, ({ one }) => ({
  club: one(clubs, {
    fields: [documents.clubId],
    references: [clubs.id],
  }),
  uploader: one(members, {
    fields: [documents.uploadedBy],
    references: [members.id],
  }),
}));

export const newslettersRelations = relations(newsletters, ({ one }) => ({
  club: one(clubs, {
    fields: [newsletters.clubId],
    references: [clubs.id],
  }),
  sender: one(members, {
    fields: [newsletters.sentBy],
    references: [members.id],
  }),
}));
