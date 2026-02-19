# SEO Google Plan (90 zile) - 2026

## Obiectiv
Crestere trafic non-brand, indexare curata si imbunatatire CTR/rank pentru intenturile "AI resume builder" si "ATS resume".

## KPI-uri tinta (90 zile)
- Non-brand clicks: +80-120%
- Average CTR pe top 20 query-uri: +2-4 pp
- Important pages indexed: >= 95%
- Erori tehnice (sitemap/canonical/rich results): 0 critice
- Core Web Vitals:
  - LCP <= 2.5s (p75 mobile)
  - INP <= 200ms (p75 mobile)
  - CLS <= 0.1 (p75 mobile)

## Status implementare tehnica
- [x] URL sanitation centralizat pentru URL-urile publice
- [x] Sitemap curatat (numai pagini publice indexabile)
- [x] Robots actualizat pentru crawl hygiene
- [x] Structured data FAQ/HowTo mutat din layout global pe homepage
- [x] Noindex pe pagini private/auth
- [x] Canonical explicit pe paginile publice principale

## Cluster map (keyword -> pagina tinta)

### Cluster 1: Transactional (BOFU)
- ai resume builder -> `/`
- ats resume builder -> `/`
- resume builder with templates -> `/templates`
- cover letter builder -> `/cover-letter`
- resume builder pricing -> `/pricing`

### Cluster 2: Commercial investigation (MOFU)
- best ats resume templates -> `/templates`
- ats friendly resume examples -> `/preview`
- ai resume optimizer -> `/blog` + articole suport

### Cluster 3: Informational (TOFU)
- how to pass ats screening -> `/blog/how-to-pass-ats-screening`
- ats keywords for resume -> articol nou blog
- quantify resume bullet points -> articol nou blog

## Content roadmap (12 articole)

### Luna 1
- ATS resume checklist 2026
- Resume headline formulas that improve interviews
- AI resume myths vs reality
- Best resume format for ATS (US market)

### Luna 2
- Resume keywords by role (engineering, sales, marketing)
- How to tailor resume to job description (step-by-step)
- Action verbs + metrics playbook
- Common ATS parsing errors

### Luna 3
- Cover letter framework with examples
- Public resume link best practices
- Resume mistakes recruiters reject in 10 seconds
- Portfolio + resume pairing strategy

## Internal linking rules
- Fiecare articol link catre:
  - `/` (primary conversion)
  - `/templates` (template intent)
  - `/cover-letter` (secondary conversion)
- Din paginile comerciale catre 2-3 articole relevante (contextual links).
- Anchor text descriptiv, nu generic ("click here").

## On-page standard
- Title: 45-60 chars, keyword principal in prima jumatate
- Meta description: 130-155 chars, orientata pe benefit + CTA
- H1: 1 singur, aliniat cu intentul query-ului
- H2/H3: acopera intrebari reale (PAA intent)
- FAQ section pe paginile unde exista intrebari recurente

## Measurement cadence
- Saptamanal:
  - Query gains/losses in GSC
  - Indexing coverage
  - Rich results status
- Lunar:
  - Landing pages by clicks and CTR
  - Cannibalization check pe clustere
  - Content decay refresh list

## Setup operational (daca lipseste)
- Google Search Console property + URL prefix validate
- Submit `https://<domain>/sitemap.xml`
- Connect GSC + GA4 (Looker Studio dashboard)
- Monitor Core Web Vitals (Search Console + CrUX)

## Prioritati urmatoare (executie)
1. Publicare 4 articole din Luna 1 cu brief SEO complet.
2. Re-optimizare title/meta pe paginile `/`, `/templates`, `/cover-letter`, `/pricing`.
3. Implementare dashboard SEO (GSC exports) cu baseline si target.
