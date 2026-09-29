# Cost-controlled provider plan

## Active recommendation

- Database: Supabase PostgreSQL
- File storage: Supabase Storage when its server-only key is configured; local private storage during development
- OCR: Tesseract locally
- Malware scanning: ClamAV locally or through the included Docker service
- AI explanation: Gemini API only when available, with deterministic fallback
- Hosting: Render or Railway for the first stable demo

## Why this choice

This avoids Google Cloud billing while preserving a replaceable provider boundary. The compliance rules, audit trail, database schema, and document metadata do not depend on a particular OCR vendor.

## Local tools

Install Tesseract OCR and ClamAV on the development machine, or start the ClamAV service from `docker-compose.yml`. Until the binaries are available, BidSure reports `NOT_CONFIGURED` and keeps the document in review instead of marking it verified.

## Future Azure option

Azure Document Intelligence can be added behind the same OCR adapter for forms and tables. It remains optional and must not replace the local path unless Azure credentials and privacy approval are available.

## Provider switch values

```env
DOCUMENT_STORAGE=local       # or supabase
OCR_PROVIDER=local            # or google-vision when billing works
```
