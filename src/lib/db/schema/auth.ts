import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
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

export const authSessions = pgTable("auth_session", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("auth_session_user_id_idx").on(table.userId),
  tokenIdx: index("auth_session_token_idx").on(table.token),
}));

export const authAccounts = pgTable("auth_account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: varchar("scope", { length: 255 }),
  idToken: text("id_token"),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("auth_account_user_id_idx").on(table.userId),
  providerIdx: uniqueIndex("auth_account_provider_idx").on(table.providerId, table.accountId),
}));

export const authVerifications = pgTable("auth_verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  identifierIdx: index("auth_verification_identifier_idx").on(table.identifier),
}));

export const authTwoFactors = pgTable("auth_two_factor", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  secret: varchar("secret", { length: 255 }).notNull(),
  backupCodes: jsonb("backup_codes").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex("auth_two_factor_user_id_idx").on(table.userId),
}));

export const authUsersRelations = relations(authUsers, ({ one, many }) => ({
  member: one(members, {
    fields: [authUsers.memberId],
    references: [members.id],
  }),
  activeClub: one(clubs, {
    fields: [authUsers.activeClubId],
    references: [clubs.id],
  }),
  accounts: many(authAccounts),
  sessions: many(authSessions),
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(authUsers, {
    fields: [authSessions.userId],
    references: [authUsers.id],
  }),
}));

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(authUsers, {
    fields: [authAccounts.userId],
    references: [authUsers.id],
  }),
}));
