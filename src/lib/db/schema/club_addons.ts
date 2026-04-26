import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { clubs } from "./clubs";
import { addonStatusEnum, addonIdEnum } from "./enums";

export const clubAddons = pgTable(
  "club_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    addonId: addonIdEnum("addon_id").notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    status: addonStatusEnum("status").default("active").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubAddonIdx: index("club_addons_club_addon_idx").on(table.clubId, table.addonId),
    clubIdx: index("club_addons_club_idx").on(table.clubId),
    stripeSubIdx: index("club_addons_stripe_sub_idx").on(table.stripeSubscriptionId),
  }),
);
