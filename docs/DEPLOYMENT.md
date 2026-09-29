# Deployment recommendation

## Why not Vercel-only

Vercel is excellent for a static React frontend, but this repository runs an Express server with multipart uploads, OCR, and malware scanning. Vercel Functions have request-size and execution limits and do not provide a persistent ClamAV daemon. A Vercel-only deployment would require splitting the application and replacing the local processing pipeline.

## Recommended first deployment

Use Render as a Docker web service from the GitHub repository. The included `Dockerfile` installs Tesseract and ClamAV inside the deployed container. Supabase remains the external PostgreSQL database and private document storage.

1. Open https://dashboard.render.com/
2. Sign in with GitHub.
3. Create a new Web Service from `Gaura3z/bidsure-ps100`.
4. Choose Docker and the Free plan for the SIH demo.
5. Add the environment variables listed in `render.yaml`.
6. Use the generated HTTPS URL as `APP_URL`.
7. Test `/api/health`, login, upload, OCR status, and Supabase Storage.

The Render free service may sleep when idle. That is acceptable for a demo, but use a paid always-on service for production. Uploaded files must remain in Supabase Storage; the container filesystem is temporary.

## Required secrets

Add these only in Render's environment-variable screen, never in GitHub:

- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PRIMARY_API_KEY` or `GEMINI_API_KEY`

The Docker image does not contain secrets.
