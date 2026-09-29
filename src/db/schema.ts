/**
 * BIDSure - Database Schema Definition (PostgreSQL + Drizzle ORM)
 * SIH 2026 Problem Statement 26100: AI-Powered Integrated Bid Compliance Verification Platform
 */

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'CPSE' | 'CENTRAL_MINISTRY' | 'STATE_GOV' | 'BIDDER_ENTERPRISE';
  pan?: string;
  gstin?: string;
  address: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'PROCUREMENT_OFFICER' | 'COMPLIANCE_ANALYST' | 'BIDDER_VENDOR' | 'ADMIN';
  designation: string;
  department?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Tender {
  id: string;
  tenderId: string; // e.g. CPCL/IT/2026/042
  title: string;
  description: string;
  category: 'Goods' | 'Works' | 'Services' | 'Consultancy';
  estimatedValue: number; // in INR
  submissionDeadline: string;
  evaluationDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'EVALUATION' | 'DECIDED' | 'CANCELLED';
  createdByUserId: string;
  organizationId: string;
  documentUrl?: string;
  ruleVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenderRequirement {
  id: string;
  tenderId: string;
  clauseNumber: string; // e.g. Clause 4.2
  category: 'STATUTORY' | 'FINANCIAL' | 'TECHNICAL_EXPERIENCE' | 'OEM_AUTHORIZATION' | 'MAKE_IN_INDIA' | 'LABOUR_COMPLIANCE' | 'DEBARMENT_CHECK';
  title: string;
  description: string;
  isMandatory: boolean;
  isKnockout: boolean; // Immediate disqualifier if failed
  thresholdType: 'BOOLEAN' | 'MIN_NUMERIC' | 'MAX_NUMERIC' | 'EQUALS' | 'EXISTS' | 'DATE_AFTER';
  thresholdValue: string; // e.g. '50000000' (5 Cr), '3' (years), 'ACTIVE'
  evidenceDocType: string; // e.g. 'Turnover Certificate', 'GST Certificate'
  sourceAdapter: 'GSTN' | 'UDYAM' | 'MCA' | 'INCOME_TAX' | 'EPFO' | 'ESIC' | 'DIGILOCKER' | 'DEBARMENT' | 'MANUAL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number; // for score calculation
  ruleExpression: string;
  createdAt: string;
}

export interface Bidder {
  id: string;
  legalName: string;
  tradeName?: string;
  entityType: 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED' | 'PARTNERSHIP' | 'PROPRIETORSHIP' | 'LLP';
  cin?: string;
  pan: string;
  gstin: string;
  udyamNumber?: string;
  msmeCategory?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'NONE';
  location: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  annualTurnover?: number;
  incorporationDate: string;
  createdAt: string;
}

export interface BidSubmission {
  id: string;
  tenderId: string;
  bidderId: string;
  submissionRef: string; // e.g. BID/2026/CPCL/042-01
  status: 'SUBMITTED' | 'UNDER_VERIFICATION' | 'REVIEW_REQUIRED' | 'QUALIFIED' | 'DISQUALIFIED' | 'CLARIFICATION_REQUESTED';
  overallScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  checksPassed: number;
  checksReview: number;
  checksFailed: number;
  submittedAt: string;
  verifiedAt?: string;
  decidedAt?: string;
}

export interface BidDocument {
  id: string;
  bidSubmissionId: string;
  bidderId: string;
  docType: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  fileHash: string; // SHA-256 for audit integrity
  status: 'UPLOADED' | 'EXTRACTED' | 'VERIFIED' | 'FLAGGED' | 'EXPIRED';
  uploadedAt: string;
  previewUrl?: string;
  pageCount: number;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  fieldName: string; // e.g. 'turnover_amount', 'valid_upto', 'gstin'
  fieldLabel: string;
  extractedValue: string;
  confidenceScore: number; // 0.0 to 1.0
  pageNumber: number;
  boundingCoordinates?: string;
  ocrSnippet?: string;
  extractedAt: string;
}

export interface SourceRecord {
  id: string;
  adapterName: 'GSTN' | 'UDYAM' | 'MCA' | 'INCOME_TAX' | 'EPFO' | 'ESIC' | 'DIGILOCKER' | 'DEBARMENT';
  identifierChecked: string; // GSTIN, PAN, Udyam No, etc.
  sourceType: 'LIVE' | 'MOCK' | 'MANUAL';
  responsePayload: Record<string, any>;
  statusCode: number;
  verifiedStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'NOT_FOUND' | 'DEBARRED' | 'SUSPENDED';
  recordTimestamp: string;
}

export interface VerificationResult {
  id: string;
  bidSubmissionId: string;
  requirementId: string;
  status: 'PASS' | 'FAIL' | 'NEEDS_REVIEW' | 'NOT_APPLICABLE' | 'UNVERIFIED';
  extractedValue: string;
  requiredValue: string;
  differenceSummary?: string;
  sourceType: 'LIVE' | 'MOCK' | 'MANUAL';
  sourceAdapter: string;
  sourceTimestamp: string;
  ruleVersion: string;
  isKnockoutTriggered: boolean;
  officerOverridden: boolean;
  overrideReason?: string;
  overriddenByUserId?: string;
  evidenceSnippet?: string;
  documentId?: string;
  pageNumber?: number;
  aiExplanation?: string;
}

export interface ComplianceScore {
  id: string;
  bidSubmissionId: string;
  totalRequirements: number;
  passedCount: number;
  reviewCount: number;
  failedCount: number;
  weightedScore: number; // 0-100
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  scoringVersion: string;
  calculatedAt: string;
}

export interface AIRecommendation {
  id: string;
  bidSubmissionId: string;
  summary: string;
  suggestedAction: 'APPROVE' | 'REJECT' | 'SEND_CLARIFICATION' | 'MANUAL_REVIEW';
  keyFindings: Array<{
    type: 'SUCCESS' | 'WARNING' | 'CRITICAL';
    title: string;
    description: string;
    requirementId?: string;
  }>;
  discrepancies: Array<{
    field: string;
    docA: string;
    valueA: string;
    docB: string;
    valueB: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  riskFactors: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface OfficerDecision {
  id: string;
  bidSubmissionId: string;
  officerUserId: string;
  officerName: string;
  officerDesignation: string;
  decision: 'APPROVE_QUALIFIED' | 'REJECT_DISQUALIFIED' | 'SEND_CLARIFICATION' | 'KEEP_UNDER_REVIEW';
  remarks: string;
  clarificationSubject?: string;
  clarificationDeadline?: string;
  overridesApplied: Array<{
    requirementId: string;
    oldStatus: string;
    newStatus: string;
    reason: string;
  }>;
  decidedAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'TENDER' | 'BID_SUBMISSION' | 'DOCUMENT' | 'VERIFICATION' | 'DECISION' | 'ADAPTER';
  entityId: string;
  summary: string;
  details?: Record<string, any>;
  evidenceHash?: string;
  ruleVersion?: string;
}
