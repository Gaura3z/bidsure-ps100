ALTER TABLE "bid_documents" ADD COLUMN "security_status" text;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD COLUMN "security_engine" text;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD COLUMN "ocr_status" text;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD COLUMN "ocr_engine" text;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD COLUMN "ocr_text" text;