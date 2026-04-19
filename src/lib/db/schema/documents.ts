import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { documentCategoryEnum } from "./enums";
import { clubs } from "./clubs";
import { members } from "./members";
import { events } from "./events";

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

export const meetingProtocols = pgTable(
  "meeting_protocols",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    location: varchar("location", { length: 300 }),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
    attendeesCount: integer("attendees_count").default(0),
    isQuorate: boolean("is_quorate").default(true), // Beschlussfähig
    agenda: jsonb("agenda").$type<{ 
      title: string; 
      description?: string; 
      results?: string;
      resolutions?: { title: string; for: number; against: number; abstained: number; result: string }[];
    }[]>(),
    notes: text("notes"),
    signedAt: timestamp("signed_at"),
    signedBy: uuid("signed_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("meeting_protocols_club_idx").on(table.clubId),
    eventIdx: index("meeting_protocols_event_idx").on(table.eventId),
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

export const meetingProtocolsRelations = relations(meetingProtocols, ({ one }) => ({
  club: one(clubs, {
    fields: [meetingProtocols.clubId],
    references: [clubs.id],
  }),
  event: one(events, {
    fields: [meetingProtocols.eventId],
    references: [events.id],
  }),
  signer: one(members, {
    fields: [meetingProtocols.signedBy],
    references: [members.id],
  }),
}));
