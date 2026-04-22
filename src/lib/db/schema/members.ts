import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  date,
  text,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { memberRoleEnum, clubMemberStatusEnum, membershipStatusEnum } from "./enums";
import { clubs } from "./clubs";

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }),

    dwz: integer("dwz"),
    elo: integer("elo"),
    dwzId: varchar("dwz_id", { length: 50 }),
    lichessUsername: varchar("lichess_username", { length: 100 }),
    lichessId: varchar("lichess_id", { length: 100 }),
    isLichessVerified: boolean("is_lichess_verified").default(false),
    lichessAccessToken: text("lichess_access_token"), // Should be encrypted
    chesscomUsername: varchar("chesscom_username", { length: 100 }),
    fideId: varchar("fide_id", { length: 20 }),

    status: membershipStatusEnum("status").default("active").notNull(),
    role: memberRoleEnum("role").default("mitglied").notNull(),
    joinedAt: date("joined_at").defaultNow(),

    parentId: uuid("parent_id"),

    permissions: jsonb("permissions").$type<string[]>().default([]),

    sepaMandateReference: varchar("sepa_mandate_reference", { length: 35 }),
    sepaIban: varchar("sepa_iban", { length: 1024 }),
    sepaBic: varchar("sepa_bic", { length: 1024 }),
    mandateSignedAt: date("mandate_signed_at"),
    mandateUrl: text("mandate_url"),
    contributionRateId: uuid("contribution_rate_id"),

    notes: text("notes"),
    medicalNotes: text("medical_notes"), // Should be encrypted
    emergencyContactName: varchar("emergency_contact_name", { length: 200 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 100 }),
    
    photoConsent: boolean("photo_consent").default(false),
    newsletterConsent: boolean("newsletter_consent").default(false),
    resultPublicationConsent: boolean("result_publication_consent").default(true),

    deletionRequestedAt: timestamp("deletion_requested_at"),
    anonymizedAt: timestamp("anonymized_at"),

    heritageGameId: uuid("heritage_game_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("members_email_idx").on(table.email),
    dwzIdIdx: index("members_dwz_id_idx").on(table.dwzId),
    parentIdIdx: index("members_parent_id_idx").on(table.parentId),
  }),
);

export const clubMemberships = pgTable(
  "club_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").default("mitglied").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    isPrimary: boolean("is_primary").default(true).notNull(),
    status: clubMemberStatusEnum("status").default("active").notNull(),
    invitedBy: uuid("invited_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubMemberIdx: uniqueIndex("club_memberships_club_member_idx").on(
      table.clubId,
      table.memberId,
    ),
    memberClubIdx: index("club_memberships_member_idx").on(table.memberId),
    clubIdx: index("club_memberships_club_idx").on(table.clubId),
  }),
);

export const clubInvitations = pgTable(
  "club_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: memberRoleEnum("role").default("mitglied").notNull(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => members.id),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("club_invitations_club_idx").on(table.clubId),
    tokenIdx: index("club_invitations_token_idx").on(table.token),
    emailIdx: index("club_invitations_email_idx").on(table.email),
  }),
);
