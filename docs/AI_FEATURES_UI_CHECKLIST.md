# AI Features UI Checklist

Status legend: `[ ] pending` · `[~] in progress` · `[x] done`

## P1 – Esențiale (MVP)

- [x] Bullet Point Generator – buton + loading + toast + cache badge în Work Experience
- [x] Professional Summary Generator – ton selectabil, diff before/after, regen rapid
- [x] Real ATS Optimization – dialog cu JD, scor, keyword diff, apply fix buttons
- [x] Skill Recommendations – carduri cu motiv, relevanță, bulk-add, filtre pe categorie
- [x] Cover Letter Generator – dialog de input, regen pe secțiuni, preview sincron

## P2 – UX îmbunătățit

- [x] Real-Time Writing Assistant – chips inline, auto-apply opțional, debounce 1s
- [x] Achievement Quantifier – lângă bullet, 2-3 variante cu metrici realiste
- [x] Improve Bullet Point – existent; afișează before/after și motive

## P3 – Avansat / Premium

- [x] Resume Tailoring Assistant – wizard JD → variante, change log, save as copy
- [x] Interview Prep Generator – 8-10 întrebări mix, practice mode, export notițe
- [ ] LinkedIn Profile Optimizer – headline, about, bullets stil LinkedIn, top skills

## Elemente transversale (toate feature-urile)

- [ ] Bara globală AI (Control Bar) cu stări: Ready / Generating / Cached / Error
- [ ] Panou lateral/drawer „Insights” cu tab-uri: Suggestions · ATS · Keywords · Skills · Company
- [ ] Indicarea cost/ETA și hit cache în toast/tooltip
- [ ] Stări de încărcare și erori consistente; retry rapid
- [ ] Mobile-first: acțiuni în bottom sheet, tap targets ≥44px

## Testare per feature

- [ ] Calitate AI ≥ 8/10 (revizuire manuală)
- [ ] Răspuns < 15s (ATS/Tailor pot fi mai lungi, dar cu ETA)
- [ ] Cache rate conform așteptărilor (±10%)
- [ ] A11y: focus, SR labels, tastatură, contrast
- [ ] Mobile și desktop verificate

## Următorii pași recomandați

1. Integrează bara AI + panou Insights în editor/cover letter.
2. Adaugă quantifier + writing assistant inline în bullets și cover letter.
3. Extinde ATS cu diff și apply buttons; cover letter regen pe secțiuni.
4. Lansează Tailor și Interview Prep ca flow-uri cu wizard și export.
