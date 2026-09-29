# PS100 / BidSure Implementation Changelog

This changelog records all engineering modifications made to transform the initial codebase into a fully functional, resilient, and demo-ready prototype matching the SIH 2026 Problem Statement 26100 specifications and provided reference designs.

---

### Change Entry 1: Multi-Key API Key Failover Provider
- **File:** `src/services/aiProvider.ts`
- **Problem:** Single-key dependency in original code caused hard failures upon quota limit or key error, with no retry or backup key mechanism.
- **Change:** Implemented `ResilientAIProvider` supporting ordered failover (`PRIMARY_API_KEY` -> `SECONDARY_API_KEY` -> `Deterministic Fallback`). Added safe masked logging (`AQ.A...H9BA`), health diagnostic method, and simulation test harness.
- **Reason:** Fulfills Section 8 of requirements: application must never depend on a single key and must gracefully handle 401/429/timeout errors without crashing.
- **Test Performed:** Verified via `POST /api/gemini/test-failover` with `simulatePrimaryFailure: true` and `simulatePrimaryFailure: false`. Confirmed controlled fallback and safe error capture.

---

### Change Entry 2: Durable JSON Database Engine
- **File:** `src/db/storage.ts`
- **Problem:** Data was held in volatile in-memory variables in `server.ts`. Any server restart or reboot destroyed newly created tenders, officer decisions, and audit events.
- **Change:** Created `StorageEngine` persisting state to `data/bidsure_store.json` using atomic temporary file write and replacement (`fs.writeFileSync` + `fs.renameSync`). Added factory reset endpoint (`POST /api/database/reset`).
- **Reason:** Fulfills Section 7 of requirements: application must preserve records across restarts without requiring complex external database server setups.
- **Test Performed:** Created tender `CPCL/RE/2026/099` via `POST /api/tenders`, restarted server, and verified tender and audit records were preserved on disk.

---

### Change Entry 3: Server Routing & Endpoint Modernization
- **File:** `server.ts`
- **Problem:** In-memory store and direct AI calls were coupled tightly inside `server.ts`.
- **Change:** Integrated `storage.getDb()` and `aiProvider`. Added endpoints for `/api/health`, `/api/gemini/status`, `/api/gemini/test-failover`, and `/api/database/reset`. Connected `storage.save()` to all mutations (`tenders`, `overrides`, `decisions`, `adapters`).
- **Reason:** Clean separation of concerns between HTTP routes, business logic, storage, and AI providers.
- **Test Performed:** Executed `Invoke-RestMethod` across all endpoints (`/api/health`, `/api/tenders`, `/api/gemini/status`, `/api/audit-trail`). All returned HTTP 200 with valid JSON.

---

### Change Entry 4: Hero Character & Industrial Refinery Graphic
- **File:** `src/components/landing/HeroCharacterIllustration.tsx`
- **Problem:** Landing page lacked the visual character (Indian CPCL safety engineer in hardhat, refinery skyline, tricolor wave, floating verified checklist badge) present in Reference Screen 1.
- **Change:** Built custom, scalable SVG graphic component rendering the refinery towers, gas flare, Indian engineer in high-vis vest and hardhat, and the interactive "Verified" badge.
- **Reason:** Fulfills user request for high-fidelity human character graphics and authentic Indian PSU visual identity.
- **Test Performed:** Integrated into `LandingView.tsx`, verified responsive rendering on desktop and mobile viewports.

---

### Change Entry 5: Official Government & CPCL Header Branding
- **File:** `src/components/common/GovernmentHeaderBranding.tsx`
- **Problem:** Missing official top header banner with Government of India Ashoka Lion Capital emblem, Ministry of Petroleum & Natural Gas, and CPCL emblem from Reference Screen 1.
- **Change:** Created official header banner component with bilingual typography (सत्यमेव जयते), CPCL corporate mark, and SIH 2026 badge.
- **Reason:** Matches design direction of Reference Screen 1 and reinforces public procurement credibility.
- **Test Performed:** Rendered on top of `LandingView.tsx` with clean responsive wrapping.

---

### Change Entry 6: Procurement Officer Portrait Avatar Graphic
- **File:** `src/components/common/OfficerAvatarGraphic.tsx`
- **Problem:** Dashboard and Evaluation views lacked the authentic officer avatar depicted in Reference Screen 3.
- **Change:** Built `OfficerAvatarGraphic` rendering an Indian procurement officer portrait with hardhat, safety lanyard, and CPCL credentials.
- **Reason:** Matches Reference Screen 3 ("Welcome back, Rajesh Kumar, Procurement Officer, CPCL").
- **Test Performed:** Integrated into `DashboardView.tsx` banner and verified across screen sizes.

---

### Change Entry 7: Realistic Chartered Accountant Certificate Evidence Viewer
- **File:** `src/components/evaluation/CACertificateEvidenceView.tsx`
- **Problem:** Document evidence view required a high-fidelity visual of an audited CA turnover certificate with stamps, UDIN, and signature matching Reference Screen 8.
- **Change:** Created `CACertificateEvidenceView` displaying firm header (S R & Associates), turnover breakdown table, official ICAI rubber stamp, signature graphic, UDIN `24082415BKLP8901`, and discrepancy callout (₹3.8 Cr vs ₹5.0 Cr required).
- **Reason:** Fulfills Reference Screen 8 requirements for transparent document evidence inspection.
- **Test Performed:** Verified visual layout and side-by-side deficit calculation in browser and component preview.

---

### Change Entry 8: Vite Configuration & TypeScript Typings Fix
- **File:** `vite.config.ts`
- **Problem:** `server.allowedHosts: true` failed TypeScript type-checking in Vite 8. `__dirname` caused deprecation warning for future Vite config loader.
- **Change:** Set `allowedHosts: true as const` and replaced `__dirname` with `import.meta.dirname || '.'`.
- **Reason:** Ensures zero-warning, error-free TypeScript compilation and clean production builds.
- **Test Performed:** Ran `npm run lint` (`tsc --noEmit`) and `npm run build`. Both passed with 0 errors and 0 warnings.
