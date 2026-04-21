CREATE TABLE "sepa_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"xml_content" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "sepa_export_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "invoice_number" varchar(50);--> statement-breakpoint
ALTER TABLE "sepa_exports" ADD CONSTRAINT "sepa_exports_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sepa_exports_club_idx" ON "sepa_exports" USING btree ("club_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_sepa_export_id_sepa_exports_id_fk" FOREIGN KEY ("sepa_export_id") REFERENCES "public"."sepa_exports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_sepa_export_idx" ON "payments" USING btree ("sepa_export_id");
