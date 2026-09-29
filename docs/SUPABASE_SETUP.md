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
npm run db:seed
```

The seed command is additive and skips rows whose IDs already exist. Use `npm run db:seed -- --replace` only when the Supabase project is a dedicated BidSure demo database and you intentionally want to replace its rows with the local clean seed.

## 5. Enable durable document storage

Create a **private** Storage bucket named `bid-documents` in Supabase Storage. Then configure locally:

```env
DOCUMENT_STORAGE=supabase
SUPABASE_URL=https://iciwqzohovywsvgacsqq.supabase.co
SUPABASE_STORAGE_BUCKET=bid-documents
SUPABASE_SERVICE_ROLE_KEY=your_server_only_key
```

The service-role key must stay only in `.env` or a deployment secret manager. The server stores files under a submission-specific path and PostgreSQL stores the object path. The browser never receives the service-role key.

If the service-role key is not configured, leave `DOCUMENT_STORAGE=local`; local files go under ignored `data/uploads/` for development.

## 6. Google Cloud mode

The repository also includes optional Google Cloud Storage and Vision OCR adapters. They are disabled by default. After creating a Google Cloud project, bucket, and server identity, set:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-private-bucket
DOCUMENT_STORAGE=google-cloud-storage
OCR_PROVIDER=google-vision
```

The server uses Google Application Default Credentials. Do not commit credential JSON. Google Cloud billing/quota and IAM setup must be completed in the Google Cloud Console before enabling these switches.

## 6. Google OAuth authentication

The server now exposes `/api/auth/google/start` and `/api/auth/google/callback`. Before enabling this button, configure Google as a Supabase Auth provider and add this callback URL in both Supabase and Google Cloud:

```text
http://localhost:3000/api/auth/google/callback
```

For deployment, add the equivalent HTTPS callback URL. Set `SUPABASE_PUBLISHABLE_KEY` in the server environment. The callback verifies the Google session through Supabase and maps the verified email to an existing BidSure user; it never accepts a role from the browser.

The migration creates 14 tables covering organizations, users, tenders, requirements, bidders, submissions, documents, extractions, source records, verification results, scores, recommendations, decisions, and audit events.

## 4. Verify in Supabase

In **Table Editor**, confirm the tables exist and that foreign keys and unique indexes are present. Check that no application secret appears in any row.

## Current boundary

This phase adds the PostgreSQL schema and migration path. The runtime repositories still need to be switched from `src/db/storage.ts` to PostgreSQL and the clean demo data still needs a one-time import. That switch should happen only after the migration succeeds.
