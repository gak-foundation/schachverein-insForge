ALTER TABLE "auth_user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "ban_reason" varchar(255);