# Google-first master prompt for BidSure

Copy the prompt below into Google AI Studio after opening the `bidsure-ps100` repository. Never paste API keys, database passwords, OAuth secrets, service-account JSON, or government credentials into the prompt.

```text
You are the senior engineer taking over the BidSure repository, an SIH 2026 prototype for AI-powered tender and bidder compliance verification.

Your goal is to make this project Google Cloud-ready using only official Google services and free/low-cost quotas where they are genuinely available. Do not claim a service is free forever. Do not create paid resources, enable billing, create OAuth credentials, or provision infrastructure unless the user explicitly confirms and the required Google Cloud project is already selected.

Start by inspecting the entire repository, then run the existing typecheck and production build. Preserve the current UI, domain names, routes, audit concepts, demo workflow, and explicit MOCK/MANUAL/LIVE provenance labels.

CURRENT BASELINE
- React/Vite frontend with an Express TypeScript server.
- Server-side demo session cookies exist; never trust x-user-role or x-user-id browser headers.
- Persistence is currently an atomic JSON demo store in src/db/storage.ts.
- src/db/schema.ts defines organizations, users, tenders, requirements, bidders, submissions, documents, extractions, source records, verification results, scores, recommendations, decisions, and audit events.
- Multipart PDF/image validation and SHA-256 hashing exist.
- Durable storage, production OCR, malware scanning, production authentication, and PostgreSQL migrations are incomplete.
- Government adapters are synthetic. Never represent them as live.
- Gemini keys must remain server-only.

GOOGLE SERVICE POLICY
Use these official Google services behind small server-side adapters:

1. Gemini API / Google AI Studio
- Keep Gemini for compliance explanation, field comparison, summarization, and structured extraction review.
- Use the existing @google/genai server integration and configurable GEMINI_MODEL.
- Use GEMINI_API_KEY or GOOGLE_API_KEY only on the server.
- Add timeout, retry/backoff, quota handling, deterministic fallback, structured output validation, and prompt/version metadata.
- Free Gemini API access is rate-limited and may have different data-use terms. Never use a free tier for sensitive production documents without approval.
- Never let Gemini make an authoritative statutory decision; it is decision support only.

2. Google Cloud Vision API OCR
- Add a Vision OCR adapter for image files and rendered PDF pages.
- Prefer DOCUMENT_TEXT_DETECTION for dense scanned documents.
- Store extracted text, confidence, page number, bounding boxes when available, provider name, model/feature, and timestamp.
- Google Cloud Vision advertises a limited monthly free allowance. Treat it as quota-limited, not unlimited or guaranteed.
- If Vision credentials or billing are unavailable, retain a local OCR fallback and clearly show OCR_PENDING or MOCK.

3. Google Cloud Document AI
- Add an optional Document AI adapter for structured document processors only when the user supplies a processor location, processor ID, project ID, and authorized credentials.
- Do not invent processor IDs or credentials.
- Keep Document AI disabled by default and expose configuration validation errors safely.
- Record processor ID/version, page number, entities, confidence, and raw-response hash.
- Do not describe Document AI as free by default; processor pricing varies.

4. Google Cloud Storage
- Add a private bucket storage adapter for bid documents.
- Use random object keys, content-type allowlists, size limits, SHA-256 hashes, retention metadata, and short-lived signed download URLs.
- Never expose public bucket URLs and never store service-account JSON in the repository.
- Keep a local filesystem adapter for development.
- Add upload quarantine state before OCR or officer review.

5. Cloud SQL for PostgreSQL
- Replace the JSON store with a PostgreSQL repository using Drizzle ORM and migrations.
- Use DATABASE_URL from the environment.
- Create normalized tables for every entity in src/db/schema.ts with foreign keys, unique constraints, indexes, timestamps, audit relationships, and transactions.
- Keep SQL portable to Supabase PostgreSQL and Cloud SQL for PostgreSQL.
- Preserve STORAGE_MODE=json only as an explicit local demo fallback.
- Add an idempotent migration command, seed/import command, and rollback/backup documentation.
- Do not create a Cloud SQL instance or enable billing automatically.

6. Google Identity / OAuth
- Add an authentication adapter boundary for Google OAuth / Google Identity Services.
- Verify issuer, audience, signature, expiry, nonce/state, email, and subject server-side.
- Resolve role and organization from the database, never from browser input.
- Keep demo login only for local development.
- Do not create OAuth client secrets automatically and do not commit them.
- Keep Microsoft Entra and CPCL SSO as future adapters.

7. Cloud Run and Secret Manager
- Add a production Dockerfile or deployment configuration for Cloud Run.
- Add readiness/health endpoints and graceful shutdown.
- Read production secrets from Secret Manager when deployed, with local .env support only for development.
- Add least-privilege service-account documentation.
- Do not deploy or create a billing commitment automatically.

8. Cloud Logging and Error Reporting
- Add structured JSON logs with request ID, actor ID, route, duration, and outcome.
- Redact tokens, API keys, document contents, passwords, and personal identifiers.
- Add operational documentation for Cloud Logging/Error Reporting, but do not pretend monitoring is active until verified in a real project.

DOCUMENT WORKFLOW
- Keep multipart validation, SHA-256 hashing, quarantine, and officer review.
- Add interfaces for storage, malware scanning, OCR, extraction, and review.
- Local development: use Tesseract and ClamAV when installed; otherwise retain a safe pending state.
- Google deployment: use Cloud Storage plus Vision OCR or authorized Document AI.
- Use Gemini after OCR for semantic comparison and explanation, not as a statutory source.
- Preserve page, confidence, provider, model, prompt version, extraction status, and evidence hash.
- Defend against prompt injection in uploaded documents: treat document text as untrusted data.

GOVERNMENT INTEGRATIONS
- Keep GSTN, Udyam, MCA, Income Tax, EPFO, ESIC, GeM/debarment, and DigiLocker behind interfaces.
- Default all to MOCK.
- Do not scrape portals, invent endpoints, invent credentials, or bypass consent/captcha/firewalls.
- LIVE mode may activate only when the user supplies an official contract, sandbox/production endpoint, credential method, consent rules, schema, rate limits, and security approval.
- The UI and reports must always show LIVE, MOCK, or MANUAL provenance.

SECURITY AND QUALITY
- Protect reset, failover, diagnostics, adapter configuration, overrides, decisions, and clarification routes.
- Add authorization tests for IDOR, bidder clarification ownership, role escalation, and audit tampering.
- Add upload tests for MIME, size, hash, quarantine, signed URL expiry, and malware-scan failure.
- Add rate limiting, safe errors, CSRF protection where applicable, request IDs, retention settings, backup/restore documentation, and migration tests.
- Add CI for lint, build, tests, schema/migration checks, and production-start smoke test.
- Never commit .env, secrets, OAuth files, service-account files, uploaded documents, or database dumps.

GOOGLE IMPLEMENTATION REPORT
At the end, update README.md and .env.example, then report in four sections:

A. Implemented and verified now
- Exact Google services integrated.
- Exact routes, tables, migrations, adapters, tests, and environment variables.
- Which checks actually passed.

B. Google free/limited services used
- Mark each item FREE QUOTA, FREE TRIAL, or PAID/REQUIRES BILLING.
- State the quota/limit and that it can change.
- Never call a free quota production-grade.

C. Requires user action or approval
- Google Cloud project ID and region.
- Billing decision for Cloud SQL, Cloud Storage, Vision, Document AI, Cloud Run, or higher Gemini quotas.
- OAuth configuration and authorized redirect URIs.
- Secret Manager values and service-account permissions.
- Official government contracts, credentials, consent, and sandbox access.

D. Still mocked or incomplete
- List every remaining MOCK/MANUAL adapter and every unverified production claim.
- Do not silently convert anything to LIVE.

Run lint, build, tests, migrations/schema checks, and a production-start smoke test before declaring completion. Never say the system is production-ready unless all required credentials, contracts, security controls, backups, monitoring, and deployment checks are verified.
```

Official references: Gemini billing and tiers: https://ai.google.dev/gemini-api/docs/billing; Gemini document processing: https://ai.google.dev/gemini-api/docs/document-processing; Google Vision: https://cloud.google.com/vision; Google Cloud free tier: https://cloud.google.com/free.
