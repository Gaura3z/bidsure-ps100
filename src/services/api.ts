/**
 * BIDSure - API Service Client
 * Provides robust communication with backend REST API and seamless offline fallback
 */

import {
  Tender,
  TenderRequirement,
  Bidder,
  BidSubmission,
  BidDocument,
  VerificationResult,
  OfficerDecision,
  AuditEvent,
  User,
} from '../types/index.ts';

const API_BASE = '/api';

type AdapterMode = 'LIVE' | 'MOCK' | 'MANUAL';
interface AdapterModesResponse { modes: Record<string, AdapterMode>; }
interface RequirementExtractionResponse { requirements: any[]; source?: string; }
interface VerificationPipelineResponse {
  submission?: BidSubmission;
  results?: VerificationResult[];
  score?: number;
  riskLevel?: string;
}

let activeRole: string = 'PROCUREMENT_OFFICER';
let activeUserId: string = 'usr-01';

export function setActiveUserContext(role: string, userId?: string) {
  activeRole = role;
  if (userId) activeUserId = userId;
}

export function getActiveUserContext() {
  return { role: activeRole, userId: activeUserId };
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 20000): Promise<T> {
  // Authorization is carried by the HttpOnly session cookie issued by /auth/login.
  // Do not send mutable role/user headers from the browser.
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(input, { ...init, credentials: 'same-origin', signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The secure service is waking up. Please try Sign In again in a few seconds.');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchHealth() {
  return requestJson(`${API_BASE}/health`);
}

export async function fetchSession() {
  return requestJson(`${API_BASE}/session`, undefined, 8000);
}

export async function loginAsRole(role: string, email?: string, password?: string) {
  const result = await requestJson<{ success: boolean; user: User }>(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, email, password }),
  });
  if (result?.user) {
    setActiveUserContext(result.user.role, result.user.id);
  }
  return result;
}

export async function logout() {
  return requestJson<{ success: boolean }>(`${API_BASE}/auth/logout`, { method: 'POST' }, 8000);
}

export async function fetchTenders(): Promise<Tender[]> {
  return requestJson<Tender[]>(`${API_BASE}/tenders`);
}

export async function fetchTenderDetails(id: string) {
  return requestJson(`${API_BASE}/tenders/${id}`);
}

export async function createTender(tenderData: Partial<Tender> & { requirements: any[] }): Promise<Tender> {
  return requestJson<Tender>(`${API_BASE}/tenders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tenderData),
  });
}

export async function applyForTender(tenderId: string): Promise<BidSubmission> {
  const result = await requestJson<{ submission: BidSubmission }>(`${API_BASE}/tenders/${encodeURIComponent(tenderId)}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return result.submission;
}

export async function extractRequirementsAI(tenderDocumentText: string, tenderTitle: string): Promise<RequirementExtractionResponse> {
  return requestJson<RequirementExtractionResponse>(`${API_BASE}/tenders/extract-requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenderDocumentText, tenderTitle }),
  });
}

export async function fetchBidders(): Promise<Bidder[]> {
  return requestJson<Bidder[]>(`${API_BASE}/bidders`);
}

export async function fetchSubmissions(): Promise<BidSubmission[]> {
  return requestJson<BidSubmission[]>(`${API_BASE}/submissions`);
}

export async function fetchBidderDetails(bidderId: string) {
  return requestJson(`${API_BASE}/bidders/${bidderId}`);
}

export async function fetchSourceAdapters(): Promise<AdapterModesResponse> {
  return requestJson<AdapterModesResponse>(`${API_BASE}/source-adapters`);
}

export async function updateAdapterMode(adapter: string, mode: AdapterMode): Promise<AdapterModesResponse> {
  return requestJson<AdapterModesResponse>(`${API_BASE}/source-adapters/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adapter, mode }),
  });
}

export async function runVerificationPipeline(submissionId: string): Promise<VerificationPipelineResponse> {
  return requestJson<VerificationPipelineResponse>(`${API_BASE}/compliance/run-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId }),
  });
}

export async function overrideVerificationResult(resultId: string, newStatus: string, reason: string) {
  return requestJson(`${API_BASE}/compliance/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultId, newStatus, reason }),
  });
}

export async function recordOfficerDecision(decisionData: {
  submissionId: string;
  decision: string;
  remarks: string;
  clarificationSubject?: string;
  clarificationDeadline?: string;
}) {
  return requestJson(`${API_BASE}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decisionData),
  });
}

export async function fetchAuditTrail(): Promise<AuditEvent[]> {
  return requestJson<AuditEvent[]>(`${API_BASE}/audit-trail`);
}

export async function respondToClarification(data: {
  submissionId: string;
  documentTitle: string;
  docType: string;
  remarks: string;
  file: File;
}) {
  const form = new FormData();
  form.append('submissionId', data.submissionId);
  form.append('documentTitle', data.documentTitle);
  form.append('docType', data.docType);
  form.append('remarks', data.remarks);
  form.append('file', data.file, data.file.name);
  return requestJson(`${API_BASE}/bidders/respond-clarification`, {
    method: 'POST',
    body: form,
  });
}
