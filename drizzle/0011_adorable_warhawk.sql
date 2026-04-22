CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."application_type" AS ENUM('waitlist', 'demo', 'contact', 'pilot');--> statement-breakpoint
CREATE TABLE "waitlist_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "application_type" DEFAULT 'waitlist' NOT NULL,
	"club_name" varchar(200) NOT NULL,
	"slug" varchar(100),
	"contact_email" varchar(255) NOT NULL,
	"contact_name" varchar(255),
	"phone" varchar(50),
	"website" varchar(300),
	"address" jsonb,
	"member_count" varchar(50),
	"message" text,
	"notes" text,
	"source" varchar(50),
	"user_agent" text,
	"ip_hash" varchar(64),
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_applications_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP TABLE "auth_account" CASCADE;--> statement-breakpoint
DROP TABLE "auth_session" CASCADE;--> statement-breakpoint
DROP TABLE "auth_two_factor" CASCADE;--> statement-breakpoint
DROP TABLE "auth_verification" CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "lichess_id" varchar(100);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "is_lichess_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "lichess_access_token" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "medical_notes" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "emergency_contact_name" varchar(200);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "emergency_contact_phone" varchar(100);--> statement-breakpoint
CREATE INDEX "waitlist_slug_idx" ON "waitlist_applications" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "waitlist_status_idx" ON "waitlist_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "waitlist_email_idx" ON "waitlist_applications" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "waitlist_type_idx" ON "waitlist_applications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "waitlist_ip_hash_idx" ON "waitlist_applications" USING btree ("ip_hash");