# Google Cloud implementation phases

Google Cloud is optional. The active implementation uses Supabase plus local OCR and malware scanning because the Google Cloud billing account could not be created.

## Phase 1: foundation and adapters

Implemented now:

- Google Cloud Storage adapter
- Google Cloud Vision OCR adapter
- Environment-controlled provider switches
- Local fallback remains available
- No credential files committed

User action required before enabling: select a Google Cloud project, create a private bucket, enable Vision API, and configure an application identity with least-privilege access.

## Phase 2: Google Cloud data platform

- Create Cloud SQL for PostgreSQL.
- Apply the existing Drizzle migrations.
- Export/import the current Supabase PostgreSQL data.
- Change `DATABASE_URL` to Cloud SQL.
- Verify transactions, backups, and private networking.

## Phase 3: document processing

- Enable Cloud Vision OCR for images and rendered PDF pages.
- Add asynchronous processing for large documents.
- Store OCR status, provider, confidence, page, and evidence hash.
- Add quarantine and malware scanning before OCR.

## Phase 4: identity

- Configure Google OAuth through the approved identity setup.
- Map verified Google accounts to BidSure users and organizations.
- Remove demo login in production.
- Keep CPCL/Entra as future adapters if the organization requires them.

## Phase 5: deployment

- Containerize the Express/Vite application.
- Deploy to Cloud Run.
- Store secrets in Secret Manager.
- Configure HTTPS, health checks, logging, and a custom domain if approved.

## Phase 6: production controls

- Add backups and restore tests.
- Add rate limiting and monitoring.
- Add security tests and audit retention.
- Activate government adapters only after official contracts and credentials.

Google Cloud does not provide government API authorization. GSTN, Udyam, MCA, EPFO, ESIC, GeM, DigiLocker, and Income Tax remain MOCK/MANUAL until officially approved.
