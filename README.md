<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BidSure — AI-Powered Bid Compliance Verification

BidSure is an SIH 2026 prototype for tender, bidder-document, compliance-rule, statutory-source, audit, and officer-decision workflows.

The current branch is a safe demo baseline. It uses an atomic JSON store and explicitly labels statutory integrations as MOCK until official credentials and contracts are available.

## Current status

- React/Vite frontend and Express server run as one application.
- Server-side session cookie authorization is enabled for demo personas.
- Multipart PDF/image upload, size/MIME checks, and SHA-256 hashing are implemented.
- Gemini integration has server-only keys, model configuration, timeout, and deterministic fallback.
- PostgreSQL, managed object storage, production SSO, OCR/malware scanning, and official government adapters remain deployment-phase work.

See [production readiness](docs/PRODUCTION_READINESS.md) and the [Google AI Studio master prompt](docs/GOOGLE_AI_STUDIO_MASTER_PROMPT.md) before asking an AI coding agent to extend the project.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and add a server-only Gemini key. Never commit `.env`.
3. Run checks:
   `npm run lint && npm run build`
4. Run the app:
   `npm run dev`
