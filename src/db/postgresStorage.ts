import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgSchema } from './pgSchema.ts';
import type { DatabaseState } from './storage.ts';

const sqlClient = postgres(process.env.DATABASE_URL!, { max: 5 });
const db = drizzle(sqlClient);

export async function loadPostgresState(): Promise<DatabaseState> {
  const [organizationRows, users, tenders, requirements, bidders, submissions, documents, sourceRecords, adapterModeRows, verificationResults, decisions, auditEvents] = await Promise.all([
    db.select().from(pgSchema.organizations),
    db.select().from(pgSchema.users),
    db.select().from(pgSchema.tenders),
    db.select().from(pgSchema.tenderRequirements),
    db.select().from(pgSchema.bidders),
    db.select().from(pgSchema.bidSubmissions),
    db.select().from(pgSchema.bidDocuments),
    db.select().from(pgSchema.sourceRecords),
    db.select().from(pgSchema.sourceAdapterModes),
    db.select().from(pgSchema.verificationResults),
    db.select().from(pgSchema.officerDecisions),
    db.select().from(pgSchema.auditEvents),
  ]);

  if (!organizationRows[0] || !users[0]) {
    throw new Error('Supabase database is reachable but has no seeded BidSure organization/users. Run npm run db:seed first.');
  }

  return {
    version: '2.4.0',
    lastSavedAt: new Date().toISOString(),
    organization: organizationRows[0] as any,
    users: users as any,
    currentUser: users[0] as any,
    tenders: tenders as any,
    requirements: requirements as any,
    bidders: bidders as any,
    submissions: submissions as any,
    documents: documents as any,
    sourceRecords: sourceRecords as any,
    verificationResults: verificationResults as any,
    decisions: decisions as any,
    auditEvents: auditEvents as any,
    sourceAdapterModes: adapterModeRows.length ? Object.fromEntries(adapterModeRows.map((row) => [row.adapterName, row.mode])) as DatabaseState['sourceAdapterModes'] : {
      GSTN: 'MOCK', UDYAM: 'MOCK', MCA: 'MOCK', INCOME_TAX: 'MOCK',
      EPFO: 'MOCK', ESIC: 'MOCK', DIGILOCKER: 'MOCK', DEBARMENT: 'MOCK',
    },
  };
}

export async function persistPostgresState(state: DatabaseState) {
  await db.transaction(async (tx) => {
    await tx.delete(pgSchema.aiRecommendations);
    await tx.delete(pgSchema.complianceScores);
    await tx.delete(pgSchema.verificationResults);
    await tx.delete(pgSchema.documentExtractions);
    await tx.delete(pgSchema.auditEvents);
    await tx.delete(pgSchema.sourceAdapterModes);
    await tx.delete(pgSchema.officerDecisions);
    await tx.delete(pgSchema.bidDocuments);
    await tx.delete(pgSchema.bidSubmissions);
    await tx.delete(pgSchema.tenderRequirements);
    await tx.delete(pgSchema.bidders);
    await tx.delete(pgSchema.tenders);
    await tx.delete(pgSchema.users);
    await tx.delete(pgSchema.organizations);

    await tx.insert(pgSchema.organizations).values([state.organization as any]);
    if (state.users.length) await tx.insert(pgSchema.users).values(state.users as any);
    if (state.tenders.length) await tx.insert(pgSchema.tenders).values(state.tenders as any);
    if (state.requirements.length) await tx.insert(pgSchema.tenderRequirements).values(state.requirements as any);
    if (state.bidders.length) await tx.insert(pgSchema.bidders).values(state.bidders as any);
    if (state.submissions.length) await tx.insert(pgSchema.bidSubmissions).values(state.submissions as any);
    if (state.documents.length) await tx.insert(pgSchema.bidDocuments).values(state.documents.map((row) => ({ ...row, storagePath: (row as any).storagePath ?? null })) as any);
    if (state.sourceRecords.length) await tx.insert(pgSchema.sourceRecords).values(state.sourceRecords as any);
    const adapterModeRows = Object.entries(state.sourceAdapterModes).map(([adapterName, mode]) => ({
      id: `${state.organization.id}:${adapterName}`,
      organizationId: state.organization.id,
      adapterName,
      mode,
      updatedAt: new Date().toISOString(),
    }));
    if (adapterModeRows.length) await tx.insert(pgSchema.sourceAdapterModes).values(adapterModeRows as any);
    if (state.verificationResults.length) await tx.insert(pgSchema.verificationResults).values(state.verificationResults as any);
    if (state.decisions.length) await tx.insert(pgSchema.officerDecisions).values(state.decisions.map((row) => ({ ...row, overridesApplied: row.overridesApplied ?? [] })) as any);
    if (state.auditEvents.length) await tx.insert(pgSchema.auditEvents).values(state.auditEvents as any);
  });
}
