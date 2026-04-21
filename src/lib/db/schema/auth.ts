import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { memberRoleEnum } from "./enums";
import { members } from "./members";
import { clubs } from "./clubs";

export const authUsers = pgTable(
  "auth_user",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    password: varchar("password", { length: 255 }),
    memberId: uuid("member_id").references(() => members.id),
    activeClubId: uuid("active_club_id").references(() => clubs.id),
    role: memberRoleEnum("role").default("mitglied").notNull(),
    permissions: jsonb("permissions").$type<string[]>().default([]),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until"),
    passwordResetAt: timestamp("password_reset_at"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    banned: boolean("banned").default(false),
    banReason: varchar("ban_reason", { length: 255 }),
    isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("auth_user_email_idx").on(table.email),
    memberIdIdx: index("auth_user_member_id_idx").on(table.memberId),
    activeClubIdx: index("auth_user_active_club_idx").on(table.activeClubId),
  }),
);

export const authUsersRelations = relations(authUsers, ({ one }) => ({
  member: one(members, {
    fields: [authUsers.memberId],
    references: [members.id],
  }),
  activeClub: one(clubs, {
    fields: [authUsers.activeClubId],
    references: [clubs.id],
  }),
}));
