# ResumeForge

ResumeForge este o aplicatie Next.js (App Router) pentru creare CV + cover letter, cu autentificare Firebase, export PDF si functionalitati AI controlate prin launch flags.

## Stack

- Next.js 16
- React 19 + TypeScript
- Tailwind + shadcn/ui
- Firebase (Auth + Firestore)
- Vercel + Sentry

## Setup local

1. Instaleaza dependintele:

```bash
pnpm install
```

2. Configureaza variabilele de mediu:

```bash
cp .env.example .env.local
pnpm env:check
```

3. Ruleaza local:

```bash
pnpm dev
```

Aplicatia ruleaza pe `http://localhost:3000`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm build
```

## Production build

```bash
pnpm build
pnpm start
```

## Documentatie

- `docs/development/` - hardening, remediation, preflight, V1 scope
- `docs/plans/` - SEO, stabilitate, roadmap executie
- `docs/seo/` - implementare SEO
