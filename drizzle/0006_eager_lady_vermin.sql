CREATE TYPE "public"."page_layout" AS ENUM('default', 'wide', 'landing');--> statement-breakpoint
CREATE TYPE "public"."page_status" AS ENUM('draft', 'published', 'scheduled', 'archived');--> statement-breakpoint
CREATE TABLE "member_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"old_status" "membership_status",
	"new_status" "membership_status" NOT NULL,
	"reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"caption" text,
	"file_size" integer,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"consent_type" varchar(100) DEFAULT 'website_publication',
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"block_type" varchar(100) NOT NULL,
	"order" integer NOT NULL,
	"content" jsonb NOT NULL,
	"visibility" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"author_id" uuid,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(300) NOT NULL,
	"status" "page_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp,
	"seo" jsonb,
	"layout" "page_layout" DEFAULT 'default' NOT NULL,
	"navigation_parent" uuid,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "club_invitations" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "club_invitations" ALTER COLUMN "role" SET DEFAULT 'mitglied'::text;--> statement-breakpoint
ALTER TABLE "club_memberships" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "club_memberships" ALTER COLUMN "role" SET DEFAULT 'mitglied'::text;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'mitglied'::text;--> statement-breakpoint
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DEFAULT 'mitglied'::text;--> statement-breakpoint
DROP TYPE "public"."member_role";--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('admin', 'vorstand', 'sportwart', 'jugendwart', 'kassenwart', 'trainer', 'mitglied', 'eltern');--> statement-breakpoint
ALTER TABLE "club_invitations" ALTER COLUMN "role" SET DEFAULT 'mitglied'::"public"."member_role";--> statement-breakpoint
ALTER TABLE "club_invitations" ALTER COLUMN "role" SET DATA TYPE "public"."member_role" USING "role"::"public"."member_role";--> statement-breakpoint
ALTER TABLE "club_memberships" ALTER COLUMN "role" SET DEFAULT 'mitglied'::"public"."member_role";--> statement-breakpoint
ALTER TABLE "club_memberships" ALTER COLUMN "role" SET DATA TYPE "public"."member_role" USING "role"::"public"."member_role";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'mitglied'::"public"."member_role";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DATA TYPE "public"."member_role" USING "role"::"public"."member_role";--> statement-breakpoint
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DEFAULT 'mitglied'::"public"."member_role";--> statement-breakpoint
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DATA TYPE "public"."member_role" USING "role"::"public"."member_role";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "deletion_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "anonymized_at" timestamp;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "heritage_game_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_rule" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "dunning_level" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "last_dunning_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_status_history" ADD CONSTRAINT "member_status_history_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_members_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_consents" ADD CONSTRAINT "media_consents_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_consents" ADD CONSTRAINT "media_consents_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_created_by_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_status_history_member_idx" ON "member_status_history" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "media_assets_club_idx" ON "media_assets" USING btree ("club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_consents_asset_member_idx" ON "media_consents" USING btree ("media_asset_id","member_id");--> statement-breakpoint
CREATE INDEX "page_blocks_page_idx" ON "page_blocks" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_revisions_page_idx" ON "page_revisions" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_club_slug_idx" ON "pages" USING btree ("club_id","slug");--> statement-breakpoint
CREATE INDEX "pages_club_idx" ON "pages" USING btree ("club_id");