ALTER TYPE "public"."payment_status" ADD VALUE 'collected';--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "creditor_id" varchar(35);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "sepa_iban" varchar(34);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "sepa_bic" varchar(11);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "mandate_signed_at" date;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "contribution_rate_id" uuid;