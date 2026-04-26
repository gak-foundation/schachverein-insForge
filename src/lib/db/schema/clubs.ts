import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { subscriptionPlanEnum, subscriptionStatusEnum } from "./enums";

export const clubs = pgTable(
  "clubs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    logoUrl: text("logo_url"),
    website: varchar("website", { length: 300 }),
    address: jsonb("address").$type<{
      street: string;
      zipCode: string;
      city: string;
      country: string;
    }>(),
    contactEmail: varchar("contact_email", { length: 255 }),
    plan: subscriptionPlanEnum("plan").default("free").notNull(),
    // Deprecated: use club_addons table instead
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    // Deprecated: use club_addons.stripe_subscription_id instead
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
    // Deprecated: use club_addons.status instead
    subscriptionStatus: subscriptionStatusEnum("subscription_status"),
    // Deprecated: use club_addons.expires_at instead
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    // Deprecated: use getClubFeatures() from @/lib/billing/features instead
    features: jsonb("features").$type<Record<string, boolean>>().default({}),
    settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
    isActive: boolean("is_active").default(true).notNull(),
    creditorId: varchar("creditor_id", { length: 35 }),
    sepaIban: varchar("sepa_iban", { length: 1024 }),
    sepaBic: varchar("sepa_bic", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("clubs_slug_idx").on(table.slug),
    stripeCustomerIdx: index("clubs_stripe_customer_idx").on(table.stripeCustomerId),
    stripeConnectIdx: index("clubs_stripe_connect_idx").on(table.stripeConnectAccountId),
  }),
);
