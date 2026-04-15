# Beta 0.1 — Release Notes

**Date:** 2026-04-15
**Branch:** `preview`

---

## Mobile Template Picker — Bottom Sheet

Replaced the hard-to-use dropdown `<Select>` in the mobile Live Preview with a **Drawer (bottom sheet)** that slides up from the bottom.

- Proper touch targets, swipe-to-dismiss, smooth scrolling
- Grouped by category (Modern, Classic, Creative, ATS-Optimized)
- ATS compatibility dots, popular star icons, layout icons (single-column / two-column / sidebar)
- ATS legend footer
- Desktop popover behavior unchanged

**Files:** `components/resume/mobile-preview-overlay.tsx`, `components/resume/template-picker.tsx`, `components/ui/drawer.tsx` (new, via shadcn)

---

## Cleaner Contact Link Display

Shortened display text for LinkedIn, GitHub, and website links across all 28 resume templates.

| Field | Before | After |
|-------|--------|-------|
| LinkedIn | `linkedin.com/in/jordan-parker` | `in/jordan-parker` |
| GitHub | `github.com/jordan-parker` | `jordan-parker` |
| Website | unchanged | unchanged |

Full URLs remain in the `href` — only the visible label is shorter. Fixes overlap issues on narrow templates (e.g. Minimalist).

**Files:** `lib/utils/contact-display.ts`, `lib/utils/__tests__/contact-display.test.ts`

---

## Minimalist Template — Contact Layout Fix

Fixed LinkedIn link overlapping with location text in the right-aligned contact section. Changed location container from `inline-flex` to `flex` with `justify-end`.

**File:** `components/resume/templates/minimalist-template.tsx`

---

## Double Toast on Logout — Fixed

Logging out previously showed two toasts: "Logged out successfully" and "Please log in to access the dashboard". The second was triggered by the auth guard redirect.

Fix: a `just_logged_out` sessionStorage flag tells the login page to skip the auth-redirect toast. Applied to three flows:

- **Logout** (`hooks/use-user.ts`)
- **Session expired** (`hooks/use-user.ts`)
- **Account deletion** (`app/settings/components/account-danger-zone.tsx`)

**Files:** `hooks/use-user.ts`, `app/login/page.tsx`, `app/settings/components/account-danger-zone.tsx`

---

## Auth Pages — Consistent Brand Logo

Replaced the placeholder Lucide `Sparkles` icon with the real `<Logo>` component on all auth pages:

- `app/login/page.tsx` — desktop sidebar (full wordmark, 200px) + mobile (icon-only, 36px)
- `app/register/page.tsx` — desktop sidebar (full wordmark, 200px) + mobile (icon-only, 36px)
- `app/verify-email/page.tsx` — centered icon (160px)
- `app/onboarding/onboarding-content.tsx` — desktop sidebar (200px) + mobile header (140px)

Mobile uses icon-only variant so it doesn't compete with the page heading.

---

## Summary

- **10 files changed**, ~444 additions, ~219 deletions
- **Dependencies added:** `vaul` (drawer primitive, via shadcn)
- **New component:** `components/ui/drawer.tsx`
- **Tests updated:** contact-display tests (29/29 passing)
