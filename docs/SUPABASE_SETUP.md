# Supabase PostgreSQL setup

The repository now contains the real PostgreSQL schema and a generated Drizzle migration. The application still uses the JSON demo store until the database connection is configured and the data migration is verified.

## 1. Get the connection string

In the Supabase project dashboard:

1. Open **Connect**.
2. Choose the **Transaction pooler** connection for serverless/cloud deployment, or the direct connection for a persistent local server.
3. Copy the PostgreSQL connection string.
4. Put it in the local, ignored `.env` file as `DATABASE_URL`.

Never paste the connection string into chat, GitHub, screenshots, or frontend code.

## 2. Configure local environment

```env
STORAGE_MODE=postgres
DATABASE_URL=postgresql://...
SUPABASE_PROJECT_REF=iciwqzohovywsvgacsqq
```

Keep `STORAGE_MODE=json` until the migration has been applied and verified.

## 3. Generate and apply the schema

```bash
npm install
npm run db:generate
npm run db:migrate
```

The migration creates 14 tables covering organizations, users, tenders, requirements, bidders, submissions, documents, extractions, source records, verification results, scores, recommendations, decisions, and audit events.

## 4. Verify in Supabase

In **Table Editor**, confirm the tables exist and that foreign keys and unique indexes are present. Check that no application secret appears in any row.

## Current boundary

This phase adds the PostgreSQL schema and migration path. The runtime repositories still need to be switched from `src/db/storage.ts` to PostgreSQL and the clean demo data still needs a one-time import. That switch should happen only after the migration succeeds.
