import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import multer from 'multer';
import { storage } from './src/db/storage.ts';
import { persistBidApplication, persistBidEvidence, persistTenderCreation, persistVerification } from './src/db/postgresStorage.ts';
import { aiProvider } from './src/services/aiProvider.ts';
import { storeDocument } from './src/services/documentStorage.ts';
import { extractTextWithConfiguredOcr, scanForMalware } from './src/services/documentPipeline.ts';
import { createClient } from '@supabase/supabase-js';
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
} from './src/db/schema.ts';

// Render secret files are mounted outside the working directory. Load them first
// so production can keep AI/database credentials out of the image and repository.
dotenv.config({ path: '/etc/secrets/.env' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_COOKIE = 'bidsure_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const AUTH_MODE = process.env.AUTH_MODE || 'demo';
const sessions = new Map<string, { userId: string; expiresAt: number }>();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.use(express.json({ limit: '10mb' }));

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie || '';
  const pair = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : undefined;
}

function issueSession(res: Response, user: User) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);
}

function resolveSession(req: Request) {
  const token = readCookie(req, SESSION_COOKIE);
  const session = token ? sessions.get(token) : undefined;
  if (!session) return undefined;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token!);
    return undefined;
  }
  return db.users.find((candidate) => candidate.id === session.userId);
}

// Access persistent storage engine (persisted in data/bidsure_store.json)
const db = storage.getDb();

// Helper for audit events (persisted automatically)
function logAuditEvent(
  action: string,
  entityType: AuditEvent['entityType'],
  entityId: string,
  summary: string,
  actor?: User,
  details?: Record<string, any>,
  persist = true
) {
  const currentActor = actor || db.currentUser;
  const event: AuditEvent = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorUserId: currentActor.id,
    actorName: currentActor.name,
    actorRole: currentActor.role,
    action,
    entityType,
    entityId,
    summary,
    details,
    ruleVersion: 'v2.4-2026',
    evidenceHash: details?.hash || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  };
  db.auditEvents.unshift(event);
  if (persist) storage.save();
  return event;
}

// RBAC & Actor extraction helper
function getActorContext(req: Request) {
  const user = resolveSession(req);
  return {
    authenticated: Boolean(user),
    role: user?.role || db.currentUser?.role || 'PROCUREMENT_OFFICER',
    userId: user?.id || db.currentUser?.id || 'usr-01',
    user: user || db.currentUser,
  };
}

function requireRole(req: Request, res: Response, roles: User['role'][]) {
  const actor = getActorContext(req);
  if (!actor.authenticated || !roles.includes(actor.role as User['role'])) {
    res.status(401).json({ error: 'Authentication required for this action.' });
    return undefined;
  }
  return actor;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  // Health must never depend on a remote AI request. A bad key or provider
  // timeout should not make the application appear offline.
  const diagnostic = aiProvider.getConfigurationSnapshot();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BIDSure Compliance Engine',
    version: db.version || '2.4.0',
    persistentStorage: true,
    lastSavedAt: db.lastSavedAt,
    aiProvider: {
      configured: diagnostic.configured,
      model: diagnostic.model,
      activeProvider: diagnostic.activeProvider,
      failoverReady: diagnostic.failoverReady,
      mode: diagnostic.mode,
    },
  });
});

// Gemini Status & Multi-Key Failover Diagnostic
app.get('/api/gemini/status', async (_req: Request, res: Response) => {
  try {
    const diagnostic = await aiProvider.checkHealth();
    // Do not expose key fragments or provider internals on a public route.
    res.json({
      configured: diagnostic.configured,
      model: diagnostic.model,
      activeProvider: diagnostic.activeProvider,
      failoverReady: diagnostic.failoverReady,
      mode: diagnostic.mode,
      latencyMs: diagnostic.latencyMs,
      message: diagnostic.message,
    });
  } catch (err: any) {
    res.json({
      configured: false,
      model: aiProvider.getModelName(),
      activeProvider: 'NONE',
      primaryConfigured: false,
      secondaryConfigured: false,
      primaryMasked: null,
      secondaryMasked: null,
      failoverReady: false,
      mode: 'DETERMINISTIC_GROUNDED_FALLBACK',
      message: 'Using deterministic compliance engine as fallback.',
    });
  }
});

// Explicit Failover QA Test Endpoint (Verifies Case A, Case B, Case C, Case D)
app.post('/api/gemini/test-failover', async (req: Request, res: Response) => {
  if (!requireRole(req, res, ['ADMIN'])) return;
  const { simulatePrimaryFailure = false } = req.body;
  try {
    const start = Date.now();
    const result = await aiProvider.generateContent(
      'State "OK: BID COMPLIANCE SYSTEM ONLINE" in 6 words or less.',
      undefined,
      simulatePrimaryFailure
    );
    const latencyMs = Date.now() - start;

    res.json({
      success: true,
      simulationActive: simulatePrimaryFailure,
      providerUsed: result.providerUsed,
      failoverOccurred: result.failoverOccurred,
      latencyMs,
      response: result.text.trim(),
      message: result.failoverOccurred
        ? `Failover successfully triggered: Provider ${result.providerUsed} responded.`
        : `Primary provider responded successfully in ${latencyMs}ms.`,
    });
  } catch (err: any) {
    res.json({
      success: false,
      simulationActive: simulatePrimaryFailure,
      fallbackActive: true,
      error: 'AI providers unavailable or rejected the request. No provider details are exposed.',
      fallbackResponse: 'DETERMINISTIC_COMPLIANCE_FALLBACK_ACTIVE',
      message: 'All AI providers failed. Platform safely fell back to deterministic compliance rules engine.',
    });
  }
});

// Database Factory Reset Endpoint
app.post('/api/database/reset', (req: Request, res: Response) => {
  if (!requireRole(req, res, ['ADMIN'])) return;
  const resetDb = storage.resetFactory();
  logAuditEvent('DATABASE_RESET', 'TENDER', 'system', 'Database restored to factory mock seeds.', getActorContext(req).user);
  res.json({ success: true, message: 'Database reset to factory seeds successfully.', lastSavedAt: resetDb.lastSavedAt });
});

// Auth & Session
app.get('/api/session', (req: Request, res: Response) => {
  const sessionUser = resolveSession(req);
  if (!sessionUser) {
    if (AUTH_MODE !== 'demo') {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    issueSession(res, db.currentUser);
  }
  res.json({
    currentUser: sessionUser || db.currentUser,
    users: db.users,
    organization: db.organization,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  let user: User | undefined;

  if (AUTH_MODE === 'supabase') {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return res.status(503).json({ error: 'Supabase authentication is not configured.' });
    if (!normalizedEmail || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Enter a valid email and password.' });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return supabase.auth.signInWithPassword({ email: normalizedEmail, password }).then(({ data, error }) => {
      if (error || !data.user?.email) return res.status(401).json({ error: 'Invalid email or password.' });
      user = db.users.find((candidate) => candidate.email.toLowerCase() === data.user!.email!.toLowerCase());
      if (!user) return res.status(403).json({ error: 'This account is not mapped to an approved BidSure role.' });
      db.currentUser = user;
      issueSession(res, user);
      storage.save();
      logAuditEvent('USER_LOGIN', 'TENDER', user.id, `${user.name} (${user.role}) logged in to BIDSure workbench.`, user);
      return res.json({ success: true, user });
    }).catch(() => res.status(401).json({ error: 'Authentication service unavailable.' }));
  }

  user = db.users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.role === role)
    || db.users.find((candidate) => candidate.role === role)
    || db.users[0];
  db.currentUser = user;
  issueSession(res, user);
  storage.save();
  logAuditEvent('USER_LOGIN', 'TENDER', user.id, `${user.name} (${user.role}) logged in to BIDSure workbench.`, user);
  res.json({ success: true, user: db.currentUser });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  res.json({ success: true });
});

// Public registration is an access request, never an automatic privileged account creation.
// An officer/admin must approve and provision the Supabase account separately.
app.post('/api/auth/register-request', (req: Request, res: Response) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const organization = typeof req.body?.organization === 'string' ? req.body.organization.trim() : '';
  const requestedRole = req.body?.requestedRole === 'COMPLIANCE_ANALYST' ? 'COMPLIANCE_ANALYST' : 'BIDDER_VENDOR';
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || organization.length < 2) {
    return res.status(400).json({ error: 'Enter your name, a valid email, and organization.' });
  }
  const requestId = `REG-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  logAuditEvent('REGISTRATION_REQUESTED', 'USER', requestId, `Access request submitted for ${email}.`, undefined, {
    email,
    organization,
    requestedRole,
    status: 'PENDING_APPROVAL',
  });
  return res.status(201).json({ success: true, requestId, message: 'Your request was submitted for administrator approval.' });
});

// Production authentication boundary. Supabase verifies Google OAuth; BidSure maps the verified email to a database role.
app.get('/api/auth/google/start', async (_req: Request, res: Response) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Google authentication is not configured yet.' });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback` },
  });
  if (error || !data.url) return res.status(503).json({ error: 'Google authentication could not be started.' });
  res.redirect(data.url);
});

app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!code || !url || !key) return res.status(400).send('Google authentication configuration is incomplete.');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  const user = email ? db.users.find((candidate) => candidate.email.toLowerCase() === email) : undefined;
  if (error || !user) return res.status(403).send('Google account is not mapped to an approved BidSure user.');
  issueSession(res, user);
  res.redirect('/');
});

// Tenders
app.get('/api/tenders', (_req: Request, res: Response) => {
  const tendersWithStats = db.tenders.map((tender) => {
    const subs = db.submissions.filter((s) => s.tenderId === tender.id);
    const issuesCount = subs.filter((s) => s.riskLevel === 'HIGH' || s.status === 'REVIEW_REQUIRED').length;
    return {
      ...tender,
      biddersCount: subs.length,
      issuesCount,
    };
  });
  res.json(tendersWithStats);
});

app.get('/api/tenders/:id', (req: Request, res: Response) => {
  const tender = db.tenders.find((t) => t.id === req.params.id);
  if (!tender) return res.status(404).json({ error: 'Tender not found' });
  const requirements = db.requirements.filter((r) => r.tenderId === tender.id);
  const submissions = db.submissions.filter((s) => s.tenderId === tender.id);
  res.json({ tender, requirements, submissions });
});

app.post('/api/tenders', async (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER']);
  if (!actor) return;
  const { user } = actor;
  if (actor.role !== 'PROCUREMENT_OFFICER') {
    return res.status(403).json({
      error: `Access Denied: Role '${actor.role}' (${user.name}) is not authorized to create or publish tenders. Under GFR 2017 & GeM guidelines, only Procurement Officers hold statutory tender publication authority.`,
    });
  }

  const { tenderId, title, description, category, estimatedValue, submissionDeadline, requirements } = req.body;
  const publishedTenderId = tenderId || `CPCL/IT/2026/${Math.floor(100 + Math.random() * 900)}`;
  if (db.tenders.some((tender) => tender.tenderId.toLowerCase() === String(publishedTenderId).trim().toLowerCase())) {
    return res.status(409).json({ error: `Tender ID ${publishedTenderId} is already in use. Change the Tender ID and try publishing again.` });
  }
  const newTender: Tender = {
    id: `tender-${Date.now()}`,
    tenderId: String(publishedTenderId).trim(),
    title,
    description: description || 'Procurement requirement published on GeM portal.',
    category: category || 'Goods',
    estimatedValue: Number(estimatedValue) || 50000000,
    submissionDeadline: submissionDeadline || new Date(Date.now() + 30 * 86400000).toISOString(),
    evaluationDate: new Date().toISOString(),
    status: 'EVALUATION',
    createdByUserId: user.id,
    organizationId: db.organization.id,
    ruleVersion: 'v2.4-2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newRequirements: TenderRequirement[] = Array.isArray(requirements) ? requirements.map((reqItem: any, idx: number) => ({
    id: `req-${newTender.id}-${idx}`,
    tenderId: newTender.id,
    clauseNumber: reqItem.clauseNumber || `Clause ${idx + 1}.1`,
    category: reqItem.category || 'STATUTORY',
    title: reqItem.title,
    description: reqItem.description,
    isMandatory: reqItem.isMandatory ?? true,
    isKnockout: reqItem.isKnockout ?? true,
    thresholdType: reqItem.thresholdType || 'EQUALS',
    thresholdValue: reqItem.thresholdValue || 'REQUIRED',
    evidenceDocType: reqItem.evidenceDocType || 'Certificate',
    sourceAdapter: reqItem.sourceAdapter || 'MANUAL',
    severity: reqItem.severity || 'HIGH',
    weight: reqItem.weight || 10,
    ruleExpression: reqItem.ruleExpression || 'verified == true',
    createdAt: new Date().toISOString(),
  })) : [];

  let tenderAuditId: string | undefined;
  try {
    const tenderAudit = logAuditEvent('TENDER_CREATED', 'TENDER', newTender.id, `Tender ${newTender.tenderId} created with ${newRequirements.length} requirements.`, user, undefined, false);
    tenderAuditId = tenderAudit.id;
    if (process.env.STORAGE_MODE === 'postgres') {
      await persistTenderCreation(newTender, newRequirements, tenderAudit);
    } else {
      db.tenders.unshift(newTender);
      db.requirements.push(...newRequirements);
      await storage.save();
    }
    if (process.env.STORAGE_MODE === 'postgres') {
      db.tenders.unshift(newTender);
      db.requirements.push(...newRequirements);
    }
    res.status(201).json({ ...newTender, requirements: newRequirements });
  } catch (error: any) {
    if (tenderAuditId) db.auditEvents = db.auditEvents.filter((event) => event.id !== tenderAuditId);
    console.error('[BIDSure API] Tender publish failed:', error?.message || error);
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'This Tender ID or requirement already exists. Refresh the tender list, change the Tender ID, and try again.' });
    }
    res.status(503).json({ error: 'Tender could not be saved. The deployment database is temporarily unavailable; your tender was not published. Please retry in a moment.' });
  }
});

app.post('/api/tenders/:id/apply', async (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['BIDDER_VENDOR']);
  if (!actor) return;
  const tender = db.tenders.find((candidate) => candidate.id === req.params.id);
  if (!tender) return res.status(404).json({ error: 'Tender not found.' });
  const bidderId = actor.user?.id === 'user-bidder-01' ? 'bidder-01' : undefined;
  if (!bidderId) return res.status(403).json({ error: 'Your bidder profile is not linked to a vendor record.' });
  const existing = db.submissions.find((submission) => submission.tenderId === tender.id && submission.bidderId === bidderId);
  if (existing) return res.json({ success: true, submission: existing, alreadyApplied: true });
  const submission: BidSubmission = {
    id: `sub-${Date.now()}`,
    tenderId: tender.id,
    bidderId,
    submissionRef: `BID/${new Date().getFullYear()}/${tender.tenderId.replace(/[^A-Z0-9]+/gi, '-')}-01`,
    status: 'UNDER_VERIFICATION',
    overallScore: 0,
    riskLevel: 'MEDIUM',
    checksPassed: 0,
    checksReview: 0,
    checksFailed: 0,
    submittedAt: new Date().toISOString(),
  };
  db.submissions.unshift(submission);
  const tenderRequirements = db.requirements.filter((requirement) => requirement.tenderId === tender.id);
  for (const requirement of tenderRequirements) {
    db.verificationResults.push({
      id: `result-${submission.id}-${requirement.id}`,
      bidSubmissionId: submission.id,
      requirementId: requirement.id,
      status: 'UNVERIFIED',
      extractedValue: 'Document not submitted',
      requiredValue: requirement.evidenceDocType,
      sourceType: requirement.sourceAdapter === 'MANUAL' ? 'MANUAL' : 'MOCK',
      sourceAdapter: requirement.sourceAdapter,
      sourceTimestamp: new Date().toISOString(),
      ruleVersion: tender.ruleVersion,
      isKnockoutTriggered: false,
      officerOverridden: false,
      aiExplanation: 'Evidence is required before compliance can be assessed.',
    });
  }
  const auditEvent = logAuditEvent('BID_SUBMITTED', 'BID_SUBMISSION', submission.id, `${actor.user.name} applied for tender ${tender.tenderId}.`, actor.user, undefined, false);
  if (process.env.STORAGE_MODE === 'postgres') await persistBidApplication(submission, db.verificationResults.filter((result) => result.bidSubmissionId === submission.id), auditEvent);
  else await storage.save();
  res.status(201).json({ success: true, submission });
});

// AI Requirement Clause Extraction using Gemini API
app.post('/api/tenders/extract-requirements', async (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER', 'COMPLIANCE_ANALYST']);
  if (!actor) return;
  const { tenderDocumentText, tenderTitle } = req.body;

  try {
    const prompt = `You are a Senior Government Procurement Specialist for Indian GeM (Government e-Marketplace) and CPSE compliance.
Analyze this tender brief and extract 5 to 8 structured, unambiguous compliance clauses.
Return ONLY valid JSON matching this schema:
[
  {
    "clauseNumber": "Clause 3.1",
    "category": "STATUTORY" | "FINANCIAL" | "TECHNICAL_EXPERIENCE" | "OEM_AUTHORIZATION" | "MAKE_IN_INDIA" | "LABOUR_COMPLIANCE" | "DEBARMENT_CHECK",
    "title": "Short title",
    "description": "Clear statement of requirement",
    "isMandatory": true,
    "isKnockout": true,
    "thresholdType": "MIN_NUMERIC" | "EQUALS" | "EXISTS",
    "thresholdValue": "50000000",
    "evidenceDocType": "Turnover Certificate",
    "sourceAdapter": "GSTN" | "UDYAM" | "MCA" | "INCOME_TAX" | "EPFO" | "ESIC" | "DEBARMENT" | "MANUAL",
    "severity": "CRITICAL" | "HIGH" | "MEDIUM"
  }
]

Tender Title: ${tenderTitle || 'IT Infrastructure Procurement'}
Tender Text:
${tenderDocumentText || 'Supply of Enterprise Blade Servers, Storage Area Network, and Switch Fabrics. Minimum 3 years experience in CPSE supply. Audited turnover not less than 5 Crore INR for last 3 years. Active GSTIN and valid PAN. Manufacturer Authorization Form (MAF) required from OEM with 5 year warranty.'}`;

    const response = await aiProvider.generateContent(prompt, { responseMimeType: 'application/json' });
    const parsed = JSON.parse(response.text || '[]');
    return res.json({ requirements: parsed, source: 'GEMINI_AI', providerUsed: response.providerUsed });
  } catch (error) {
    console.warn('[BIDSure AI] Clause extraction using fallback:', error);
  }

  // Deterministic fallback if Gemini is offline
  res.json({
    requirements: [
      {
        clauseNumber: 'Clause 3.1',
        category: 'STATUTORY',
        title: 'GST Registration Verification',
        description: 'Bidder must possess active and regular GSTIN registration.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'EQUALS',
        thresholdValue: 'ACTIVE',
        evidenceDocType: 'GST Certificate',
        sourceAdapter: 'GSTN',
        severity: 'CRITICAL',
      },
      {
        clauseNumber: 'Clause 3.2',
        category: 'STATUTORY',
        title: 'PAN Verification & IT Return',
        description: 'Valid PAN registered to company entity and last 2 years ITR acknowledgements.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'EQUALS',
        thresholdValue: 'FILED',
        evidenceDocType: 'PAN Card & ITR',
        sourceAdapter: 'INCOME_TAX',
        severity: 'CRITICAL',
      },
      {
        clauseNumber: 'Clause 5.1',
        category: 'FINANCIAL',
        title: 'Minimum Annual Turnover',
        description: 'Audited CA turnover of minimum ₹5.00 Crore for past 3 financial years.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'MIN_NUMERIC',
        thresholdValue: '50000000',
        evidenceDocType: 'Turnover Certificate',
        sourceAdapter: 'MANUAL',
        severity: 'CRITICAL',
      },
      {
        clauseNumber: 'Clause 6.1',
        category: 'TECHNICAL_EXPERIENCE',
        title: 'Relevant Past Experience',
        description: 'Minimum 3 years past experience executing CPSE or Central Government contracts.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'MIN_NUMERIC',
        thresholdValue: '3',
        evidenceDocType: 'Experience Certificate',
        sourceAdapter: 'MANUAL',
        severity: 'HIGH',
      },
      {
        clauseNumber: 'Clause 7.1',
        category: 'OEM_AUTHORIZATION',
        title: 'OEM Authorization Form (MAF)',
        description: 'Back-to-back 5-year comprehensive manufacturer authorization with clear seal.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'EQUALS',
        thresholdValue: 'VALID',
        evidenceDocType: 'OEM Authorization',
        sourceAdapter: 'MANUAL',
        severity: 'CRITICAL',
      },
      {
        clauseNumber: 'Clause 10.1',
        category: 'DEBARMENT_CHECK',
        title: 'Debarment & Non-Blacklisting Check',
        description: 'Must not be blacklisted or debarred by any Central/State Ministry or GeM.',
        isMandatory: true,
        isKnockout: true,
        thresholdType: 'EQUALS',
        thresholdValue: 'CLEARED',
        evidenceDocType: 'Non-Blacklisting Declaration',
        sourceAdapter: 'DEBARMENT',
        severity: 'CRITICAL',
      },
    ],
    source: 'DETERMINISTIC_RULES_ENGINE',
  });
});

// Bidders & Submissions
app.get('/api/bidders', (req: Request, res: Response) => {
  const { role } = getActorContext(req);
  if (role === 'BIDDER_VENDOR') {
    // Under GFR 2017 Rule 173 and GeM integrity guidelines, competing bids are strictly confidential.
    const vendorBidders = db.bidders.filter((b) => b.id === 'bidder-01');
    return res.json(vendorBidders);
  }
  res.json(db.bidders);
});

app.get('/api/bidders/:id', (req: Request, res: Response) => {
  const { role } = getActorContext(req);
  if (role === 'BIDDER_VENDOR' && req.params.id !== 'bidder-01') {
    return res.status(403).json({
      error: 'Access Denied: Under GFR 2017 Rule 173 and GeM integrity guidelines, competing bidder submissions and evaluation reports are strictly confidential.',
    });
  }

  const bidder = db.bidders.find((b) => b.id === req.params.id);
  if (!bidder) return res.status(404).json({ error: 'Bidder not found' });
  const submission = db.submissions.find((s) => s.bidderId === bidder.id);
  const documents = db.documents.filter((d) => d.bidderId === bidder.id);
  const results = submission ? db.verificationResults.filter((r) => r.bidSubmissionId === submission.id) : [];
  res.json({ bidder, submission, documents, results });
});

app.get('/api/submissions', (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER', 'COMPLIANCE_ANALYST', 'BIDDER_VENDOR', 'ADMIN']);
  if (!actor) return;
  const submissions = actor.role === 'BIDDER_VENDOR'
    ? db.submissions.filter((submission) => submission.bidderId === 'bidder-01')
    : db.submissions;
  res.json(submissions);
});

// Source Adapter Gateway: Get list & toggle modes (LIVE, MOCK, MANUAL)
app.get('/api/source-adapters', (req: Request, res: Response) => {
  if (!getActorContext(req).authenticated) {
    return res.status(401).json({ error: 'Authentication required to inspect statutory adapter records.' });
  }
  res.json({
    modes: db.sourceAdapterModes,
    records: db.sourceRecords,
    disclaimer:
      'CRITICAL COMPLIANCE NOTICE: Every external statutory record is labelled with its exact provenance (LIVE, MOCK or MANUAL). Under SIH demonstration rules, simulated mock responses emulate official API schemas without bypassing restricted government firewalls.',
  });
});

app.post('/api/source-adapters/mode', (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['ADMIN', 'PROCUREMENT_OFFICER']);
  if (!actor) return;
  const { role, user } = actor;
  if (role !== 'ADMIN' && role !== 'PROCUREMENT_OFFICER') {
    return res.status(403).json({
      error: `Access Denied: Role '${role}' (${user.name}) is not authorized to alter statutory source adapter modes. Restricted to Administrators and Procurement Officers.`,
    });
  }

  const { adapter, mode } = req.body;
  if (db.sourceAdapterModes[adapter] && ['LIVE', 'MOCK', 'MANUAL'].includes(mode)) {
    db.sourceAdapterModes[adapter] = mode;
    logAuditEvent('ADAPTER_MODE_CHANGED', 'ADAPTER', adapter, `Adapter ${adapter} mode updated to ${mode}.`, user);
    storage.save();
    return res.json({ success: true, modes: db.sourceAdapterModes });
  }
  res.status(400).json({ error: 'Invalid adapter or mode' });
});

// Run AI + Deterministic Verification Pipeline
app.post('/api/compliance/run-verification', async (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER', 'COMPLIANCE_ANALYST']);
  if (!actor) return;
  const { submissionId } = req.body;
  const submission = db.submissions.find((s) => s.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const bidder = db.bidders.find((b) => b.id === submission.bidderId);
  const results = db.verificationResults.filter((r) => r.bidSubmissionId === submission.id);

  // Deterministic Recalculation
  let passed = 0;
  let review = 0;
  let failed = 0;
  let totalScoreWeight = 0;
  let earnedScoreWeight = 0;

  results.forEach((r) => {
    const reqItem = db.requirements.find((rq) => rq.id === r.requirementId);
    const weight = reqItem?.weight || 10;
    totalScoreWeight += weight;

    if (r.status === 'PASS') {
      passed++;
      earnedScoreWeight += weight;
    } else if (r.status === 'NEEDS_REVIEW') {
      review++;
      earnedScoreWeight += weight * 0.5;
    } else if (r.status === 'UNVERIFIED') {
      review++;
    } else if (r.status === 'FAIL') {
      failed++;
    }
  });

  const finalScore = Math.round((earnedScoreWeight / (totalScoreWeight || 1)) * 100);
  const hasKnockoutFailure = results.some((r) => r.status === 'FAIL' && r.isKnockoutTriggered);

  submission.overallScore = finalScore;
  submission.checksPassed = passed;
  submission.checksReview = review;
  submission.checksFailed = failed;
  submission.riskLevel = hasKnockoutFailure || failed > 1 ? 'HIGH' : review > 0 ? 'MEDIUM' : 'LOW';
  submission.status = hasKnockoutFailure || review > 0 ? 'REVIEW_REQUIRED' : 'QUALIFIED';
  submission.verifiedAt = new Date().toISOString();

  const scoreRecord = {
    id: `score-${submission.id}`,
    bidSubmissionId: submission.id,
    totalRequirements: results.length,
    passedCount: passed,
    reviewCount: review,
    failedCount: failed,
    weightedScore: finalScore,
    riskScore: Math.max(0, 100 - finalScore),
    riskLevel: submission.riskLevel,
    scoringVersion: 'v2.4-2026',
    calculatedAt: new Date().toISOString(),
  } as any;
  db.complianceScores = [
    ...db.complianceScores.filter((score: any) => score.bidSubmissionId !== submission.id),
    scoreRecord,
  ];

  // Grounded AI Explanation using Gemini
  let aiSummary = '';
  let keyFindings: string[] = [];

  try {
    if (bidder) {
      const prompt = `You are a compliance assistant for a Government of India CPSE Procurement Officer.
Explain the compliance status of bidder "${bidder.legalName}" based strictly on the following factual results.
DO NOT hallucinate or invent any document that is not listed.

Bidder: ${bidder.legalName} (${bidder.entityType})
Score: ${finalScore}%
Risk Level: ${submission.riskLevel}
Failed Checks: ${results.filter((r) => r.status === 'FAIL').map((r) => `${r.requiredValue}: Extracted=${r.extractedValue}`).join('; ') || 'None'}
Review Checks: ${results.filter((r) => r.status === 'NEEDS_REVIEW').map((r) => `${r.requiredValue}: ${r.extractedValue}`).join('; ') || 'None'}
Passed Checks: ${passed} checks passed.

Output a structured JSON response:
{
  "summary": "2-3 concise sentences summarizing status and core compliance gap",
  "keyFindings": ["3 to 5 grounded bullet points with exact figures"],
  "recommendedAction": "APPROVE" | "REJECT" | "SEND_CLARIFICATION" | "MANUAL_REVIEW"
}`;

      const aiResponse = await aiProvider.generateContent(prompt, { responseMimeType: 'application/json' });
      const parsed = JSON.parse(aiResponse.text || '{}');
      aiSummary = parsed.summary;
      keyFindings = parsed.keyFindings || [];
    }
  } catch (err) {
    console.warn('[BIDSure AI] Gemini explanation using fallback:', err);
  }

  if (!aiSummary) {
    const notSubmitted = results.filter((result) => result.status === 'UNVERIFIED').length;
    aiSummary = notSubmitted
      ? `${notSubmitted} tender requirement(s) still need document evidence. The bid remains under review; no qualification decision is inferred from missing files. Current score: ${finalScore}%.`
      : `The deterministic rules engine assessed ${results.length} requirement(s): ${passed} passed, ${review} need review, and ${failed} failed. Final officer review is required for outstanding findings. Current score: ${finalScore}%.`;
    keyFindings = notSubmitted
      ? [`Evidence is missing for ${notSubmitted} requirement(s).`, 'Upload the requested files before the officer completes the review.']
      : [`${passed} requirement(s) passed.`, `${review} requirement(s) need review.`, `${failed} requirement(s) failed.`];
  }

  const recommendationRecord = {
    id: `ai-${submission.id}`,
    bidSubmissionId: submission.id,
    summary: aiSummary,
    suggestedAction: submission.status === 'QUALIFIED' ? 'APPROVE' : failed > 0 ? 'MANUAL_REVIEW' : 'SEND_CLARIFICATION',
    keyFindings: keyFindings.map((finding) => ({ type: 'WARNING', title: 'Compliance finding', description: finding })),
    discrepancies: [],
    riskFactors: [submission.riskLevel],
    disclaimer: 'AI output is advisory. Final procurement decisions remain with the authorized officer.',
    generatedAt: new Date().toISOString(),
  } as any;
  db.aiRecommendations = [
    ...db.aiRecommendations.filter((recommendation: any) => recommendation.bidSubmissionId !== submission.id),
    recommendationRecord,
  ];

  const verificationAudit = logAuditEvent(
    'VERIFICATION_EXECUTED',
    'VERIFICATION',
    submission.id,
    `AI verification and deterministic rules engine completed. Score: ${finalScore}%, Risk: ${submission.riskLevel}.`,
    undefined,
    undefined,
    false
  );
  if (process.env.STORAGE_MODE === 'postgres') await persistVerification(submission, results, scoreRecord, recommendationRecord, verificationAudit);
  else await storage.save();

  res.json({
    submission,
    results,
    score: finalScore,
    riskLevel: submission.riskLevel,
    aiSummary,
    keyFindings,
  });
});

// Vendor Clarification & Evidence Submission
app.post('/api/bidders/respond-clarification', upload.single('file'), async (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['BIDDER_VENDOR']);
  if (!actor) return;
  const { user } = actor;
  const { submissionId, documentTitle, docType, remarks } = req.body;

  const submission = db.submissions.find((s) => s.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  if (user.id !== 'user-bidder-01' || submission.bidderId !== 'bidder-01') {
    return res.status(403).json({ error: 'You may only submit clarification evidence for your own bidder account.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'A PDF or image evidence file is required.' });
  }

  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

  // Scan before durable storage so rejected files never enter local or object storage.
  const malware = await scanForMalware(req.file.buffer);
  if (malware.status === 'INFECTED') {
    return res.status(422).json({ error: 'The uploaded document failed malware scanning.', scanEngine: malware.engine });
  }
  if (malware.status === 'FAILED') {
    return res.status(503).json({ error: 'Malware scanning failed. The document was not stored.', scanEngine: malware.engine });
  }

  const documentId = `doc-${Date.now()}`;
  let stored;
  try {
    stored = await storeDocument({
      submissionId: submission.id,
      documentId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
    });
  } catch (error: any) {
    return res.status(503).json({ error: error?.message || 'Document storage is unavailable.' });
  }

  const ocr = await extractTextWithConfiguredOcr({ buffer: req.file.buffer, mimeType: req.file.mimetype, documentId });

  let evidenceReview: Record<string, any> = {
    status: 'NOT_PROCESSED',
    message: ocr.status === 'NOT_CONFIGURED' ? 'OCR is not configured on this deployment; an officer must inspect this evidence manually.' : 'Evidence is stored and awaiting officer review.',
    provider: ocr.engine,
  };
  if ('text' in ocr && typeof ocr.text === 'string' && ocr.text.trim()) {
    try {
      const aiResponse = await aiProvider.generateContent(`You are reviewing one bidder clarification document for a procurement compliance workflow. Use only the OCR text below. Do not decide the tender outcome. Return JSON with status (SUPPORTS_CLAIM, DOES_NOT_SUPPORT, or NEEDS_MANUAL_REVIEW), summary, and extractedFacts (array of strings).\n\nDocument type: ${docType || 'Clarification evidence'}\nBidder remarks: ${remarks || ''}\nOCR text:\n${ocr.text.slice(0, 16000)}`, { responseMimeType: 'application/json' });
      const parsed = JSON.parse(aiResponse.text || '{}');
      evidenceReview = {
        status: ['SUPPORTS_CLAIM', 'DOES_NOT_SUPPORT', 'NEEDS_MANUAL_REVIEW'].includes(parsed.status) ? parsed.status : 'NEEDS_MANUAL_REVIEW',
        message: parsed.summary || 'AI extracted evidence facts for officer review.',
        extractedFacts: Array.isArray(parsed.extractedFacts) ? parsed.extractedFacts.slice(0, 8) : [],
        provider: aiResponse.providerUsed,
      };
    } catch (error: any) {
      evidenceReview = { status: 'NEEDS_MANUAL_REVIEW', message: 'AI evidence assessment was unavailable; officer review is required.', provider: error?.message || 'AI_UNAVAILABLE' };
    }
  }

  // Add the uploaded document metadata after durable storage succeeds.
  const newDoc: BidDocument = {
    id: documentId,
    bidSubmissionId: submission.id,
    bidderId: submission.bidderId,
    docType: docType || 'MSE Turnover Exemption Certificate',
    fileName: req.file.originalname,
    fileSize: `${Math.round(req.file.size / 1024)} KB`,
    mimeType: req.file.mimetype,
    fileHash,
    storagePath: stored.storagePath,
    securityStatus: malware.status,
    securityEngine: malware.engine,
    ocrStatus: ocr.status === 'CLEAN' ? 'COMPLETE' : ocr.status,
    ocrEngine: ocr.engine,
    ocrText: 'text' in ocr && typeof ocr.text === 'string' ? ocr.text.slice(0, 100000) : undefined,
    pageCount: 2,
    status: 'UPLOADED',
    uploadedAt: new Date().toISOString(),
    aiReviewStatus: evidenceReview.status,
    aiReviewMessage: evidenceReview.message,
    aiReviewProvider: evidenceReview.provider,
    aiExtractedFacts: evidenceReview.extractedFacts,
  };
  db.documents.push(newDoc);

  // Keep the existing compliance result unchanged until an officer reviews the evidence.
  const matchingResult = db.verificationResults.find(
    (result) => result.bidSubmissionId === submission.id &&
      (result.requiredValue.toLowerCase().includes(String(docType || '').toLowerCase()) ||
       String(docType || '').toLowerCase().includes(result.requiredValue.toLowerCase()))
  );
  if (matchingResult) {
    matchingResult.documentId = newDoc.id;
    matchingResult.extractedValue = `Evidence uploaded: ${newDoc.fileName}`;
    matchingResult.status = 'NEEDS_REVIEW';
    matchingResult.sourceType = 'MANUAL';
    matchingResult.sourceTimestamp = new Date().toISOString();
    matchingResult.aiExplanation = 'Evidence is stored and awaits OCR and officer review.';
  }

  submission.status = 'REVIEW_REQUIRED';
  submission.riskLevel = 'MEDIUM';

  const uploadAudit = logAuditEvent(
    'CLARIFICATION_SUBMITTED',
    'BID_SUBMISSION',
    submission.id,
    `Bidder ${user.name} uploaded evidence "${newDoc.fileName}" for ${newDoc.docType}. Evidence is pending officer review.`,
    user,
    { documentId: newDoc.id, docType: newDoc.docType, remarks },
    false
  );

  if (process.env.STORAGE_MODE === 'postgres') await persistBidEvidence(newDoc, submission, matchingResult, uploadAudit);
  else await storage.save();
  res.json({
    success: true,
    submission,
    document: newDoc,
    turnoverResult: matchingResult,
    evidenceReview,
    message: 'Clarification response and evidence uploaded successfully. It is pending procurement officer review.',
  });
});

// Officer Override of a specific check
app.post('/api/compliance/override', (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER']);
  if (!actor) return;
  const { role, user } = actor;
  if (role !== 'PROCUREMENT_OFFICER') {
    return res.status(403).json({
      error: `Access Denied: Role '${role}' (${user.name}) is not authorized to override compliance check results. Statutory override authority is reserved exclusively for the Procurement Officer under GFR 2017 rules.`,
    });
  }

  const { resultId, newStatus, reason } = req.body;

  if (!['PASS', 'FAIL', 'NEEDS_REVIEW', 'NOT_APPLICABLE', 'UNVERIFIED'].includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid verification status.' });
  }

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Officer override requires a mandatory justification remarks (min 5 characters).' });
  }

  const result = db.verificationResults.find((r) => r.id === resultId);
  if (!result) return res.status(404).json({ error: 'Verification result not found' });

  const oldStatus = result.status;
  result.status = newStatus;
  result.officerOverridden = true;
  result.overrideReason = reason;
  result.overriddenByUserId = user.id;

  logAuditEvent(
    'OFFICER_OVERRIDE',
    'VERIFICATION',
    result.id,
    `Officer ${user.name} manually overrode requirement status from ${oldStatus} to ${newStatus}. Reason: "${reason}".`,
    user,
    { resultId, oldStatus, newStatus, reason }
  );

  storage.save();
  res.json({ success: true, result });
});

// Officer Final Decision (Approve, Reject, Clarification, Review)
app.post('/api/decisions', (req: Request, res: Response) => {
  const actor = requireRole(req, res, ['PROCUREMENT_OFFICER']);
  if (!actor) return;
  const { role, user } = actor;
  if (role !== 'PROCUREMENT_OFFICER') {
    return res.status(403).json({
      error: `Access Denied: Role '${role}' (${user.name}) cannot record binding procurement decisions. Only the Competent Procurement Authority (Rajesh Kumar) holds the statutory mandate to approve, disqualify, or issue formal tender clarifications.`,
    });
  }

  const { submissionId, decision, remarks, clarificationSubject, clarificationDeadline } = req.body;

  if (!['APPROVE_QUALIFIED', 'REJECT_DISQUALIFIED', 'SEND_CLARIFICATION', 'KEEP_UNDER_REVIEW'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid procurement decision.' });
  }

  if (!remarks || remarks.trim().length < 5) {
    return res.status(400).json({ error: 'A formal decision remark is mandatory for the audit trail.' });
  }

  const submission = db.submissions.find((s) => s.id === submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const officerDecision: OfficerDecision = {
    id: `dec-${Date.now()}`,
    bidSubmissionId: submission.id,
    officerUserId: user.id,
    officerName: user.name,
    officerDesignation: user.designation || 'Senior Procurement Officer',
    decision,
    remarks,
    clarificationSubject,
    clarificationDeadline,
    overridesApplied: [],
    decidedAt: new Date().toISOString(),
  };

  db.decisions.push(officerDecision);

  // Update submission status
  if (decision === 'APPROVE_QUALIFIED') submission.status = 'QUALIFIED';
  else if (decision === 'REJECT_DISQUALIFIED') submission.status = 'DISQUALIFIED';
  else if (decision === 'SEND_CLARIFICATION') submission.status = 'CLARIFICATION_REQUESTED';
  else submission.status = 'REVIEW_REQUIRED';

  submission.decidedAt = new Date().toISOString();

  logAuditEvent(
    'FINAL_DECISION_RECORDED',
    'DECISION',
    officerDecision.id,
    `Final procurement officer decision recorded: ${decision}. Remarks: "${remarks}".`,
    user,
    { decision, remarks, clarificationSubject }
  );

  storage.save();
  res.status(201).json({ success: true, decision: officerDecision, submission });
});

// Audit Trail
app.get('/api/audit-trail', (req: Request, res: Response) => {
  const actor = getActorContext(req);
  if (!actor.authenticated) return res.status(401).json({ error: 'Authentication required to inspect audit records.' });
  const { role } = actor;
  if (role === 'BIDDER_VENDOR') {
    // Under GFR 2017 Anti-Collusion: Bidder can only see events related to their company (bidder-01) or public notices
    const vendorAudits = db.auditEvents.filter(
      (ev) =>
        ev.actorUserId === 'user-bidder-01' ||
        ev.actorUserId === 'usr-03' ||
        ev.entityId === 'bidder-01' ||
        ev.entityId === 'sub-01' ||
        ev.action.includes('SUBMISSION') ||
        ev.action.includes('TENDER_PUBLISHED') ||
        ev.action.includes('USER_ROLE_SWITCH')
    );
    return res.json(vendorAudits);
  }
  res.json(db.auditEvents);
});

// Keep upload and JSON failures machine-readable without leaking stack traces.
app.use((err: any, _req: Request, res: Response, _next: Function) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Evidence file exceeds the 10 MB limit.' });
  if (err?.code === 'LIMIT_UNEXPECTED_FILE' || err?.message === 'Unexpected field') {
    return res.status(400).json({ error: 'Only one evidence file is allowed.' });
  }
  if (err instanceof multer.MulterError || err?.message === 'File type not allowed') {
    return res.status(400).json({ error: 'Only PDF, PNG, JPEG, and WebP evidence files are accepted.' });
  }
  console.error('[BIDSure API] Request failed:', err?.message || err);
  res.status(500).json({ error: 'The request could not be completed.' });
});

// In Dev mode, mount Vite dev server as middleware; in production serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`BidSure Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
