import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clubs } from "./clubs";
import { members } from "./members";
import { pageStatusEnum, pageLayoutEnum } from "./enums";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    s3Key: varchar("s3_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"), // BFSG: Pflicht für CMS-Bilder, aber DB lässt null zu für initiale Uploads
    caption: text("caption"),
    fileSize: integer("file_size"),
    uploadedBy: uuid("uploaded_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clubIdx: index("media_assets_club_idx").on(table.clubId),
  }),
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    status: pageStatusEnum("status").default("draft").notNull(),
    publishAt: timestamp("publish_at"),
    seo: jsonb("seo").$type<{
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      noIndex?: boolean;
    }>(),
    layout: pageLayoutEnum("layout").default("default").notNull(),
    navigationParent: uuid("navigation_parent"), // Für Hierarchie
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    clubSlugIdx: uniqueIndex("pages_club_slug_idx").on(table.clubId, table.slug),
    clubIdx: index("pages_club_idx").on(table.clubId),
  }),
);

export const pageBlocks = pgTable(
  "page_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    blockType: varchar("block_type", { length: 100 }).notNull(),
    order: integer("order").notNull(),
    content: jsonb("content").notNull(), // Typsicher via Zod im Code
    visibility: jsonb("visibility").$type<{
      public?: boolean;
      members?: boolean;
      roles?: string[];
    }>(),
    createdBy: uuid("created_by").references(() => members.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index("page_blocks_page_idx").on(table.pageId),
  }),
);

export const pageRevisions = pgTable(
  "page_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").notNull(), // Vollständiger Zustand der Seite + Blöcke
    authorId: uuid("author_id").references(() => members.id),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index("page_revisions_page_idx").on(table.pageId),
  }),
);

export const mediaConsents = pgTable(
  "media_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    consentType: varchar("consent_type", { length: 100 }).default("website_publication"),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    assetMemberIdx: uniqueIndex("media_consents_asset_member_idx").on(table.mediaAssetId, table.memberId),
  }),
);

// Relations
export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  club: one(clubs, {
    fields: [mediaAssets.clubId],
    references: [clubs.id],
  }),
  uploader: one(members, {
    fields: [mediaAssets.uploadedBy],
    references: [members.id],
  }),
  consents: many(mediaConsents),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  club: one(clubs, {
    fields: [pages.clubId],
    references: [clubs.id],
  }),
  blocks: many(pageBlocks),
  revisions: many(pageRevisions),
  parent: one(pages, {
    fields: [pages.navigationParent],
    references: [pages.id],
    relationName: "navigation_hierarchy",
  }),
  children: many(pages, {
    relationName: "navigation_hierarchy",
  }),
}));

export const pageBlocksRelations = relations(pageBlocks, ({ one }) => ({
  page: one(pages, {
    fields: [pageBlocks.pageId],
    references: [pages.id],
  }),
  creator: one(members, {
    fields: [pageBlocks.createdBy],
    references: [members.id],
  }),
}));

export const pageRevisionsRelations = relations(pageRevisions, ({ one }) => ({
  page: one(pages, {
    fields: [pageRevisions.pageId],
    references: [pages.id],
  }),
  author: one(members, {
    fields: [pageRevisions.authorId],
    references: [members.id],
  }),
}));

export const mediaConsentsRelations = relations(mediaConsents, ({ one }) => ({
  asset: one(mediaAssets, {
    fields: [mediaConsents.mediaAssetId],
    references: [mediaAssets.id],
  }),
  member: one(members, {
    fields: [mediaConsents.memberId],
    references: [members.id],
  }),
}));
