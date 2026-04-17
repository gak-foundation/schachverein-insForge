import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clubs } from "./clubs";

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id").references(() => clubs.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }),
    action: varchar("action", { length: 50 }).notNull(),
    entity: varchar("entity", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),
    changes: jsonb("changes"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("audit_log_club_idx").on(table.clubId),
    entityIdx: index("audit_log_entity_idx").on(table.entity, table.entityId),
  }),
);
