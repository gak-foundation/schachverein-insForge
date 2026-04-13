CREATE TYPE "public"."club_member_status" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'trialing', 'paused');--> statement-breakpoint
CREATE TABLE "club_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "member_role" DEFAULT 'mitglied' NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "club_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "club_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'mitglied' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"status" "club_member_status" DEFAULT 'active' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_url" text,
	"website" varchar(300),
	"address" jsonb,
	"contact_email" varchar(255),
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"subscription_status" "subscription_status",
	"subscription_expires_at" timestamp,
	"features" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clubs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "members_email_idx";--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "club_id" uuid;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "active_club_id" uuid;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contribution_rates" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletters" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "club_invitations" ADD CONSTRAINT "club_invitations_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_invitations" ADD CONSTRAINT "club_invitations_invited_by_members_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_invited_by_members_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "club_invitations_club_idx" ON "club_invitations" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "club_invitations_token_idx" ON "club_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "club_invitations_email_idx" ON "club_invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "club_memberships_club_member_idx" ON "club_memberships" USING btree ("club_id","member_id");--> statement-breakpoint
CREATE INDEX "club_memberships_member_idx" ON "club_memberships" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "club_memberships_club_idx" ON "club_memberships" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "clubs_slug_idx" ON "clubs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "clubs_stripe_customer_idx" ON "clubs" USING btree ("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_active_club_id_clubs_id_fk" FOREIGN KEY ("active_club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_rates" ADD CONSTRAINT "contribution_rates_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_club_idx" ON "audit_log" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "auth_user_active_club_idx" ON "auth_user" USING btree ("active_club_id");--> statement-breakpoint
CREATE INDEX "contribution_rates_club_idx" ON "contribution_rates" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "documents_club_idx" ON "documents" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "events_club_idx" ON "events" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "newsletters_club_idx" ON "newsletters" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "payments_club_idx" ON "payments" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "seasons_club_idx" ON "seasons" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "teams_club_idx" ON "teams" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "tournaments_club_idx" ON "tournaments" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "members_email_idx" ON "members" USING btree ("email");