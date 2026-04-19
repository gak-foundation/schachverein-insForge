CREATE TABLE "meeting_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"location" varchar(300),
	"start_time" timestamp,
	"end_time" timestamp,
	"attendees_count" integer DEFAULT 0,
	"is_quorate" boolean DEFAULT true,
	"agenda" jsonb,
	"notes" text,
	"signed_at" timestamp,
	"signed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availability" ADD COLUMN "match_id" uuid;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "lichess_url" text;--> statement-breakpoint
ALTER TABLE "meeting_protocols" ADD CONSTRAINT "meeting_protocols_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_protocols" ADD CONSTRAINT "meeting_protocols_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_protocols" ADD CONSTRAINT "meeting_protocols_signed_by_members_id_fk" FOREIGN KEY ("signed_by") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meeting_protocols_club_idx" ON "meeting_protocols" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "meeting_protocols_event_idx" ON "meeting_protocols" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "pgn";