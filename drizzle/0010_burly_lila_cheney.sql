ALTER TABLE "clubs" ALTER COLUMN "sepa_iban" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "clubs" ALTER COLUMN "sepa_bic" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "sepa_iban" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "sepa_bic" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "mandate_url" text;