# Production Env Checklist

## Goal
Avoid deploy/runtime failures caused by malformed environment variables.

## Required checks before production deploy

1. Local format check:

```bash
pnpm env:check
```

2. Vercel variables exist in both environments:

```bash
vercel env ls
```

3. Confirm no manual copy/paste with spaces/newlines in `NEXT_PUBLIC_*` vars.

## Mandatory variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_AI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_KEY`

## Consistency rules

- `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL` must be valid `https://` URLs.
- `FIREBASE_SERVICE_ACCOUNT_KEY.project_id` must equal `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- No leading/trailing whitespace in any Firebase public env value.
