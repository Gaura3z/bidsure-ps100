import 'dotenv/config';
import fs from 'node:fs/promises';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { pgSchema } from '../src/db/pgSchema.ts';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required. Keep it in local .env only.');

const raw = JSON.parse(await fs.readFile('./data/bidsure_store.json', 'utf8'));
const client = postgres(url, { max: 1 });
const db = drizzle(client);
const replace = process.argv.includes('--replace');

const rows = [
  ['organizations', pgSchema.organizations, [raw.organization]],
  ['users', pgSchema.users, raw.users],
  ['tenders', pgSchema.tenders, raw.tenders],
  ['tender_requirements', pgSchema.tenderRequirements, raw.requirements],
  ['bidders', pgSchema.bidders, raw.bidders],
  ['bid_submissions', pgSchema.bidSubmissions, raw.submissions],
  ['bid_documents', pgSchema.bidDocuments, raw.documents],
  ['source_records', pgSchema.sourceRecords, raw.sourceRecords],
  ['document_extractions', pgSchema.documentExtractions, []],
  ['verification_results', pgSchema.verificationResults, raw.verificationResults],
  ['compliance_scores', pgSchema.complianceScores, []],
  ['ai_recommendations', pgSchema.aiRecommendations, []],
  ['officer_decisions', pgSchema.officerDecisions, raw.decisions],
  ['audit_events', pgSchema.auditEvents, raw.auditEvents],
] as const;

try {
  await db.transaction(async (tx) => {
    if (replace) {
      await tx.execute(sql`TRUNCATE TABLE
        ai_recommendations, compliance_scores, verification_results, document_extractions,
        audit_events, officer_decisions, bid_documents, bid_submissions, tender_requirements,
        bidders, tenders, users, organizations CASCADE`);
      console.warn('Existing PostgreSQL rows were replaced because --replace was supplied.');
    }

    for (const [name, table, values] of rows) {
      if (!values.length) continue;
      await tx.insert(table).values(values as never[]).onConflictDoNothing();
      console.log(`Seeded ${values.length} ${name} row(s).`);
    }
  });
  console.log('BidSure demo data import completed.');
} finally {
  await client.end({ timeout: 5 });
}
