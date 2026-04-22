import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { applicationStatusEnum, applicationTypeEnum } from "./enums";

export const waitlistApplications = pgTable(
  "waitlist_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: applicationTypeEnum("type").default("waitlist").notNull(),
    clubName: varchar("club_name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    website: varchar("website", { length: 300 }),
    address: jsonb("address").$type<{
      street: string;
      zipCode: string;
      city: string;
      country: string;
    }>(),
    memberCount: varchar("member_count", { length: 50 }),
    message: text("message"),
    notes: text("notes"),
    source: varchar("source", { length: 50 }),
    userAgent: text("user_agent"),
    ipHash: varchar("ip_hash", { length: 64 }),
    status: applicationStatusEnum("status").default("pending").notNull(),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("waitlist_slug_idx").on(table.slug),
    statusIdx: index("waitlist_status_idx").on(table.status),
    emailIdx: index("waitlist_email_idx").on(table.contactEmail),
    typeIdx: index("waitlist_type_idx").on(table.type),
    ipHashIdx: index("waitlist_ip_hash_idx").on(table.ipHash),
  }),
);