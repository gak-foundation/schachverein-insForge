-- Added columns for strict subdomain tenancy
-- Phase 1: Schema-Änderungen

ALTER TABLE "clubs" ADD COLUMN "stripe_connect_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "club_id" uuid;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "club_id" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clubs_stripe_connect_idx" ON "clubs" USING btree ("stripe_connect_account_id");--> statement-breakpoint
CREATE INDEX "members_club_idx" ON "members" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "auth_user_club_idx" ON "auth_user" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "auth_user_email_idx" ON "auth_user" USING btree ("email");