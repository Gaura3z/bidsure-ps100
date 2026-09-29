# Master prompt for Google AI Studio

Copy the prompt below only after opening the `bidsure-ps100` repository. Do not paste API keys, database passwords, OAuth client secrets, service-account JSON, or government credentials into the prompt.

```text
You are the senior engineer taking over the BidSure repository, an SIH 2026 prototype for AI-powered tender and bidder compliance verification.

First inspect the entire repository and run the existing typecheck and production build. Do not rewrite the UI or change the visual design unless a change is required for correctness. Preserve the existing domain names, routes, audit concepts, demo workflow, and explicit MOCK/MANUAL/LIVE provenance labels.

Current baseline facts:
- React/Vite frontend with an Express TypeScript server.
- Server-side session cookie authorization exists for the demo; never trust x-user-role or x-user-id headers.
- The current persistence implementation is an atomic JSON demo store in src/db/storage.ts.
- src/db/schema.ts contains the domain interfaces: organization, users, tenders, requirements, bidders, submissions, documents, extractions, source records, verification results, scores, recommendations, decisions, and audit events.
- Upload validation and SHA-256 hashing exist, but durable object storage, OCR, malware scanning, and production authentication are not complete.
- Government adapters are mock adapters. Never present them as live.
- Gemini must be called only from the server. Never expose provider keys in browser code, logs, commits, or responses.

Implement the production transition in small verified phases:

1. Database
- Add a PostgreSQL adapter using Drizzle ORM and migrations.
- Use DATABASE_URL from the environment and provide a safe .env.example entry.
- Create normalized tables for every domain entity in src/db/schema.ts.
- Add primary keys, foreign keys, unique constraints, indexes, created/updated timestamps, and transaction boundaries.
- Preserve the current JSON store as an explicit STORAGE_MODE=json fallback for local demo only.
- Add a one-time seed/import command and an idempotent migration test.
- Keep SQL portable to Supabase PostgreSQL, Google Cloud SQL, AWS RDS, and Azure Database for PostgreSQL.

2. Supabase integration
- Add optional SUPABASE_URL and server-only SUPABASE_SECRET_KEY configuration.
- Use Supabase Storage private buckets for uploaded documents and signed URLs; never make bid documents public.
- Keep database access server-side. Never put the secret key in frontend code.
- Do not require Supabase-specific SQL when standard PostgreSQL is sufficient.

3. Authentication
- Keep demo login available only in development/demo mode.
- Add an adapter boundary for Google OAuth first, with Microsoft Entra/CPCL SSO as future providers.
- Resolve role and organization from the verified identity and database, not from browser headers.
- Add secure cookie settings, session expiry, logout, CSRF protection where needed, and unauthorized/forbidden tests.

4. Document pipeline
- Keep multipart validation, SHA-256 hashing, and quarantine status.
- Add a storage abstraction, malware-scan abstraction, OCR abstraction, and extraction/review states.
- In local development use Tesseract and ClamAV when available; for Google Cloud deployments support Vision OCR or Document AI through server-side adapters.
- Gemini may interpret extracted text and compare fields, but it must not be treated as an authoritative statutory source.
- Preserve page number, extraction confidence, source, model, prompt/version, and officer-review evidence.

5. AI provider
- Read GEMINI_API_KEY or GOOGLE_API_KEY only on the server.
- Keep model name configurable, add request timeout, retry/backoff for transient errors, quota-safe fallback, and structured provider diagnostics without key fragments.
- Do not claim live Gemini success unless a real health check succeeds.
- Never send sensitive production documents through a free tier without an approved data-processing policy.

6. Government adapters
- Keep GSTN, Udyam, MCA, Income Tax, EPFO, ESIC, GeM/debarment, and DigiLocker behind interfaces.
- Default every adapter to MOCK.
- Add configuration validation so LIVE mode cannot start without an explicit adapter contract, endpoint, credentials, consent rules, and environment marker.
- Never scrape portals or invent credentials. If official access is unavailable, show a clear MOCK/MANUAL notice.

7. Security and operations
- Protect reset and diagnostic routes with admin authorization and disable them in production.
- Add rate limits, request IDs, safe error responses, structured audit logging, backup/restore documentation, retention configuration, health/readiness endpoints, and deployment instructions.
- Add CI that runs lint, build, migrations/schema checks, and tests.
- Add a threat-model document covering impersonation, IDOR, upload malware, prompt injection, SSRF, secrets, and audit tampering.

8. Verification requirements
- Run lint, build, unit tests, integration tests, and a production start smoke test.
- Test bidder clarification authorization, role escalation attempts, upload rejection, hash generation, transaction rollback, signed URL access, and audit immutability.
- Report exactly what is implemented, what needs a human credential/contract, and any environment variables still missing.
- Do not delete working demo functionality or silently convert MOCK adapters to LIVE.

At the end, update README.md with exact setup commands, update .env.example without real secrets, and produce a concise migration report. Never commit .env, API keys, passwords, OAuth secrets, or service-account files.
```
