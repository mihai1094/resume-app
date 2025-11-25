# Conditional Action UX Research

Deep dive into how ResumeForge currently surfaces conditional actions (header CTAs, user dropdown, `/my-resumes` cards) and recommended UX patterns to improve clarity, priority, and responsiveness.

## 1. Current Experience Audit

### Header Buttons (`components/layout/site-header.tsx`)

| State                | Visible CTAs                                                                                                           | Logic Source                   | Observations                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Logged out (desktop) | `Blog`, `Login`, primary `Get Started`                                                                                 | `user` null check              | Clear CTA hierarchy, but lacks quick access to `/create` copy explaining value.                                                    |
| Logged in (desktop)  | `Blog`, `My CVs`, `My Cover Letters`, `New Cover Letter` + avatar dropdown                                             | Branch inside header component | Duplicated entry points (buttons + dropdown) create choice overload; no direct `New Resume` CTA although available in other flows. |
| Logged out (mobile)  | `Get Started`, hamburger for `Blog` and `Login`                                                                        | `mobileMenuOpen` state         | Primary CTA available but no quick route to login when hamburger closed.                                                           |
| Logged in (mobile)   | Avatar toggles sheet with profile info plus stacked buttons (Blog, My CVs, My Cover Letters, New Cover Letter, Logout) | `mobileMenuOpen` + `user`      | Sheet is comprehensive but lacks `Create Resume` parity with desktop and includes destructive `Log out` inline with primaries.     |

**User dropdown items**

- `My Resumes`, `My Cover Letters`, `New Cover Letter`, `Log out`.
- All items unconditional; no empty-state guidance, no grouping, and redundant with header buttons.

### `/my-resumes` Page (`app/my-resumes/my-resumes-content.tsx`)

| Area                | Actions                                                                               | When visible                                                                                                                       | Notes                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Header (desktop)    | `Back to Home`, `Optimize Resume for Job` (AI dialog), `Create New Resume`            | Always, optimize dialog gated only by button                                                                                       | High cognitive load: three buttons plus avatar. Optimize is always enabled even if no resume is selected later.                        |
| Header (mobile)     | Floating `+` to `/create`, overflow menu for optimize/back                            | Overflow hides AI feature; menu mixes navigation & workflow actions.                                                               |
| Empty state card    | `Create Your First Resume`, `Add Dummy CV (Dev)`                                      | `resumes.length === 0`                                                                                                             | Clear but CTA text differs from global copy (“Resume” vs “CV”), and dev CTA exposed to end users.                                      |
| Resume card actions | `JobMatcher` (“AI Optimize”), `Edit Resume`, `Export PDF`, `Export JSON`, delete icon | Optimize button rendered only when resume has first/last name AND work/education entries; export PDF shows loading state per card. | Stack of buttons competes for attention; destructive delete icon placed top-right without confirmation text (only `confirm()` dialog). |
| Hover overlay       | `Quick Preview` button                                                                | Always, via `group-hover`                                                                                                          | Hidden on touch devices; no alternate preview entry.                                                                                   |

## 2. Reference UX Heuristics & Patterns

1. **Progressive Disclosure** (Nielsen): keep primary actions inline, tuck secondary/destructive actions into menus to avoid overload.
2. **State-Driven Eligibility**: disabled buttons should communicate prerequisites (microcopy next to control) instead of letting dialogs fail later.
3. **Consistency & Parity**: actions offered in dropdowns vs inline buttons should mirror across breakpoints; duplicate entry points should either be consolidated or materially differentiated.
4. **Action Grouping**: cluster actions by intent (Create, Manage, Export, Danger) with spacing or separators to reduce scanning effort.
5. **Responsive CTA Priority**: On mobile, limit to single primary CTA per cluster; move complex flows (AI optimize) behind FAB or sheet with context so they don’t hijack vertical space.
6. **Destructive Action Safeguards**: require two-step patterns (icon -> “Delete” tooltip text + confirmation modal) rather than browser `confirm()`.
7. **Empty & Loading States**: pair CTA with explanation of what will happen next; if some actions rely on data readiness, display skeleton or inline alert instead of hiding the action entirely.

## 3. Recommendations Mapped to ResumeForge

### 3.1 Header CTA Logic

- **Single “Create” Split Button**: replace `My CVs`/`New Cover Letter` duplicates with one primary “Create” button (defaulting to resume) and dropdown for cover letter / CV variations.
- **Conditional Tooltip / Disabled State**: when user not logged in, clicking “Create” should prompt lightweight sign-in sheet instead of silent redirect.
- **Reduce Redundancy**: keep navigation links (`My CVs`, `My Cover Letters`) either in header OR dropdown, not both. Suggest keeping them in dropdown to keep header lightweight.
- **Mobile FAB**: add bottom-right floating `+` for logged-in users that opens action sheet (New Resume, New Cover Letter). Keeps header less crowded and accessible on tall screens.

### 3.2 User Dropdown Information Architecture

- **Groupings**:
  - _Workspace_: `My Resumes`, `My Cover Letters`.
  - _Create_: `New Resume`, `New Cover Letter`.
  - _Account_: `Account Settings` (even if future) and `Log out`.
- **State notes**: display badge counts (e.g., number of resumes) fetched from `useSavedResumes` if available to help user choose.
- **Contextual info**: show last updated resume snippet (“ResumeForge AI Template · Updated Nov 18”) to tie identity to work.
- **Responsive parity**: mobile sheet mirrors same grouping; dangerous logout button separated with subtle background and confirmation sheet.

### 3.3 `/my-resumes` Page Actions

| Area                | Recommendation                                                                                                                                                                                                                          | Rationale                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Global header       | Replace three buttons with priority pair: primary “Create Resume”, secondary ghost “Optimize for Job” that opens dialog but stays disabled until at least one eligible resume detected; icon-only back arrow can sit inline with title. | Highlights main task (create/update) while still surfacing AI feature contextually.       |
| Optimize dialog     | Pre-select most recently updated resume; if requirements unmet, show inline alert `Add work experience to unlock AI suggestions`. Provide skeleton result container so button doesn’t jump.                                             | Eliminates modal churn and clarifies prerequisites.                                       |
| Empty state         | Remove developer CTA, add supporting copy with bullet list of benefits; include “Import existing resume (JSON)” secondary option if feature exists.                                                                                     | Keeps production users focused and reduces confusion between “CV” vs “Resume”.            |
| Resume card layout  | Switch to card footer segmented buttons: primary action (“Edit”) full-width, secondary actions icon buttons with tooltips (`AI`, `PDF`, `JSON`, `Delete`). Add tertiary “Preview” link inside metadata for touch devices.               | Reduces vertical stacking and clarifies hierarchy while keeping quick actions accessible. |
| Delete flow         | Replace immediate `confirm()` with `Dialog` requiring resume name confirmation or at least explicit copy; move delete entry into overflow (`...`).                                                                                      | Prevents accidental deletions.                                                            |
| JobMatcher button   | Instead of fully hiding when requirements unmet, show disabled button with helper text “Add experience to unlock AI Optimize”.                                                                                                          | Communicates value and encourages completion.                                             |
| Mobile interactions | Provide swipeable sheet listing actions for each card (similar to mobile OS share sheet) to avoid tiny buttons; ensure quick preview accessible via long-press or explicit `Preview` link.                                              | Keeps tap targets ≥48px and accessible.                                                   |

### 3.4 Conditional Logic Summary

| Action                            | Conditions                                                             | UX Behavior                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Create Resume`                   | Logged-in user                                                         | Primary button/fab. If logged out, open sign-in modal with option to continue as guest (if supported).                                     |
| `New Cover Letter`                | Logged-in user                                                         | Located within Create split button/dropdown to signal relation to resumes.                                                                 |
| `My Resumes` / `My Cover Letters` | Logged-in user with saved items?                                       | Always available, but display mini-empty-state (tooltip “No resumes yet — start by creating one”) when count is zero.                      |
| `AI Optimize`                     | Resume contains base personal info + at least one work/education block | Disabled with helper text until requirements satisfied; when ready, highlight with badge and optionally toast when AI suggestions updated. |
| `Export PDF/JSON`                 | Resume saved (has ID)                                                  | Keep enabled but show inline loading indicator for the specific card; on mobile, move to overflow to avoid mis-taps.                       |

Implementing the above keeps actions discoverable without overwhelming users, communicates eligibility clearly, and provides parity between desktop and mobile experiences while aligning with established UX heuristics.
