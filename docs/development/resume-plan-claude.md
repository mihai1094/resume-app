# Resume Builder - Plan de Arhitectură

## MVP - Minimum Viable Product

**Obiectiv**: Utilizatorul poate crea un CV basic cu template Modern și salva local

### Features MVP:

- Formular complet pentru Personal Info
- Secțiune Work Experience (CRUD operations)
- Secțiune Education (CRUD operations)
- Secțiune Skills (add/remove)
- Preview în timp real cu template Modern
- Local Storage pentru salvare automată
- Export/Import JSON pentru backup

### Componente tehnice MVP:

- `app/create/page.tsx` - Editor principal cu layout split (form + preview)
- `components/resume/work-experience-form.tsx` - Form pentru experiență
- `components/resume/education-form.tsx` - Form pentru educație
- `components/resume/skills-form.tsx` - Form pentru skills
- `components/resume/templates/modern-template.tsx` - Template Modern
- `lib/types/resume.ts` - Types complete (✓ există deja)
- `hooks/use-resume.ts` - State management (✓ există deja)
- `hooks/use-local-storage.ts` - Hook pentru persistență
- `lib/utils/resume.ts` - Helper functions (✓ există deja)

### Files noi necesare:

- `app/create/page.tsx` - Implementare completă (înlocuiește mock-ul)
- `components/resume/work-experience-form.tsx`
- `components/resume/education-form.tsx`
- `components/resume/skills-form.tsx`
- `components/resume/templates/modern-template.tsx`
- `components/resume/resume-editor.tsx` - Container principal
- `hooks/use-local-storage.ts`

---

## V1 - Versiune Completă

**Obiectiv**: Toate template-urile, export PDF, și features suplimentare

### Features V1:

- Toate cele 6 template-uri (Modern, Classic, Minimalist, Executive, Creative, Technical)
- Export PDF de calitate (folosind react-pdf sau jsPDF)
- Secțiuni opționale: Projects, Languages, Certifications
- Template selector cu preview
- Customizare culori per template
- Print-friendly styling
- Validare completă cu feedback

### Componente tehnice V1:

- `components/resume/templates/` - Toate cele 6 template-uri
- `components/resume/template-selector.tsx` - UI pentru alegere template
- `components/resume/projects-form.tsx`
- `components/resume/languages-form.tsx`
- `components/resume/certifications-form.tsx`
- `lib/pdf/` - Generator PDF
- `lib/utils/validation.ts` - Validare avansată
- `components/resume/color-customizer.tsx` - Customizare culori

### Dependencies V1:

```json
"@react-pdf/renderer": "^3.x" sau "jspdf": "^2.x"
"html2canvas": "^1.x" (alternativă)
```

### Files noi V1:

- `components/resume/templates/classic-template.tsx`
- `components/resume/templates/minimalist-template.tsx`
- `components/resume/templates/executive-template.tsx`
- `components/resume/templates/creative-template.tsx`
- `components/resume/templates/technical-template.tsx`
- `components/resume/template-selector.tsx`
- `components/resume/projects-form.tsx`
- `components/resume/languages-form.tsx`
- `components/resume/certifications-form.tsx`
- `lib/pdf/generate-pdf.ts`
- `lib/utils/validation.ts`

---

## V2 - Features Avansate

**Obiectiv**: AI suggestions, import din LinkedIn, și analytics

### Features V2:

- AI-powered suggestions pentru îmbunătățire CV
- Import automat din LinkedIn/GitHub
- Multiple CV-uri (salvare mai multe versiuni)
- Analytics: track views, downloads
- Drag & drop pentru reordonare secțiuni
- Custom sections (utilizatorul își creează propriile secțiuni)
- Dark mode
- Share link (CV public)

### Componente tehnice V2:

- `lib/ai/` - Integrare OpenAI/Claude pentru suggestions
- `lib/import/` - Import din LinkedIn/GitHub
- `components/resume/ai-suggestions.tsx`
- `components/resume/import-wizard.tsx`
- `hooks/use-multiple-resumes.ts`
- `components/resume/custom-section-builder.tsx`
- `lib/analytics/` - Tracking
- `app/share/[id]/page.tsx` - Public CV view

### API Routes V2:

- `app/api/ai/suggestions/route.ts` - AI suggestions
- `app/api/share/route.ts` - Generate share link
- `app/api/analytics/route.ts` - Track events

### Dependencies V2:

```json
"openai": "^4.x" sau "anthropic-sdk"
"@dnd-kit/core": "^6.x" (drag & drop)
"react-beautiful-dnd": "^13.x"
```

---

## V3 - Platformă Completă

**Obiectiv**: Autentificare, cloud storage, colaborare, și monetizare

### Features V3:

- User authentication (NextAuth.js)
- Cloud storage (Supabase/Firebase)
- Colaborare: share pentru review cu feedback
- Premium templates (monetizare)
- Cover letter generator
- Job application tracking
- Email templates pentru aplicații
- Multi-language support (i18n)
- ATS score checker (analizează compatibilitatea)

### Componente tehnice V3:

- Database: Supabase/PostgreSQL
- Authentication: NextAuth.js
- Storage: S3 sau Supabase Storage
- Payment: Stripe
- `app/api/auth/[...nextauth]/route.ts`
- `lib/db/` - Database queries
- `components/auth/` - Auth components
- `components/premium/` - Premium features
- `components/cover-letter/` - Cover letter builder
- `lib/ats/` - ATS compatibility checker

### Database Schema V3:

```sql
- users (id, email, name, premium, created_at)
- resumes (id, user_id, data, template, created_at, updated_at)
- shared_resumes (id, resume_id, share_token, views, expires_at)
- feedback (id, resume_id, user_id, content, created_at)
- templates (id, name, category, premium, price)
```

---

## Prioritizare Tasks MVP

1. Recreate types și utils (șterse anterior)
2. Implementare `use-local-storage` hook
3. Implementare formular Work Experience
4. Implementare formular Education
5. Implementare formular Skills
6. Implementare Modern template cu preview
7. Integrare toate formularele în `/create` page
8. Testing și bug fixes

## Estimări:

- **MVP**: 2-3 săptămâni (funcțional complet)
- **V1**: +2 săptămâni (toate template-urile + PDF)
- **V2**: +3-4 săptămâni (AI + import + analytics)
- **V3**: +4-6 săptămâni (platform completă cu auth + DB)

## Note Arhitecturale:

### State Management:

- MVP & V1: React Context + custom hooks (use-resume)
- V2 & V3: Consideră Zustand sau Redux Toolkit pentru state complex

### Styling:

- Continuă cu Tailwind + shadcn/ui (consistență)
- Template-uri: CSS-in-JS pentru PDF export

### Performance:

- Lazy loading pentru template-uri
- Debounce pentru auto-save (500ms)
- Memoization pentru preview (React.memo)

### Testing:

- Unit tests: Vitest + React Testing Library
- E2E: Playwright
- Start testing din V1

CV Auto-Optimizer pentru Job Posting (V1.5)
ROI: Massive - direct job landing rate increase
Effort: Medium (OpenAI integration)
Application Tracker cu Auto Follow-ups (V2)
ROI: High - organization + automation
Effort: Medium
ATS Score Checker (V1.5)
ROI: High - increases interview chances
Effort: Low-Medium (rule-based + ML)
Skills Gap Analysis (V2)
ROI: High - career development
Effort: Medium (job data scraping)
Interview Prep Assistant (V2)
ROI: High - final conversion step
Effort: Medium (AI integration)
