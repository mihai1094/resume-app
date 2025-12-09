# AI Refactor Plan (content-generator.ts)

Goal: split oversized `lib/ai/content-generator.ts` into focused modules, restore stability, and keep type safety without `any`.

## Guiding principles

- One feature per module (single responsibility).
- Strict typing; zero `any`.
- Tolerant parsers with shared helpers.
- No API shape changes for existing routes unless noted.

## Task list (small steps)

1. **Restore baseline safely**
   - Recreate `content-generator.ts` as a barrel that re-exports feature functions from submodules.
   - Keep existing public signatures to avoid breaking API routes.
2. **Extract shared utilities**
   - Move `extractJson`, `serializeResume`, `fallbackCoverLetterFromText`, `extractMetrics` into `lib/ai/shared.ts`.
   - Move `flashModel`/`safety` re-exports to `shared.ts` (import from `gemini-client`).
3. **Split by feature into modules under `lib/ai/`**
   - `bullets.ts`: generateBulletPoints, improveBulletPoint.
   - `summary.ts`: generateSummary.
   - `skills.ts`: suggestSkills.
   - `ats.ts`: analyzeATSCompatibility.
   - `cover-letter.ts`: generateCoverLetter.
   - `writing.ts`: analyzeText (writing assistant).
   - `quantifier.ts`: quantifyAchievement.
   - `interview-prep.ts`: generateInterviewPrep.
   - `tailor.ts`: tailorResume.
   - `score.ts`: scoreResume.
   - `linkedin.ts`: optimizeLinkedInProfile.
4. **Refactor feature by feature**
   - For each module: import shared helpers, use strict types from `content-types.ts`, no `any`.
   - Keep parsing fallbacks (JSON and heuristic).
   - Add unit-safe guards (length, required fields).
5. **Wire barrel**
   - `content-generator.ts` re-exports all functions/types from modules.
6. **Update imports**
   - Fix API routes and UI imports to use barrel (same paths) so no breaking changes.
7. **Lint & test**
   - Run lint on `lib/ai/**`.
   - Manual sanity: generate cover letter, ATS, quantifier.

## Notes

- Keep cache keys unchanged.
- Do not change API response shapes.
- After split, consider adding unit tests for JSON parsing helpers.\*\*\*
