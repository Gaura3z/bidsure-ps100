CREATE TABLE "ai_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_submission_id" text NOT NULL,
	"summary" text NOT NULL,
	"suggested_action" text NOT NULL,
	"key_findings" jsonb NOT NULL,
	"discrepancies" jsonb NOT NULL,
	"risk_factors" jsonb NOT NULL,
	"disclaimer" text NOT NULL,
	"generated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"actor_user_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text NOT NULL,
	"details" jsonb,
	"evidence_hash" text,
	"rule_version" text
);
--> statement-breakpoint
CREATE TABLE "bid_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_submission_id" text NOT NULL,
	"bidder_id" text NOT NULL,
	"doc_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_hash" text NOT NULL,
	"storage_path" text,
	"status" text NOT NULL,
	"uploaded_at" timestamp with time zone NOT NULL,
	"preview_url" text,
	"page_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bid_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"bidder_id" text NOT NULL,
	"submission_ref" text NOT NULL,
	"status" text NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"risk_level" text NOT NULL,
	"checks_passed" integer DEFAULT 0 NOT NULL,
	"checks_review" integer DEFAULT 0 NOT NULL,
	"checks_failed" integer DEFAULT 0 NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bidders" (
	"id" text PRIMARY KEY NOT NULL,
	"legal_name" text NOT NULL,
	"trade_name" text,
	"entity_type" text NOT NULL,
	"cin" text,
	"pan" text NOT NULL,
	"gstin" text NOT NULL,
	"udyam_number" text,
	"msme_category" text,
	"location" text NOT NULL,
	"state" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"annual_turnover" numeric(16, 2),
	"incorporation_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_submission_id" text NOT NULL,
	"total_requirements" integer NOT NULL,
	"passed_count" integer NOT NULL,
	"review_count" integer NOT NULL,
	"failed_count" integer NOT NULL,
	"weighted_score" numeric(5, 2) NOT NULL,
	"risk_score" numeric(5, 2) NOT NULL,
	"risk_level" text NOT NULL,
	"scoring_version" text NOT NULL,
	"calculated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_extractions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"field_name" text NOT NULL,
	"field_label" text NOT NULL,
	"extracted_value" text NOT NULL,
	"confidence_score" numeric(5, 4) NOT NULL,
	"page_number" integer NOT NULL,
	"bounding_coordinates" text,
	"ocr_snippet" text,
	"extracted_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "officer_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_submission_id" text NOT NULL,
	"officer_user_id" text NOT NULL,
	"officer_name" text NOT NULL,
	"officer_designation" text NOT NULL,
	"decision" text NOT NULL,
	"remarks" text NOT NULL,
	"clarification_subject" text,
	"clarification_deadline" timestamp with time zone,
	"overrides_applied" jsonb NOT NULL,
	"decided_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"pan" text,
	"gstin" text,
	"address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_records" (
	"id" text PRIMARY KEY NOT NULL,
	"adapter_name" text NOT NULL,
	"identifier_checked" text NOT NULL,
	"source_type" text NOT NULL,
	"response_payload" jsonb NOT NULL,
	"status_code" integer NOT NULL,
	"verified_status" text NOT NULL,
	"record_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tender_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"clause_number" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"is_knockout" boolean DEFAULT false NOT NULL,
	"threshold_type" text NOT NULL,
	"threshold_value" text NOT NULL,
	"evidence_doc_type" text NOT NULL,
	"source_adapter" text NOT NULL,
	"severity" text NOT NULL,
	"weight" integer NOT NULL,
	"rule_expression" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"estimated_value" numeric(16, 2) NOT NULL,
	"submission_deadline" timestamp with time zone NOT NULL,
	"evaluation_date" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"document_url" text,
	"rule_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"designation" text NOT NULL,
	"department" text,
	"avatar_url" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_results" (
	"id" text PRIMARY KEY NOT NULL,
	"bid_submission_id" text NOT NULL,
	"requirement_id" text NOT NULL,
	"status" text NOT NULL,
	"extracted_value" text NOT NULL,
	"required_value" text NOT NULL,
	"difference_summary" text,
	"source_type" text NOT NULL,
	"source_adapter" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"rule_version" text NOT NULL,
	"is_knockout_triggered" boolean DEFAULT false NOT NULL,
	"officer_overridden" boolean DEFAULT false NOT NULL,
	"override_reason" text,
	"overridden_by_user_id" text,
	"evidence_snippet" text,
	"document_id" text,
	"page_number" integer,
	"ai_explanation" text
);
--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_bid_submission_id_bid_submissions_id_fk" FOREIGN KEY ("bid_submission_id") REFERENCES "public"."bid_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD CONSTRAINT "bid_documents_bid_submission_id_bid_submissions_id_fk" FOREIGN KEY ("bid_submission_id") REFERENCES "public"."bid_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_documents" ADD CONSTRAINT "bid_documents_bidder_id_bidders_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."bidders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_submissions" ADD CONSTRAINT "bid_submissions_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_submissions" ADD CONSTRAINT "bid_submissions_bidder_id_bidders_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."bidders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_scores" ADD CONSTRAINT "compliance_scores_bid_submission_id_bid_submissions_id_fk" FOREIGN KEY ("bid_submission_id") REFERENCES "public"."bid_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_document_id_bid_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."bid_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officer_decisions" ADD CONSTRAINT "officer_decisions_bid_submission_id_bid_submissions_id_fk" FOREIGN KEY ("bid_submission_id") REFERENCES "public"."bid_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officer_decisions" ADD CONSTRAINT "officer_decisions_officer_user_id_users_id_fk" FOREIGN KEY ("officer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_requirements" ADD CONSTRAINT "tender_requirements_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_bid_submission_id_bid_submissions_id_fk" FOREIGN KEY ("bid_submission_id") REFERENCES "public"."bid_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_requirement_id_tender_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."tender_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_overridden_by_user_id_users_id_fk" FOREIGN KEY ("overridden_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_results" ADD CONSTRAINT "verification_results_document_id_bid_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."bid_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_recommendations_submission_idx" ON "ai_recommendations" USING btree ("bid_submission_id");--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_events_timestamp_idx" ON "audit_events" USING btree ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "bid_documents_hash_unique" ON "bid_documents" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "bid_documents_submission_idx" ON "bid_documents" USING btree ("bid_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bid_submissions_ref_unique" ON "bid_submissions" USING btree ("submission_ref");--> statement-breakpoint
CREATE INDEX "bid_submissions_tender_idx" ON "bid_submissions" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "bid_submissions_bidder_idx" ON "bid_submissions" USING btree ("bidder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bidders_pan_unique" ON "bidders" USING btree ("pan");--> statement-breakpoint
CREATE UNIQUE INDEX "bidders_gstin_unique" ON "bidders" USING btree ("gstin");--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_scores_submission_unique" ON "compliance_scores" USING btree ("bid_submission_id");--> statement-breakpoint
CREATE INDEX "document_extractions_document_idx" ON "document_extractions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "officer_decisions_submission_idx" ON "officer_decisions" USING btree ("bid_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_code_unique" ON "organizations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "source_records_identifier_idx" ON "source_records" USING btree ("adapter_name","identifier_checked");--> statement-breakpoint
CREATE INDEX "requirements_tender_idx" ON "tender_requirements" USING btree ("tender_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenders_tender_id_unique" ON "tenders" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "tenders_organization_idx" ON "tenders" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_organization_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "verification_results_submission_idx" ON "verification_results" USING btree ("bid_submission_id");