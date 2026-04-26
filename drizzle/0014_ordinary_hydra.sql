CREATE TYPE "public"."addon_id" AS ENUM('finance', 'tournament_pro', 'professional', 'communication', 'storage_plus');--> statement-breakpoint
CREATE TYPE "public"."addon_status" AS ENUM('active', 'past_due', 'canceled', 'trialing');--> statement-breakpoint
CREATE TABLE "club_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"addon_id" "addon_id" NOT NULL,
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"status" "addon_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_addons" ADD CONSTRAINT "club_addons_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "club_addons_club_addon_idx" ON "club_addons" USING btree ("club_id","addon_id");--> statement-breakpoint
CREATE INDEX "club_addons_club_idx" ON "club_addons" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "club_addons_stripe_sub_idx" ON "club_addons" USING btree ("stripe_subscription_id");