ALTER TYPE "public"."member_role" ADD VALUE 'user' BEFORE 'admin';--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "tournament_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "round" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "white_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "black_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "club_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "white_name" varchar(200);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "black_name" varchar(200);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "event" varchar(300);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "date" varchar(20);--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "games_club_idx" ON "games" USING btree ("club_id");