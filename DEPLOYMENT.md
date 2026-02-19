# Deployment Guide (Vercel)

## 1) Pre-deploy checks (mandatory)

Run locally before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm build
```

If any command fails, do not deploy.

## 2) Environment variables (mandatory)

Set these in Vercel for both `Preview` and `Production`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_AI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (single-line JSON)
- Optional: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Optional: Sentry vars (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`)

Rules:

- No leading/trailing spaces.
- No line breaks in `NEXT_PUBLIC_*` vars.
- `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL` must be valid `https://` URLs.
- `FIREBASE_SERVICE_ACCOUNT_KEY.project_id` must match `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

Local format validation:

```bash
pnpm env:check
```

## 3) Deploy

### Git-based (recommended)

1. Push to `main`.
2. Vercel builds automatically.
3. Validate deployment URL.

### CLI

```bash
vercel --prod
```

## 4) Post-deploy smoke

Check:

- Auth: login/register/reset flow
- Resume flow: create -> edit -> save -> export PDF
- AI basic ops (bullets/summary/improve bullet)
- Legal pages: `/privacy`, `/terms`, `/cookies`
- SEO outputs:
  - `/robots.txt`
  - `/sitemap.xml`

## 5) Production gates

- CI must pass (`lint`, `typecheck`, `test:ci`, `build`)
- `main` should be branch-protected (required checks + at least one review)
- Launch flags must match V1 scope (`config/launch.ts`)
