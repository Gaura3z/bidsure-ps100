import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow();

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: text('type').notNull(),
  pan: text('pan'),
  gstin: text('gstin'),
  address: text('address').notNull(),
  createdAt: createdAt(),
}, (table) => ({
  codeUnique: uniqueIndex('organizations_code_unique').on(table.code),
}));

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  designation: text('designation').notNull(),
  department: text('department'),
  avatarUrl: text('avatar_url'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
  createdAt: createdAt(),
}, (table) => ({
  emailUnique: uniqueIndex('users_email_unique').on(table.email),
  organizationIdx: index('users_organization_idx').on(table.organizationId),
}));

export const tenders = pgTable('tenders', {
  id: text('id').primaryKey(),
  tenderId: text('tender_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  estimatedValue: numeric('estimated_value', { precision: 16, scale: 2, mode: 'number' }).notNull(),
  submissionDeadline: timestamp('submission_deadline', { withTimezone: true, mode: 'string' }).notNull(),
  evaluationDate: timestamp('evaluation_date', { withTimezone: true, mode: 'string' }).notNull(),
  status: text('status').notNull(),
  createdByUserId: text('created_by_user_id').notNull().references(() => users.id),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  documentUrl: text('document_url'),
  ruleVersion: text('rule_version').notNull(),
  createdAt: createdAt(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  tenderIdUnique: uniqueIndex('tenders_tender_id_unique').on(table.tenderId),
  organizationIdx: index('tenders_organization_idx').on(table.organizationId),
}));

export const tenderRequirements = pgTable('tender_requirements', {
  id: text('id').primaryKey(),
  tenderId: text('tender_id').notNull().references(() => tenders.id),
  clauseNumber: text('clause_number').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isMandatory: boolean('is_mandatory').notNull().default(false),
  isKnockout: boolean('is_knockout').notNull().default(false),
  thresholdType: text('threshold_type').notNull(),
  thresholdValue: text('threshold_value').notNull(),
  evidenceDocType: text('evidence_doc_type').notNull(),
  sourceAdapter: text('source_adapter').notNull(),
  severity: text('severity').notNull(),
  weight: integer('weight').notNull(),
  ruleExpression: text('rule_expression').notNull(),
  createdAt: createdAt(),
}, (table) => ({
  tenderIdx: index('requirements_tender_idx').on(table.tenderId),
}));

export const bidders = pgTable('bidders', {
  id: text('id').primaryKey(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name'),
  entityType: text('entity_type').notNull(),
  cin: text('cin'),
  pan: text('pan').notNull(),
  gstin: text('gstin').notNull(),
  udyamNumber: text('udyam_number'),
  msmeCategory: text('msme_category'),
  location: text('location').notNull(),
  state: text('state').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  annualTurnover: numeric('annual_turnover', { precision: 16, scale: 2, mode: 'number' }),
  incorporationDate: timestamp('incorporation_date', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: createdAt(),
}, (table) => ({
  panUnique: uniqueIndex('bidders_pan_unique').on(table.pan),
  gstinUnique: uniqueIndex('bidders_gstin_unique').on(table.gstin),
}));

export const bidSubmissions = pgTable('bid_submissions', {
  id: text('id').primaryKey(),
  tenderId: text('tender_id').notNull().references(() => tenders.id),
  bidderId: text('bidder_id').notNull().references(() => bidders.id),
  submissionRef: text('submission_ref').notNull(),
  status: text('status').notNull(),
  overallScore: integer('overall_score').notNull().default(0),
  riskLevel: text('risk_level').notNull(),
  checksPassed: integer('checks_passed').notNull().default(0),
  checksReview: integer('checks_review').notNull().default(0),
  checksFailed: integer('checks_failed').notNull().default(0),
  submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'string' }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'string' }),
  decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'string' }),
}, (table) => ({
  refUnique: uniqueIndex('bid_submissions_ref_unique').on(table.submissionRef),
  tenderIdx: index('bid_submissions_tender_idx').on(table.tenderId),
  bidderIdx: index('bid_submissions_bidder_idx').on(table.bidderId),
}));

export const bidDocuments = pgTable('bid_documents', {
  id: text('id').primaryKey(),
  bidSubmissionId: text('bid_submission_id').notNull().references(() => bidSubmissions.id),
  bidderId: text('bidder_id').notNull().references(() => bidders.id),
  docType: text('doc_type').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  fileHash: text('file_hash').notNull(),
  storagePath: text('storage_path'),
  status: text('status').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true, mode: 'string' }).notNull(),
  previewUrl: text('preview_url'),
  pageCount: integer('page_count').notNull().default(0),
}, (table) => ({
  hashUnique: uniqueIndex('bid_documents_hash_unique').on(table.fileHash),
  submissionIdx: index('bid_documents_submission_idx').on(table.bidSubmissionId),
}));

export const documentExtractions = pgTable('document_extractions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => bidDocuments.id),
  fieldName: text('field_name').notNull(),
  fieldLabel: text('field_label').notNull(),
  extractedValue: text('extracted_value').notNull(),
  confidenceScore: numeric('confidence_score', { precision: 5, scale: 4, mode: 'number' }).notNull(),
  pageNumber: integer('page_number').notNull(),
  boundingCoordinates: text('bounding_coordinates'),
  ocrSnippet: text('ocr_snippet'),
  extractedAt: timestamp('extracted_at', { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => ({
  documentIdx: index('document_extractions_document_idx').on(table.documentId),
}));

export const sourceRecords = pgTable('source_records', {
  id: text('id').primaryKey(),
  adapterName: text('adapter_name').notNull(),
  identifierChecked: text('identifier_checked').notNull(),
  sourceType: text('source_type').notNull(),
  responsePayload: jsonb('response_payload').$type<Record<string, unknown>>().notNull(),
  statusCode: integer('status_code').notNull(),
  verifiedStatus: text('verified_status').notNull(),
  recordTimestamp: timestamp('record_timestamp', { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => ({
  identifierIdx: index('source_records_identifier_idx').on(table.adapterName, table.identifierChecked),
}));

export const verificationResults = pgTable('verification_results', {
  id: text('id').primaryKey(),
  bidSubmissionId: text('bid_submission_id').notNull().references(() => bidSubmissions.id),
  requirementId: text('requirement_id').notNull().references(() => tenderRequirements.id),
  status: text('status').notNull(),
  extractedValue: text('extracted_value').notNull(),
  requiredValue: text('required_value').notNull(),
  differenceSummary: text('difference_summary'),
  sourceType: text('source_type').notNull(),
  sourceAdapter: text('source_adapter').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true, mode: 'string' }).notNull(),
  ruleVersion: text('rule_version').notNull(),
  isKnockoutTriggered: boolean('is_knockout_triggered').notNull().default(false),
  officerOverridden: boolean('officer_overridden').notNull().default(false),
  overrideReason: text('override_reason'),
  overriddenByUserId: text('overridden_by_user_id').references(() => users.id),
  evidenceSnippet: text('evidence_snippet'),
  documentId: text('document_id').references(() => bidDocuments.id),
  pageNumber: integer('page_number'),
  aiExplanation: text('ai_explanation'),
}, (table) => ({
  submissionIdx: index('verification_results_submission_idx').on(table.bidSubmissionId),
}));

export const complianceScores = pgTable('compliance_scores', {
  id: text('id').primaryKey(),
  bidSubmissionId: text('bid_submission_id').notNull().references(() => bidSubmissions.id),
  totalRequirements: integer('total_requirements').notNull(),
  passedCount: integer('passed_count').notNull(),
  reviewCount: integer('review_count').notNull(),
  failedCount: integer('failed_count').notNull(),
  weightedScore: numeric('weighted_score', { precision: 5, scale: 2, mode: 'number' }).notNull(),
  riskScore: numeric('risk_score', { precision: 5, scale: 2, mode: 'number' }).notNull(),
  riskLevel: text('risk_level').notNull(),
  scoringVersion: text('scoring_version').notNull(),
  calculatedAt: timestamp('calculated_at', { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => ({
  submissionUnique: uniqueIndex('compliance_scores_submission_unique').on(table.bidSubmissionId),
}));

export const aiRecommendations = pgTable('ai_recommendations', {
  id: text('id').primaryKey(),
  bidSubmissionId: text('bid_submission_id').notNull().references(() => bidSubmissions.id),
  summary: text('summary').notNull(),
  suggestedAction: text('suggested_action').notNull(),
  keyFindings: jsonb('key_findings').$type<unknown[]>().notNull(),
  discrepancies: jsonb('discrepancies').$type<unknown[]>().notNull(),
  riskFactors: jsonb('risk_factors').$type<string[]>().notNull(),
  disclaimer: text('disclaimer').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => ({
  submissionIdx: index('ai_recommendations_submission_idx').on(table.bidSubmissionId),
}));

export const officerDecisions = pgTable('officer_decisions', {
  id: text('id').primaryKey(),
  bidSubmissionId: text('bid_submission_id').notNull().references(() => bidSubmissions.id),
  officerUserId: text('officer_user_id').notNull().references(() => users.id),
  officerName: text('officer_name').notNull(),
  officerDesignation: text('officer_designation').notNull(),
  decision: text('decision').notNull(),
  remarks: text('remarks').notNull(),
  clarificationSubject: text('clarification_subject'),
  clarificationDeadline: timestamp('clarification_deadline', { withTimezone: true, mode: 'string' }),
  overridesApplied: jsonb('overrides_applied').$type<unknown[]>().notNull(),
  decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => ({
  submissionIdx: index('officer_decisions_submission_idx').on(table.bidSubmissionId),
}));

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp', { withTimezone: true, mode: 'string' }).notNull(),
  actorUserId: text('actor_user_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  summary: text('summary').notNull(),
  details: jsonb('details').$type<Record<string, unknown>>(),
  evidenceHash: text('evidence_hash'),
  ruleVersion: text('rule_version'),
}, (table) => ({
  entityIdx: index('audit_events_entity_idx').on(table.entityType, table.entityId),
  timestampIdx: index('audit_events_timestamp_idx').on(table.timestamp),
}));

export const pgSchema = {
  organizations,
  users,
  tenders,
  tenderRequirements,
  bidders,
  bidSubmissions,
  bidDocuments,
  documentExtractions,
  sourceRecords,
  verificationResults,
  complianceScores,
  aiRecommendations,
  officerDecisions,
  auditEvents,
};
