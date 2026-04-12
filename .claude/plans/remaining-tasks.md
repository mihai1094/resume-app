# Remaining Tasks (post-session)

Last updated: 2026-04-12

---

## P0 — Pre-launch blockers

### Credibilitate
- [x] `0.3` **Șterge testimonialele false**
  - `components/home/social-proof.tsx` — fabricated Google/Amazon/Meta quotes → delete sau empty guard
  - `app/register/page.tsx:213` — "Join thousands who landed dream roles" → "Start free. Export PDFs. Keep your data private."

### Corectitudine
- [x] `1.4` **Fix `isResumeEmpty` false-negative**
  - Un resume cu doar `personalInfo.firstName` completat nu e gol, dar e exportat ca atare
  - Verifică `lib/utils/resume.ts` — funcția trebuie să ceară minim 1 secțiune populată (experience/education/skills)

- [x] `1.2` **Transaction-wrap plan-limit checks**
  - Race condition: doi tabs simultani pot crea al 4-lea resume pe free plan
  - `lib/services/firestore.ts` — wrap count + create într-un Firestore transaction

---

## P1 — Launch credibilitate (wedge ATS)

- [x] `2.1` **Activare ATS feature flags**
  - `config/launch.ts` — activează `aiAnalyzeAts` și `atsScorePanel`

- [x] `2.2` **Panou ATS live în editor**
  - Panou lateral sau section în `components/resume/resume-editor.tsx` care afișează scorul ATS în timp real

- [x] `2.3` **Homepage rewrite pe wedge**
  - `app/home-content.tsx` — hero headline trebuie să fie despre ATS scoring, nu generic "AI resume builder"

---

## P2 — SEO

- [x] `5.1` **`home-content.tsx` → RSC** *(complex)*
  - Componenta folosește `useState`/`useRouter`/`useSavedResumes`/`useUser` — necesită extragere client islands
  - Beneficiu: homepage devine SSR-first → crawlabil complet

- [x] `5.6` **OG images per pagină**
  - `/pricing`, `/templates`, `/blog` nu au OG image custom
  - Folosește `next/og` (ImageResponse) sau imagini statice

- [x] `5.8` **5 pagini noi `/vs/[competitor]`**
  - Vezi `lib/data/comparison-pages.ts` pentru lista curentă — extinde cu 5 competitori relevanți

- [x] `5.9` **Schema per resume public**
  - `app/u/[username]/[slug]/page.tsx` — adaugă JSON-LD `Person` + `ProfilePage`

---

## P3 — Test coverage (Phase 7)

- [x] `7.1` **PDF export route tests** — `app/api/user/export-pdf/__tests__/route.test.ts`
  - Auth required, Zod validation, 413 body size, puppeteer mocked, headers corecte

- [x] `7.2` **`use-saved-resumes` hook tests** — `hooks/__tests__/use-saved-resumes.test.ts`
  - CRUD, pagination, `mergeUniqueResumes`, `PlanLimitError`, `timestampToISO`

- [x] `7.3` **Cover letter hook tests**
  - `hooks/__tests__/use-cover-letter.test.ts` — edit-by-`?id=` vs create-new, autosave localStorage

- [x] `7.7` **Playwright a11y integration**
  - `@axe-core/playwright` în `e2e/template-editor.spec.ts` + `e2e/auth.spec.ts`

- [~] `7.8` **E2E happy path**
  - Register → create resume → export PDF → dashboard shows card
  - Spec există și e skip-safe; rularea completă rămâne dependentă de credentials / env de test

- [x] `7.10` **Pre-commit hook**
  - `lint-staged` + `tsc --noEmit` pe fișierele staged

---

## P4 — UX fixes (lower urgency)

- [x] `4.1` **Collapse signup → first resume funnel**
  - Onboarding sare direct la editor după register, nu la dashboard gol

- [x] `4.3` **Fix Enter-to-advance footgun**
  - Enter în câmpurile de form submitează formularul în loc să avanseze la câmpul următor

- [x] `4.5` **Expand `hasUnsavedContent` heuristic**
  - Detectează mai bine dacă există conținut nesalvat înainte de navigare (navigation guard)

- [x] `4.10` **Block scroll jumps la schimbare secțiune**
  - Scroll-ul sare brusc când user-ul schimbă secțiunea activă în sidebar

---

## P5 — Design system (polish)

- [x] `DSN-03` **Button radius scale consistency**
  - Restul aplicației (dashboard, settings, onboarding) — standardizează la `rounded-lg` consistent cu editorul

- [x] `6.5` **Hero H1 responsive scale** — aplică clasele `.h-1`/`.h-display` (adăugate în `globals.css`) pe toate paginile de marketing

---

## Deferred (post-payment)

- `8.1` Move PDF off `@sparticuz/chromium-min` tarball
- `8.2` Extract template primitives — MVP introdus (`shared/template-primitives.tsx`) și adoptat incremental; extindere completă rămâne iterativă
- `8.5` Testimonial collection system (real users) — MVP livrat: submit autenticat + moderare admin + homepage din testimoniale aprobate
- `8.8` Payment integration
- `8.9` Admin dashboard — MVP livrat la `/admin`

---

## Status snapshot

- Launch tasks din P0-P5 sunt practic închise.
- Singurul item încă deschis operațional este rularea completă a `7.8` într-un env de test cu credentials valide.
- Deferred rămâne pentru payments / admin hardening / refactor complet de template primitives.

---

## Notă arhitecturală

`0.1` — Branch-ul `preview` are ~286 fișiere modified necommit-uite. Înainte de launch, split în commits coerente sau merge tot într-un singur "V1 launch" commit.
