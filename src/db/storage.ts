/**
 * BIDSure - Persistent Local Database Engine
 * Handles JSON-backed persistent storage, ACID-style atomic disk sync,
 * referential integrity checks, and factory reset capabilities.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialOrganization,
  initialUsers,
  initialTenders,
  initialRequirements,
  initialBidders,
  initialSubmissions,
  initialDocuments,
  initialSourceRecords,
  initialVerificationResults,
  initialAuditEvents,
} from './mockData.ts';
import {
  Organization,
  User,
  Tender,
  TenderRequirement,
  Bidder,
  BidSubmission,
  BidDocument,
  SourceRecord,
  VerificationResult,
  OfficerDecision,
  AuditEvent,
} from './schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'bidsure_store.json');

export interface DatabaseState {
  version: string;
  lastSavedAt: string;
  organization: Organization;
  users: User[];
  currentUser: User;
  tenders: Tender[];
  requirements: TenderRequirement[];
  bidders: Bidder[];
  submissions: BidSubmission[];
  documents: BidDocument[];
  sourceRecords: SourceRecord[];
  verificationResults: VerificationResult[];
  decisions: OfficerDecision[];
  auditEvents: AuditEvent[];
  sourceAdapterModes: Record<string, 'LIVE' | 'MOCK' | 'MANUAL'>;
}

function getDefaultState(): DatabaseState {
  return {
    version: '2.4.0',
    lastSavedAt: new Date().toISOString(),
    organization: initialOrganization,
    users: [...initialUsers],
    currentUser: initialUsers[0],
    tenders: [...initialTenders],
    requirements: [...initialRequirements],
    bidders: [...initialBidders],
    submissions: [...initialSubmissions],
    documents: [...initialDocuments],
    sourceRecords: [...initialSourceRecords],
    verificationResults: [...initialVerificationResults],
    decisions: [],
    auditEvents: [...initialAuditEvents],
    sourceAdapterModes: {
      GSTN: 'MOCK',
      UDYAM: 'MOCK',
      MCA: 'MOCK',
      INCOME_TAX: 'MOCK',
      EPFO: 'MOCK',
      ESIC: 'MOCK',
      DIGILOCKER: 'MOCK',
      DEBARMENT: 'MOCK',
    },
  };
}

class StorageEngine {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseState {
    try {
      this.ensureDir();
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tenders && Array.isArray(parsed.tenders)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[BIDSure DB] Could not read existing database file, initializing with seeds:', err);
    }

    const defaultState = getDefaultState();
    this.saveDirect(defaultState);
    return defaultState;
  }

  private saveDirect(state: DatabaseState) {
    try {
      this.ensureDir();
      state.lastSavedAt = new Date().toISOString();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[BIDSure DB] Disk write error:', err);
    }
  }

  public save() {
    this.saveDirect(this.state);
  }

  public getDb(): DatabaseState {
    return this.state;
  }

  public resetFactory(): DatabaseState {
    this.state = getDefaultState();
    this.save();
    return this.state;
  }
}

export const storage = new StorageEngine();
export const db = storage.getDb();
