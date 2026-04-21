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
import { applicationStatusEnum } from "./enums";

export const waitlistApplications = pgTable(
  "waitlist_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubName: varchar("club_name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    website: varchar("website", { length: 300 }),
    address: jsonb("address").$type<{
      street: string;
      zipCode: string;
      city: string;
      country: string;
    }>(),
    memberCount: varchar("member_count", { length: 50 }),
    notes: text("notes"),
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
  }),
);