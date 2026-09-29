# BidSure production-readiness checklist

## Implemented in this baseline

- Server-side session cookies; browser role headers are not trusted.
- Role checks for tender creation, adapter mode changes, overrides, decisions, reset, and bidder clarification.
- Actual multipart PDF/image upload with MIME and 10 MB limits.
- SHA-256 hash generated from uploaded bytes.
- Atomic JSON persistence for standalone demo restarts.
- Gemini provider timeout, configured model, ordered key failover, and deterministic fallback.
- Explicit `MOCK`, `MANUAL`, and `LIVE` provenance labels for statutory adapters.

## Still required before production

1. Replace `src/db/storage.ts` with PostgreSQL repositories and migrations. Supabase is the selected prototype provider; the schema must remain portable to Cloud SQL/RDS/Azure PostgreSQL.
2. Add managed object storage and private signed URLs. Do not store uploaded bytes in PostgreSQL rows.
3. Add OCR/extraction workers, malware scanning, quarantine status, page counts, and retry/dead-letter handling.
4. Replace demo login with an approved identity provider such as Google Workspace, Microsoft Entra ID, or CPCL SSO. Map identities to organizations and roles server-side.
5. Add rate limiting, CSRF protection where applicable, structured logs, secret-manager integration, backups, restore testing, retention policies, and monitoring.
6. Keep every government adapter in `MOCK` mode until an official contract, sandbox, credentials, consent flow, schema, rate limit, and security approval are documented.
7. Add integration tests for authorization boundaries, upload validation, persistence, audit immutability, and decision transitions.

## What Google AI Studio cannot provide automatically

- Official GSTN, Udyam, MCA, EPFO, ESIC, Income Tax, GeM, or DigiLocker access.
- Government contracts, sandbox credentials, consent approval, or production whitelisting.
- A guarantee that free Gemini/Vision quotas are suitable for production.
- Security approval, legal/compliance sign-off, malware-scanning infrastructure, or incident response.
- Safe handling of secrets if keys are pasted into prompts or committed to Git.

The system must show `MOCK` or `MANUAL` provenance until the corresponding official integration is authorized.
