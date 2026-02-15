# ResumeForge - Comprehensive Test Plan

## Overview

Complete test plan derived from `docs/USER_FLOW.md`. Covers every documented user flow, feature, and interaction. Tests are organized by feature area with priority levels:

- **P0** = Critical path, must pass before any release
- **P1** = High priority, must pass before production deploy
- **P2** = Medium priority, should pass for quality release
- **P3** = Low priority, nice-to-have coverage

**Test Types:**

- **Unit** = Vitest unit/integration test (automated)
- **E2E** = End-to-end browser test (Playwright)
- **Manual** = Manual verification required

---

## 1. Home Page (`/`)

### 1.1 Hero Section (P1)

| Test ID  | Test Case                  | Type | Steps                                                            | Expected Result                                                  |
| -------- | -------------------------- | ---- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| HOME-001 | Hero headline renders      | Unit | 1. Render home page                                              | "Land interviews, not rejections." visible with typing animation |
| HOME-002 | Primary CTA (guest)        | E2E  | 1. Visit `/` as guest 2. Click "Create Your Resume"              | Redirected to `/register`                                        |
| HOME-003 | Primary CTA (logged in)    | E2E  | 1. Visit `/` as authenticated user 2. Click "Create Your Resume" | Redirected to `/templates`                                       |
| HOME-004 | Secondary CTA (guest)      | E2E  | 1. Click "or create a Cover Letter" as guest                     | Redirected to `/register`                                        |
| HOME-005 | Secondary CTA (logged in)  | E2E  | 1. Click "or create a Cover Letter" as authenticated user        | Redirected to `/cover-letter`                                    |
| HOME-006 | Trust badges visible       | Unit | 1. Render hero section                                           | "Free to start", "No credit card", "ATS-optimized" badges shown  |
| HOME-007 | Interactive resume preview | Unit | 1. Render hero section                                           | Auto-rotating template preview (Modern, Classic, Creative)       |

### 1.2 Stats Section (P2)

| Test ID  | Test Case               | Type | Steps                      | Expected Result                                              |
| -------- | ----------------------- | ---- | -------------------------- | ------------------------------------------------------------ |
| HOME-008 | Stats display correctly | Unit | 1. Render stats section    | Shows: 22 templates, 15+ ATS-friendly, < 5 min, Live preview |
| HOME-009 | Animated counters       | Unit | 1. Scroll to stats section | Numbers animate on viewport entry                            |

### 1.3 Key Benefits Section (P2)

| Test ID  | Test Case       | Type | Steps                      | Expected Result                                                   |
| -------- | --------------- | ---- | -------------------------- | ----------------------------------------------------------------- |
| HOME-010 | Benefits render | Unit | 1. Render benefits section | 4 benefits shown: PDF Export, AI Optimization, Templates, Preview |

### 1.4 Templates Preview (P2)

| Test ID  | Test Case                | Type | Steps                         | Expected Result                                        |
| -------- | ------------------------ | ---- | ----------------------------- | ------------------------------------------------------ |
| HOME-011 | Featured templates shown | Unit | 1. Render templates preview   | Top 3 templates displayed (Adaptive, Modern, Timeline) |
| HOME-012 | View All Templates link  | E2E  | 1. Click "View All Templates" | Navigates to `/templates`                              |

### 1.5 How It Works (P2)

| Test ID  | Test Case    | Type | Steps             | Expected Result                                              |
| -------- | ------------ | ---- | ----------------- | ------------------------------------------------------------ |
| HOME-013 | Steps render | Unit | 1. Render section | 3 steps: Choose Template, Fill Information, Download & Apply |

### 1.6 FAQ Section (P2)

| Test ID  | Test Case          | Type | Steps                 | Expected Result          |
| -------- | ------------------ | ---- | --------------------- | ------------------------ |
| HOME-014 | FAQ accordion      | E2E  | 1. Click FAQ question | Answer expands/collapses |
| HOME-015 | All 7 FAQs present | Unit | 1. Render FAQ section | 7 FAQ items rendered     |

### 1.7 Footer (P2)

| Test ID  | Test Case         | Type | Steps                     | Expected Result                |
| -------- | ----------------- | ---- | ------------------------- | ------------------------------ |
| HOME-016 | Footer links work | E2E  | 1. Click each footer link | Navigates to correct page      |
| HOME-017 | Footer renders    | Unit | 1. Render footer          | All sections and links present |

---

## 2. Authentication Flow

### 2.1 Registration (P0)

| Test ID  | Test Case                               | Type | Steps                                                                                                               | Expected Result                                                                     |
| -------- | --------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| AUTH-001 | Email registration                      | E2E  | 1. Go to `/register` 2. Enter valid first name, last name, email, password 3. Check terms 4. Click "Create account" | Account created, toast "Account created successfully!", redirected to `/onboarding` |
| AUTH-002 | First name required                     | Unit | 1. Submit with empty first name                                                                                     | Validation error on first name                                                      |
| AUTH-003 | Last name required                      | Unit | 1. Submit with empty last name                                                                                      | Validation error on last name                                                       |
| AUTH-004 | Email validation                        | Unit | 1. Enter "notanemail"                                                                                               | "Please enter a valid email address" error                                          |
| AUTH-005 | Password min 8 chars                    | Unit | 1. Enter "Ab1!" (4 chars)                                                                                           | Password validation error                                                           |
| AUTH-006 | Password needs uppercase                | Unit | 1. Enter "abcdef1!"                                                                                                 | Password requirement not met                                                        |
| AUTH-007 | Password needs lowercase                | Unit | 1. Enter "ABCDEF1!"                                                                                                 | Password requirement not met                                                        |
| AUTH-008 | Password needs number                   | Unit | 1. Enter "Abcdefg!"                                                                                                 | Password requirement not met                                                        |
| AUTH-009 | Password needs special char             | Unit | 1. Enter "Abcdefg1"                                                                                                 | Password requirement not met                                                        |
| AUTH-010 | Password strength indicator             | Unit | 1. Type progressively stronger passwords                                                                            | Indicator shows Weak → Medium → Strong                                              |
| AUTH-011 | Terms checkbox required                 | Unit | 1. Fill all fields, leave terms unchecked 2. Submit                                                                 | Cannot submit without terms                                                         |
| AUTH-012 | Duplicate email                         | E2E  | 1. Register with existing email                                                                                     | Error: "An account with this email already exists"                                  |
| AUTH-013 | Google sign-up                          | E2E  | 1. Click "Sign up with Google" 2. Complete OAuth                                                                    | Account created, redirected to `/onboarding`                                        |
| AUTH-014 | Google sign-up new user metadata        | E2E  | 1. Google sign-up with new account                                                                                  | User metadata created in Firestore                                                  |
| AUTH-015 | Registration creates Firestore metadata | E2E  | 1. Email registration                                                                                               | User metadata document created                                                      |

### 2.2 Login (P0)

| Test ID  | Test Case               | Type | Steps                                                          | Expected Result                    |
| -------- | ----------------------- | ---- | -------------------------------------------------------------- | ---------------------------------- |
| AUTH-016 | Email login             | E2E  | 1. Go to `/login` 2. Enter valid credentials 3. Click "Log in" | Toast: "Welcome back!", redirected |
| AUTH-017 | Invalid credentials     | E2E  | 1. Enter wrong password                                        | Error: "Invalid email or password" |
| AUTH-018 | Google login            | E2E  | 1. Click "Continue with Google"                                | Success login                      |
| AUTH-019 | Post-login: has resumes | E2E  | 1. Login with user who has resumes                             | Redirected to `/dashboard`         |
| AUTH-020 | Post-login: no resumes  | E2E  | 1. Login with user who has no resumes                          | Redirected to `/`                  |
| AUTH-021 | Post-login: returnTo    | E2E  | 1. Try to access `/editor/123` unauthenticated 2. Login        | Redirected to `/editor/123`        |
| AUTH-022 | Forgot password link    | E2E  | 1. Click "Forgot password?" on login                           | Navigates to `/forgot-password`    |
| AUTH-023 | Sign up link from login | E2E  | 1. Click "Sign up for free" on login                           | Navigates to `/register`           |
| AUTH-024 | Session persistence     | E2E  | 1. Login 2. Close tab 3. Reopen app                            | Still logged in                    |

### 2.3 Password Recovery (P1)

| Test ID  | Test Case                | Type   | Steps                                                                 | Expected Result                                |
| -------- | ------------------------ | ------ | --------------------------------------------------------------------- | ---------------------------------------------- |
| AUTH-025 | Request password reset   | E2E    | 1. Go to `/forgot-password` 2. Enter email 3. Click "Send reset link" | Confirmation screen shown, email sent          |
| AUTH-026 | Reset with invalid email | E2E    | 1. Enter non-existent email                                           | Appropriate error or silent success (security) |
| AUTH-027 | Reset link works         | Manual | 1. Request reset 2. Click email link 3. Enter new password            | Password updated, can login with new password  |

### 2.4 Route Protection (P0)

| Test ID  | Test Case                  | Type | Steps                                               | Expected Result                            |
| -------- | -------------------------- | ---- | --------------------------------------------------- | ------------------------------------------ |
| AUTH-028 | Dashboard requires auth    | E2E  | 1. Visit `/dashboard` unauthenticated               | Redirected to `/login`                     |
| AUTH-029 | Editor requires auth       | E2E  | 1. Visit `/editor/new` unauthenticated              | Redirected to `/login`                     |
| AUTH-030 | Cover letter requires auth | E2E  | 1. Visit `/cover-letter` unauthenticated            | Redirected to `/login`                     |
| AUTH-031 | Settings requires auth     | E2E  | 1. Visit `/settings` unauthenticated                | Redirected to `/login`                     |
| AUTH-032 | Onboarding requires auth   | E2E  | 1. Visit `/onboarding` unauthenticated              | Redirected to `/login`                     |
| AUTH-033 | AuthGuard loading state    | Unit | 1. Render AuthGuard while auth loading              | Loading spinner shown                      |
| AUTH-034 | Return URL preserved       | E2E  | 1. Visit protected route 2. Get redirected to login | Toast: "Please log in to access {feature}" |

### 2.5 Logout (P0)

| Test ID  | Test Case | Type | Steps                                  | Expected Result                |
| -------- | --------- | ---- | -------------------------------------- | ------------------------------ |
| AUTH-035 | Logout    | E2E  | 1. Click user menu 2. Click "Sign out" | Logged out, redirected to home |

---

## 3. Onboarding Flow (`/onboarding`)

### 3.1 Step 1: Choose How to Begin (P0)

| Test ID | Test Case                      | Type | Steps                                                             | Expected Result                                                                                             |
| ------- | ------------------------------ | ---- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ONB-001 | Start from scratch             | E2E  | 1. Enter job title                                                | Job title saved, can proceed to step 2                                                                      |
| ONB-002 | Popular role buttons           | E2E  | 1. Click "Software Engineer" button                               | Job title populated                                                                                         |
| ONB-003 | All popular roles present      | Unit | 1. Render step 1                                                  | Shows: Software Engineer, Product Manager, Data Scientist, UX Designer, Marketing Manager, Business Analyst |
| ONB-004 | Custom job title input         | E2E  | 1. Type custom job title                                          | Real-time validation, title accepted                                                                        |

### 3.2 Step 2: Template Selection (P0)

| Test ID | Test Case                               | Type | Steps                                   | Expected Result                            |
| ------- | --------------------------------------- | ---- | --------------------------------------- | ------------------------------------------ |
| ONB-005 | Template recommendations for tech       | Unit | 1. Set job title to "Software Engineer" | Recommended: Technical, Modern, Minimalist |
| ONB-006 | Template recommendations for business   | Unit | 1. Set job title to "Business Analyst"  | Recommended: Executive, Ivy, Classic       |
| ONB-007 | Template recommendations for creative   | Unit | 1. Set job title to "UX Designer"       | Recommended: Creative, Timeline, Modern    |
| ONB-008 | Template recommendations for management | Unit | 1. Set job title to "Product Manager"   | Recommended: Executive, Modern, Classic    |
| ONB-009 | Recommended badge shown                 | Unit | 1. Render template cards                | AI-recommended templates have badge        |
| ONB-010 | ATS compatibility shown                 | Unit | 1. Render template cards                | ATS score visible on each card             |
| ONB-011 | Template preview thumbnail              | Unit | 1. Render template cards                | Preview thumbnails render correctly        |
| ONB-012 | Select template                         | E2E  | 1. Click on a template card             | Template selected, highlighted             |

### 3.3 Navigation (P0)

| Test ID | Test Case                     | Type | Steps                                           | Expected Result                                            |
| ------- | ----------------------------- | ---- | ----------------------------------------------- | ---------------------------------------------------------- |
| ONB-013 | Back button hidden on step 1  | Unit | 1. Render step 1                                | Back button not visible                                    |
| ONB-014 | Back button visible on step 2 | Unit | 1. Navigate to step 2                           | Back button visible                                        |
| ONB-015 | Next button advances          | E2E  | 1. Fill step 1 2. Click Next                    | Advances to step 2                                         |
| ONB-016 | Skip setup                    | E2E  | 1. Click "Skip setup"                           | Redirected to `/editor/new`                                |
| ONB-017 | Create Resume final button    | E2E  | 1. Complete both steps 2. Click "Create Resume" | Redirected to `/editor/new?template={id}&jobTitle={title}` |

---

## 4. Dashboard (`/dashboard`)

### 4.1 Layout & Header (P0)

| Test ID  | Test Case                           | Type | Steps                                            | Expected Result                    |
| -------- | ----------------------------------- | ---- | ------------------------------------------------ | ---------------------------------- |
| DASH-001 | Dashboard renders                   | E2E  | 1. Navigate to `/dashboard`                      | Page loads with header and content |
| DASH-002 | "My Resumes" title                  | Unit | 1. Render header                                 | Title displayed                    |
| DASH-003 | Create Resume button (first resume) | E2E  | 1. No resumes exist 2. Click "Create Resume"     | Navigates to `/onboarding`         |
| DASH-004 | Create Resume button (has resumes)  | E2E  | 1. Has existing resumes 2. Click "Create Resume" | Navigates to `/editor/new`         |
| DASH-005 | Optimize for Job button             | E2E  | 1. Click "Optimize for Job"                      | Optimize dialog opens              |

### 4.2 Stats Section (P1)

| Test ID  | Test Case           | Type | Steps                               | Expected Result              |
| -------- | ------------------- | ---- | ----------------------------------- | ---------------------------- |
| DASH-006 | Total Resumes count | Unit | 1. Render stats with 2 resumes      | Shows "2 / 3" (or limit)     |
| DASH-007 | Cover Letters count | Unit | 1. Render stats with 1 cover letter | Shows "1 / 3"                |
| DASH-008 | AI Credits display  | Unit | 1. Render stats                     | Shows current credit balance |

### 4.3 Tabs (P0)

| Test ID  | Test Case                 | Type | Steps                                | Expected Result                           |
| -------- | ------------------------- | ---- | ------------------------------------ | ----------------------------------------- |
| DASH-009 | Resumes tab default       | Unit | 1. Render dashboard                  | Resumes tab active by default             |
| DASH-010 | Resumes empty state       | Unit | 1. Render with no resumes            | OnboardingChecklist shown                 |
| DASH-011 | Resumes with data         | Unit | 1. Render with resumes               | Resume cards in grid (1-3 columns)        |
| DASH-012 | Cover Letters tab         | E2E  | 1. Click "Cover Letters" tab         | Cover letters tab content shown           |
| DASH-013 | Cover Letters empty state | Unit | 1. Switch to cover letters with none | EmptyState with "Create Cover Letter" CTA |
| DASH-014 | Cover Letters with data   | Unit | 1. Render with cover letters         | Cover letter cards in grid                |

### 4.4 Resume Card (P0)

| Test ID  | Test Case              | Type | Steps                                       | Expected Result                                                        |
| -------- | ---------------------- | ---- | ------------------------------------------- | ---------------------------------------------------------------------- |
| DASH-015 | Card header info       | Unit | 1. Render resume card                       | Shows: name (truncated), template badge, last updated, readiness badge |
| DASH-016 | Edit button            | E2E  | 1. Click "Edit" on resume card              | Navigates to `/editor/{id}`                                            |
| DASH-017 | Preview button         | E2E  | 1. Click "Preview" on resume card           | Preview dialog opens                                                   |
| DASH-018 | PDF export button      | E2E  | 1. Click "PDF" on resume card               | PDF download starts                                                    |
| DASH-019 | DOCX export button     | E2E  | 1. Click "DOCX" on resume card              | DOCX download starts                                                   |
| DASH-020 | Cover Letter AI tool   | E2E  | 1. Click "Cover Letter" on card             | Cover letter generation dialog opens                                   |
| DASH-021 | Optimize AI tool       | E2E  | 1. Click "Optimize" on card                 | ATS optimization dialog opens                                          |
| DASH-022 | More menu: Preview     | E2E  | 1. Open more menu 2. Click "Preview"        | Preview dialog opens                                                   |
| DASH-023 | More menu: Export JSON | E2E  | 1. Open more menu 2. Click "Export JSON"    | JSON file downloads                                                    |
| DASH-024 | More menu: Delete      | E2E  | 1. Open more menu 2. Click "Delete"         | Confirmation dialog shown                                              |
| DASH-025 | Delete confirmation    | E2E  | 1. Click delete 2. Click "Delete" in dialog | Resume deleted, removed from list                                      |
| DASH-026 | Delete cancellation    | E2E  | 1. Click delete 2. Click "Cancel"           | Resume not deleted                                                     |

### 4.5 Resume Grouping (P1)

| Test ID  | Test Case                     | Type | Steps                                    | Expected Result         |
| -------- | ----------------------------- | ---- | ---------------------------------------- | ----------------------- |
| DASH-027 | Master resume shows actions   | Unit | 1. Render master resume                  | All actions visible     |
| DASH-028 | Tailored versions collapsible | E2E  | 1. Click to expand tailored versions     | Tailored versions shown |
| DASH-029 | Tailored count badge          | Unit | 1. Master resume has 3 tailored versions | Badge shows "3"         |

### 4.6 Cover Letter Card (P1)

| Test ID  | Test Case                  | Type | Steps                                | Expected Result                                              |
| -------- | -------------------------- | ---- | ------------------------------------ | ------------------------------------------------------------ |
| DASH-030 | Cover letter card header   | Unit | 1. Render cover letter card          | Shows: name, template badge, last updated, completion status |
| DASH-031 | Completion status display  | Unit | 1. Render with 2/4 sections filled   | Shows "2/4 sections"                                         |
| DASH-032 | Completion status complete | Unit | 1. Render with all sections filled   | Shows "Complete"                                             |
| DASH-033 | Cover letter company info  | Unit | 1. Render with company set           | Company name displayed                                       |
| DASH-034 | Edit cover letter          | E2E  | 1. Click "Edit" on cover letter card | Navigates to `/edit-cover-letter?id={id}`                    |
| DASH-035 | Preview cover letter       | E2E  | 1. Click "Preview"                   | Preview opens                                                |
| DASH-036 | Download cover letter PDF  | E2E  | 1. Click "PDF"                       | PDF downloads                                                |
| DASH-037 | Delete cover letter        | E2E  | 1. Click "Delete" 2. Confirm         | Cover letter deleted                                         |

### 4.7 Dialogs (P1)

| Test ID  | Test Case                   | Type | Steps                                | Expected Result                                                          |
| -------- | --------------------------- | ---- | ------------------------------------ | ------------------------------------------------------------------------ |
| DASH-038 | Preview dialog renders      | Unit | 1. Open preview dialog               | Full-screen preview, template at 60% scale, name + template + date shown |
| DASH-039 | Preview dialog close        | E2E  | 1. Open preview 2. Click close       | Dialog closes                                                            |
| DASH-040 | Delete dialog loading state | Unit | 1. Click delete 2. Confirm           | Loading state during deletion                                            |
| DASH-041 | Plan limit dialog           | Unit | 1. Trigger resume limit (3 for free) | Shows current limit, "Manage" and "Upgrade plan" options                 |
| DASH-042 | Plan limit upgrade link     | E2E  | 1. Hit limit 2. Click "Upgrade plan" | Navigates to `/pricing#pro`                                              |

### 4.8 Optimize Dialog (P1)

| Test ID  | Test Case             | Type | Steps                           | Expected Result                                        |
| -------- | --------------------- | ---- | ------------------------------- | ------------------------------------------------------ |
| DASH-043 | Optimize form view    | E2E  | 1. Open optimize dialog         | Form: job description, title, company, resume selector |
| DASH-044 | Optimize results view | E2E  | 1. Fill form 2. Click Analyze   | ATS score, missing keywords, suggestions shown         |
| DASH-045 | Optimize wizard view  | E2E  | 1. View results 2. Enter wizard | Step-by-step improvement guide                         |

---

## 5. Resume Editor (`/editor/new` or `/editor/{id}`)

### 5.1 Editor Layout (P0)

| Test ID  | Test Case              | Type | Steps                  | Expected Result                                |
| -------- | ---------------------- | ---- | ---------------------- | ---------------------------------------------- |
| EDIT-001 | Desktop layout renders | Unit | 1. Render at >= 1024px | Three-panel layout: sidebar + form + preview   |
| EDIT-002 | Mobile layout renders  | Unit | 1. Render at < 1024px  | Single-column with toggle between form/preview |
| EDIT-003 | Mobile bottom bar      | Unit | 1. Render at < 1024px  | Bottom bar with Back, Status, Preview, Next    |

### 5.2 Editor Header (P0)

| Test ID  | Test Case                        | Type | Steps                                        | Expected Result                                   |
| -------- | -------------------------------- | ---- | -------------------------------------------- | ------------------------------------------------- |
| EDIT-004 | Back button                      | E2E  | 1. Click back arrow                          | Returns to dashboard (with unsaved changes check) |
| EDIT-005 | Resume name display              | Unit | 1. Render header                             | Resume name shown                                 |
| EDIT-006 | Progress bar                     | Unit | 1. Complete 3 of 8 sections                  | Shows "3 of 8 sections completed"                 |
| EDIT-007 | Show/Hide Preview toggle         | E2E  | 1. Click preview toggle                      | Preview panel shows/hides                         |
| EDIT-008 | JD Context badge                 | Unit | 1. Set job description context               | Badge shows job description match info            |
| EDIT-009 | Readiness badge: needs attention | Unit | 1. Incomplete required sections              | Badge shows "Needs attention"                     |
| EDIT-010 | Readiness badge: ready           | Unit | 1. All required sections complete            | Badge shows "Ready"                               |
| EDIT-011 | Save & Exit                      | E2E  | 1. Click "Save & Exit"                       | Saved, redirected to dashboard                    |
| EDIT-012 | More menu: Export PDF            | E2E  | 1. Open more menu 2. Click "Export PDF"      | PDF downloads                                     |
| EDIT-013 | More menu: Export JSON           | E2E  | 1. Open more menu 2. Click "Export JSON"     | JSON downloads                                    |
| EDIT-014 | More menu: Import                | E2E  | 1. Open more menu 2. Click "Import"          | Import dialog opens                               |
| EDIT-015 | More menu: Change Template       | E2E  | 1. Open more menu 2. Click "Change Template" | Template selector opens                           |
| EDIT-016 | More menu: Reset                 | E2E  | 1. Open more menu 2. Click "Reset"           | Confirmation then reset                           |
| EDIT-017 | More menu: Logout                | E2E  | 1. Open more menu 2. Click "Logout"          | Logged out                                        |

### 5.3 Section Navigation (P0)

| Test ID  | Test Case                     | Type | Steps                             | Expected Result                                                                                    |
| -------- | ----------------------------- | ---- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| EDIT-018 | All 8 sections listed         | Unit | 1. Render section nav             | Personal Info, Work Experience, Education, Skills, Projects, Certifications, Languages, Additional |
| EDIT-019 | Section icons correct         | Unit | 1. Render section nav             | Correct icon per section (User, Briefcase, GraduationCap, etc.)                                    |
| EDIT-020 | Click section jumps           | E2E  | 1. Click "Skills" in nav          | Skills section form shown                                                                          |
| EDIT-021 | Completion checkmarks         | Unit | 1. Complete Personal Info section | Checkmark shown next to Personal Info                                                              |
| EDIT-022 | Active section highlighted    | Unit | 1. Navigate to Education          | Education section highlighted in nav                                                               |
| EDIT-023 | Collapsible sidebar (desktop) | E2E  | 1. Click collapse button          | Sidebar collapses, more space for form                                                             |
| EDIT-024 | Progress percentage           | Unit | 1. Complete 4/8 sections          | Shows 50% at bottom                                                                                |

### 5.4 Personal Information Section (P0)

| Test ID  | Test Case                       | Type | Steps                                          | Expected Result                             |
| -------- | ------------------------------- | ---- | ---------------------------------------------- | ------------------------------------------- |
| EDIT-025 | First name required             | Unit | 1. Leave first name empty 2. Try next          | Validation error                            |
| EDIT-026 | Last name required              | Unit | 1. Leave last name empty                       | Validation error                            |
| EDIT-027 | Email required + validated      | Unit | 1. Enter invalid email                         | "Please enter a valid email address"        |
| EDIT-028 | Phone required                  | Unit | 1. Leave phone empty                           | Validation error                            |
| EDIT-029 | Location required               | Unit | 1. Leave location empty                        | Validation error                            |
| EDIT-030 | Job title optional              | Unit | 1. Leave job title empty 2. Try next           | No validation error                         |
| EDIT-031 | Optional links collapsible      | E2E  | 1. Click "+ Website"                           | Website field appears                       |
| EDIT-032 | LinkedIn field                  | E2E  | 1. Expand optional links 2. Enter LinkedIn URL | URL saved, shown in preview                 |
| EDIT-033 | GitHub field                    | E2E  | 1. Expand optional links 2. Enter GitHub URL   | URL saved, shown in preview                 |
| EDIT-034 | Professional summary AI         | E2E  | 1. Fill name 2. Click "Generate Summary"       | AI generates summary                        |
| EDIT-035 | Photo upload                    | E2E  | 1. Click photo upload 2. Select image          | Photo shown in preview (template-dependent) |
| EDIT-036 | Photo upload template-dependent | Unit | 1. Use template without photo support          | Photo upload not shown or disabled          |
| EDIT-037 | Preview updates live            | E2E  | 1. Type first name                             | Preview updates in real-time                |

### 5.5 Work Experience Section (P0)

| Test ID  | Test Case                 | Type | Steps                                     | Expected Result                                     |
| -------- | ------------------------- | ---- | ----------------------------------------- | --------------------------------------------------- |
| EDIT-038 | Add position              | E2E  | 1. Click "Add Position"                   | New entry form appears                              |
| EDIT-039 | Position title required   | Unit | 1. Leave position title empty             | Validation error                                    |
| EDIT-040 | Company name required     | Unit | 1. Leave company name empty               | Validation error                                    |
| EDIT-041 | Location optional         | Unit | 1. Leave location empty                   | No validation error                                 |
| EDIT-042 | Start date required       | Unit | 1. Leave start date empty                 | Validation error                                    |
| EDIT-043 | End date optional         | Unit | 1. Leave end date empty                   | No validation error                                 |
| EDIT-044 | Current position checkbox | E2E  | 1. Check "I currently work here"          | End date disabled, shows "Present"                  |
| EDIT-045 | Add bullet points         | E2E  | 1. Enter bullet text                      | Bullet shown in preview                             |
| EDIT-046 | Multiple positions        | E2E  | 1. Add 3 positions with details           | All shown in preview in correct order               |
| EDIT-047 | Drag-and-drop reorder     | E2E  | 1. Drag position 3 to position 1          | Order updated in form and preview                   |
| EDIT-048 | Expand/collapse cards     | E2E  | 1. Click expand/collapse toggle           | Card expands/collapses                              |
| EDIT-049 | Delete position           | E2E  | 1. Click delete icon 2. Confirm           | Position removed from form and preview              |
| EDIT-050 | AI: Improve bullet        | E2E  | 1. Enter bullet 2. Click "Improve"        | AI suggestion with stronger action verbs (1 credit) |
| EDIT-051 | AI: Quantify achievement  | E2E  | 1. Enter bullet 2. Click "Quantify"       | AI adds metrics and numbers (1 credit)              |
| EDIT-052 | AI: Generate bullets      | E2E  | 1. Fill position info 2. Click "Generate" | 4 bullets generated (2 credits)                     |
| EDIT-053 | Ghost suggestions         | E2E  | 1. Start typing bullet                    | AI autocomplete suggestion appears                  |

### 5.6 Education Section (P0)

| Test ID  | Test Case                    | Type | Steps                          | Expected Result              |
| -------- | ---------------------------- | ---- | ------------------------------ | ---------------------------- |
| EDIT-054 | Add education                | E2E  | 1. Click "Add Education"       | New entry form appears       |
| EDIT-055 | Institution required         | Unit | 1. Leave institution empty     | Validation error             |
| EDIT-056 | Degree required              | Unit | 1. Leave degree empty          | Validation error             |
| EDIT-057 | Field of study required      | Unit | 1. Leave field of study empty  | Validation error             |
| EDIT-058 | Start date required          | Unit | 1. Leave start date empty      | Validation error             |
| EDIT-059 | Currently attending checkbox | E2E  | 1. Check "Currently Attending" | End date disabled            |
| EDIT-060 | GPA optional                 | Unit | 1. Leave GPA empty             | No validation error          |
| EDIT-061 | Achievements bullet points   | E2E  | 1. Add achievement             | Achievement shown in preview |
| EDIT-062 | Multiple education entries   | E2E  | 1. Add 2 education entries     | Both shown in preview        |
| EDIT-063 | Drag-and-drop reorder        | E2E  | 1. Reorder entries             | Order updated                |

### 5.7 Skills Section (P0)

| Test ID  | Test Case                  | Type | Steps                                    | Expected Result                                        |
| -------- | -------------------------- | ---- | ---------------------------------------- | ------------------------------------------------------ |
| EDIT-064 | Add skill                  | E2E  | 1. Enter skill name 2. Click "Add Skill" | Skill added to list                                    |
| EDIT-065 | Skill name required        | Unit | 1. Try to add empty skill                | Cannot add                                             |
| EDIT-066 | Set skill category         | E2E  | 1. Add skill 2. Select "Technical"       | Skill grouped by category                              |
| EDIT-067 | Category options           | Unit | 1. Open category dropdown                | Shows: Technical, Soft Skills, Languages, Tools, Other |
| EDIT-068 | Set proficiency            | E2E  | 1. Add skill 2. Select "Advanced"        | Proficiency shown                                      |
| EDIT-069 | Proficiency options        | Unit | 1. Open proficiency dropdown             | Shows: Beginner, Intermediate, Advanced, Expert        |
| EDIT-070 | Remove skill               | E2E  | 1. Click X on skill                      | Skill removed                                          |
| EDIT-071 | AI: Suggest skills         | E2E  | 1. Click "Suggest Skills"                | AI suggests skills based on job title (1 credit)       |
| EDIT-072 | AI: Auto-fetch suggestions | Unit | 1. Job title exists                      | Suggestions auto-fetched                               |
| EDIT-073 | AI: Undo suggestions       | E2E  | 1. Accept AI suggestions 2. Click "Undo" | AI suggestions removed                                 |

### 5.8 Projects Section (P1)

| Test ID  | Test Case                    | Type | Steps                              | Expected Result                   |
| -------- | ---------------------------- | ---- | ---------------------------------- | --------------------------------- |
| EDIT-074 | Add project                  | E2E  | 1. Click "Add Project"             | New project form appears          |
| EDIT-075 | Project name required        | Unit | 1. Leave project name empty        | Validation error                  |
| EDIT-076 | Description optional         | Unit | 1. Leave description empty         | No validation error               |
| EDIT-077 | Technologies comma-separated | E2E  | 1. Enter "React, TypeScript, Node" | Technologies parsed and displayed |
| EDIT-078 | Live URL optional            | E2E  | 1. Enter live URL                  | URL shown in preview              |
| EDIT-079 | GitHub URL optional          | E2E  | 1. Enter GitHub URL                | URL shown in preview              |
| EDIT-080 | Date range optional          | E2E  | 1. Set start and end date          | Dates shown in preview            |

### 5.9 Certifications Section (P1)

| Test ID  | Test Case                   | Type | Steps                                                        | Expected Result          |
| -------- | --------------------------- | ---- | ------------------------------------------------------------ | ------------------------ |
| EDIT-081 | Certifications tab          | E2E  | 1. Navigate to Certifications 2. Select "Certifications" tab | Certification form shown |
| EDIT-082 | Add certification           | E2E  | 1. Click "Add Certification"                                 | New form appears         |
| EDIT-083 | Certification name required | Unit | 1. Leave name empty                                          | Validation error         |
| EDIT-084 | Issuer optional             | Unit | 1. Leave issuer empty                                        | No validation error      |
| EDIT-085 | Credential ID optional      | E2E  | 1. Enter credential ID                                       | Shown in preview         |
| EDIT-086 | Verification URL optional   | E2E  | 1. Enter URL                                                 | Shown in preview         |
| EDIT-087 | Courses tab                 | E2E  | 1. Select "Courses" tab                                      | Course form shown        |
| EDIT-088 | Add course                  | E2E  | 1. Click "Add Course"                                        | New form appears         |
| EDIT-089 | Course name required        | Unit | 1. Leave course name empty                                   | Validation error         |
| EDIT-090 | Platform optional           | Unit | 1. Leave platform empty                                      | No validation error      |

### 5.10 Languages Section (P1)

| Test ID  | Test Case              | Type | Steps                      | Expected Result                              |
| -------- | ---------------------- | ---- | -------------------------- | -------------------------------------------- |
| EDIT-091 | Add language           | E2E  | 1. Click "Add Language"    | New form appears                             |
| EDIT-092 | Language name required | Unit | 1. Leave name empty        | Validation error                             |
| EDIT-093 | Proficiency required   | Unit | 1. Leave proficiency empty | Validation error                             |
| EDIT-094 | Proficiency options    | Unit | 1. Open dropdown           | Shows: Native, Fluent, Conversational, Basic |

### 5.11 Additional Sections (P1)

| Test ID  | Test Case                       | Type | Steps                                   | Expected Result                                                  |
| -------- | ------------------------------- | ---- | --------------------------------------- | ---------------------------------------------------------------- |
| EDIT-095 | Extra-curricular tab            | E2E  | 1. Navigate to Additional 2. Select tab | Form shown                                                       |
| EDIT-096 | Add extra-curricular            | E2E  | 1. Click "Add Activity"                 | Form appears with: Title, Organization, Role, dates, description |
| EDIT-097 | Extra-curricular title required | Unit | 1. Leave title empty                    | Validation error                                                 |
| EDIT-098 | Extra-curricular org required   | Unit | 1. Leave organization empty             | Validation error                                                 |
| EDIT-099 | Hobbies tab                     | E2E  | 1. Select "Hobbies" tab                 | Hobbies form shown                                               |
| EDIT-100 | Add hobby                       | E2E  | 1. Click "Add Hobby"                    | Form: Name (required), Description (optional)                    |
| EDIT-101 | Custom sections tab             | E2E  | 1. Select "Custom Sections" tab         | Custom section form shown                                        |
| EDIT-102 | Add custom section              | E2E  | 1. Click "Add"                          | Form: Section Title, Item Title, Date, Location, Description     |
| EDIT-103 | Custom section title required   | Unit | 1. Leave section title empty            | Validation error                                                 |
| EDIT-104 | Custom item title required      | Unit | 1. Leave item title empty               | Validation error                                                 |

### 5.12 Preview Panel (P0)

| Test ID  | Test Case                  | Type | Steps                                            | Expected Result                      |
| -------- | -------------------------- | ---- | ------------------------------------------------ | ------------------------------------ |
| EDIT-105 | Live preview renders       | Unit | 1. Enter data in form                            | Preview shows data at ~40% zoom      |
| EDIT-106 | Preview scrollable         | E2E  | 1. Add lots of content                           | Preview scrolls within panel         |
| EDIT-107 | Template selector dropdown | E2E  | 1. Open template selector 2. Choose new template | Preview re-renders with new template |
| EDIT-108 | Customize button           | E2E  | 1. Click "Customize"                             | Template customizer panel opens      |
| EDIT-109 | Complete badge             | Unit | 1. Fill all required fields                      | "Complete" badge shown               |

### 5.13 Template Customizer (P1)

| Test ID  | Test Case              | Type | Steps                                | Expected Result                                       |
| -------- | ---------------------- | ---- | ------------------------------------ | ----------------------------------------------------- |
| EDIT-110 | Color preset: Ocean    | E2E  | 1. Click Ocean preset                | Blue color applied to preview                         |
| EDIT-111 | Color preset: Emerald  | E2E  | 1. Click Emerald preset              | Green color applied                                   |
| EDIT-112 | Color preset: Sunset   | E2E  | 1. Click Sunset preset               | Orange color applied                                  |
| EDIT-113 | Color preset: Plum     | E2E  | 1. Click Plum preset                 | Purple color applied                                  |
| EDIT-114 | Color preset: Charcoal | E2E  | 1. Click Charcoal preset             | Gray color applied                                    |
| EDIT-115 | Color preset: Sand     | E2E  | 1. Click Sand preset                 | Tan color applied                                     |
| EDIT-116 | Custom primary color   | E2E  | 1. Use primary color picker          | Custom color applied                                  |
| EDIT-117 | Custom secondary color | E2E  | 1. Use secondary color picker        | Custom secondary color applied                        |
| EDIT-118 | Font family change     | E2E  | 1. Select "Serif" font               | Preview updates to serif font                         |
| EDIT-119 | Font family options    | Unit | 1. Open font dropdown                | Shows: Sans, Serif, Mono, Georgia, Garamond, Palatino |
| EDIT-120 | Font size slider       | E2E  | 1. Adjust font size slider (10-18px) | Preview font size updates                             |
| EDIT-121 | Line spacing slider    | E2E  | 1. Adjust line spacing (1-2x)        | Preview line spacing updates                          |
| EDIT-122 | Section spacing slider | E2E  | 1. Adjust section spacing (8-32px)   | Preview section spacing updates                       |

### 5.14 Section Wrapper & Navigation (P0)

| Test ID  | Test Case                            | Type | Steps                                               | Expected Result                      |
| -------- | ------------------------------------ | ---- | --------------------------------------------------- | ------------------------------------ |
| EDIT-123 | First section: only Next button      | Unit | 1. Render first section                             | Only "Next" button shown             |
| EDIT-124 | Middle section: Back and Next        | Unit | 1. Render middle section                            | Both "Back" and "Next" buttons       |
| EDIT-125 | Last section: Back and Finish & Save | Unit | 1. Render last section                              | "Back" and "Finish & Save" buttons   |
| EDIT-126 | Validation banner on errors          | E2E  | 1. Leave required fields empty 2. Click "Next"      | Error count and messages shown       |
| EDIT-127 | Fix Now scrolls to error             | E2E  | 1. See validation banner 2. Click "Fix Now"         | Scrolls to first error field         |
| EDIT-128 | Continue Anyway proceeds             | E2E  | 1. See validation banner 2. Click "Continue Anyway" | Moves to next section despite errors |
| EDIT-129 | Progress dots (desktop)              | Unit | 1. Render section on desktop                        | Progress dots visible                |

### 5.15 Auto-Save (P0)

| Test ID  | Test Case                        | Type | Steps                        | Expected Result                    |
| -------- | -------------------------------- | ---- | ---------------------------- | ---------------------------------- |
| EDIT-130 | Session storage immediate save   | Unit | 1. Make change               | sessionStorage updated immediately |
| EDIT-131 | Firestore debounced save (600ms) | Unit | 1. Make change 2. Wait 600ms | Firestore save triggered           |
| EDIT-132 | Save status: saving              | Unit | 1. Trigger save              | Shows "Saving to cloud..."         |
| EDIT-133 | Save status: just saved          | Unit | 1. Save completes            | Shows "Saved just now"             |
| EDIT-134 | Save status: time ago            | Unit | 1. Save 30 seconds ago       | Shows "Saved 30s ago"              |
| EDIT-135 | Save status: minutes             | Unit | 1. Save 2 minutes ago        | Shows "Saved 2m ago"               |
| EDIT-136 | Unauthenticated: no cloud save   | Unit | 1. Make changes as guest     | No Firestore save attempted        |

### 5.16 Recovery System (P0)

| Test ID  | Test Case                       | Type | Steps                                           | Expected Result               |
| -------- | ------------------------------- | ---- | ----------------------------------------------- | ----------------------------- |
| EDIT-137 | Recovery prompt on unsaved data | E2E  | 1. Make changes 2. Hard refresh page            | RecoveryPrompt dialog appears |
| EDIT-138 | Recovery shows timestamp        | Unit | 1. Render recovery prompt                       | Last modified timestamp shown |
| EDIT-139 | Recover Draft                   | E2E  | 1. See recovery prompt 2. Click "Recover Draft" | Unsaved data loaded           |
| EDIT-140 | Discard draft                   | E2E  | 1. See recovery prompt 2. Click "Discard"       | Fresh/saved data used         |
| EDIT-141 | Navigate away warning           | E2E  | 1. Make unsaved changes 2. Click browser back   | Warning dialog shown          |

---

## 6. Template System

### 6.1 Template Gallery (`/templates`) (P0)

| Test ID  | Test Case                          | Type | Steps                  | Expected Result               |
| -------- | ---------------------------------- | ---- | ---------------------- | ----------------------------- |
| TMPL-001 | Gallery renders all 22 templates   | E2E  | 1. Go to `/templates`  | All 22 templates displayed    |
| TMPL-002 | Desktop layout: sidebar + grid     | Unit | 1. Render at >= 1024px | Sidebar filters + grid layout |
| TMPL-003 | Mobile layout: bottom sheet + grid | Unit | 1. Render at < 768px   | Bottom sheet filters + grid   |

### 6.2 Filters (P1)

| Test ID  | Test Case                       | Type | Steps                           | Expected Result                    |
| -------- | ------------------------------- | ---- | ------------------------------- | ---------------------------------- |
| TMPL-004 | Filter by layout: Single-column | E2E  | 1. Select "Single-column"       | Only single-column templates shown |
| TMPL-005 | Filter by layout: Two-column    | E2E  | 1. Select "Two-column"          | Only two-column templates shown    |
| TMPL-006 | Filter by layout: Sidebar       | E2E  | 1. Select "Sidebar"             | Only sidebar layout templates      |
| TMPL-007 | Filter by style: Modern         | E2E  | 1. Select "Modern"              | Modern style templates shown       |
| TMPL-008 | Filter by style: Classic        | E2E  | 1. Select "Classic"             | Classic style templates shown      |
| TMPL-009 | Filter by style: Creative       | E2E  | 1. Select "Creative"            | Creative style templates shown     |
| TMPL-010 | Filter by style: ATS-Optimized  | E2E  | 1. Select "ATS-Optimized"       | ATS-optimized templates shown      |
| TMPL-011 | Filter by photo: With photo     | E2E  | 1. Select "With photo"          | Only photo-supporting templates    |
| TMPL-012 | Filter by photo: Without photo  | E2E  | 1. Select "Without photo"       | Only non-photo templates           |
| TMPL-013 | Multi-select style filter       | E2E  | 1. Select "Modern" + "Creative" | Both styles shown                  |
| TMPL-014 | Filter by industry              | E2E  | 1. Select an industry           | Relevant templates shown           |
| TMPL-015 | Clear filters                   | E2E  | 1. Set filters 2. Clear all     | All 22 templates shown again       |

### 6.3 Template Card (P1)

| Test ID  | Test Case               | Type | Steps                            | Expected Result                                                    |
| -------- | ----------------------- | ---- | -------------------------------- | ------------------------------------------------------------------ |
| TMPL-016 | Preview thumbnail       | Unit | 1. Render template card          | A4 aspect ratio thumbnail shown                                    |
| TMPL-017 | Template name           | Unit | 1. Render template card          | Template name displayed                                            |
| TMPL-018 | Hover overlay           | E2E  | 1. Hover over template card      | Shows: description, color swatches, feature badges, "Use Template" |
| TMPL-019 | Color selector on hover | E2E  | 1. Hover 2. Click color swatch   | Preview updates with new color                                     |
| TMPL-020 | Use Template button     | E2E  | 1. Hover 2. Click "Use Template" | Navigates to editor with template                                  |

### 6.4 Template Rendering (P1)

| Test ID  | Test Case                    | Type | Steps                           | Expected Result                |
| -------- | ---------------------------- | ---- | ------------------------------- | ------------------------------ |
| TMPL-021 | Clarity template renders     | Unit | 1. Render with Clarity template | Correct layout, single-column  |
| TMPL-022 | Cubic template renders       | Unit | 1. Render with Cubic template   | Correct layout                 |
| TMPL-023 | Ivy League template renders  | Unit | 1. Render with Ivy League       | Correct layout                 |
| TMPL-024 | Simple template renders      | Unit | 1. Render with Simple           | Correct layout                 |
| TMPL-025 | Diamond template renders     | Unit | 1. Render with Diamond          | Correct layout                 |
| TMPL-026 | Minimalist template renders  | Unit | 1. Render with Minimalist       | Correct layout                 |
| TMPL-027 | Classic template renders     | Unit | 1. Render with Classic          | Correct layout, photo support  |
| TMPL-028 | Dublin template renders      | Unit | 1. Render with Dublin           | Two-column, photo support      |
| TMPL-029 | Adaptive template renders    | Unit | 1. Render with Adaptive         | Two-column, photo support      |
| TMPL-030 | Cascade template renders     | Unit | 1. Render with Cascade          | Two-column layout              |
| TMPL-031 | Iconic template renders      | Unit | 1. Render with Iconic           | Two-column, photo support      |
| TMPL-032 | Modern template renders      | Unit | 1. Render with Modern           | Two-column, photo support      |
| TMPL-033 | Executive template renders   | Unit | 1. Render with Executive        | Two-column, photo support      |
| TMPL-034 | Infographic template renders | Unit | 1. Render with Infographic      | Two-column, photo support      |
| TMPL-035 | Technical template renders   | Unit | 1. Render with Technical        | Two-column, IDE themes         |
| TMPL-036 | Timeline template renders    | Unit | 1. Render with Timeline         | Single-column, timeline layout |
| TMPL-037 | Creative template renders    | Unit | 1. Render with Creative         | Two-column, photo support      |

### 6.5 Color Palettes (P2)

| Test ID  | Test Case                  | Type | Steps                                          | Expected Result          |
| -------- | -------------------------- | ---- | ---------------------------------------------- | ------------------------ |
| TMPL-038 | Ocean palette (#0ea5e9)    | Unit | 1. Apply Ocean palette                         | Correct blue applied     |
| TMPL-039 | Forest palette (#059669)   | Unit | 1. Apply Forest palette                        | Correct green applied    |
| TMPL-040 | Sunset palette (#f97316)   | Unit | 1. Apply Sunset palette                        | Correct orange applied   |
| TMPL-041 | Plum palette (#7c3aed)     | Unit | 1. Apply Plum palette                          | Correct purple applied   |
| TMPL-042 | Charcoal palette (#334155) | Unit | 1. Apply Charcoal palette                      | Correct gray applied     |
| TMPL-043 | Rose palette (#e11d48)     | Unit | 1. Apply Rose                                  | Correct rose applied     |
| TMPL-044 | Amber palette (#d97706)    | Unit | 1. Apply Amber                                 | Correct amber applied    |
| TMPL-045 | Navy palette (#1e40af)     | Unit | 1. Apply Navy                                  | Correct navy applied     |
| TMPL-046 | Sage palette (#4d7c0f)     | Unit | 1. Apply Sage                                  | Correct sage applied     |
| TMPL-047 | Slate palette (#475569)    | Unit | 1. Apply Slate                                 | Correct slate applied    |
| TMPL-048 | Technical: IDE themes      | Unit | 1. Apply "VS Code Dark+" to Technical template | IDE theme colors applied |

### 6.6 PDF Template Parity (P0)

| Test ID  | Test Case                       | Type   | Steps                                                         | Expected Result          |
| -------- | ------------------------------- | ------ | ------------------------------------------------------------- | ------------------------ |
| TMPL-049 | PDF matches preview: Modern     | Manual | 1. Create resume with Modern 2. Compare preview vs PDF export | Layout and content match |
| TMPL-050 | PDF matches preview: Classic    | Manual | 1. Same with Classic                                          | Match                    |
| TMPL-051 | PDF matches preview: Executive  | Manual | 1. Same with Executive                                        | Match                    |
| TMPL-052 | PDF matches preview: Technical  | Manual | 1. Same with Technical                                        | Match                    |
| TMPL-053 | PDF matches preview: Timeline   | Manual | 1. Same with Timeline                                         | Match                    |
| TMPL-054 | PDF matches preview: Creative   | Manual | 1. Same with Creative                                         | Match                    |
| TMPL-055 | PDF applies color customization | Manual | 1. Customize color 2. Export PDF                              | PDF uses custom colors   |
| TMPL-056 | PDF applies font customization  | Manual | 1. Customize font 2. Export PDF                               | PDF uses custom font     |

---

## 7. AI Features

### 7.1 AI Control Bar (P1)

| Test ID | Test Case                     | Type | Steps                     | Expected Result                                        |
| ------- | ----------------------------- | ---- | ------------------------- | ------------------------------------------------------ |
| AI-001  | Control bar renders in editor | Unit | 1. Render resume editor   | AI control bar with 5 buttons visible                  |
| AI-002  | Enhance All button            | E2E  | 1. Click "Enhance All"    | Batch enhancement of summary + all bullets (5 credits) |
| AI-003  | AI Optimize button            | E2E  | 1. Click "AI Optimize"    | ATS analysis dialog opens                              |
| AI-004  | Tailor button                 | E2E  | 1. Click "Tailor"         | Tailor resume dialog opens                             |
| AI-005  | Interview Prep button         | E2E  | 1. Click "Interview Prep" | Interview prep flow starts                             |
| AI-006  | Cover Letter button           | E2E  | 1. Click "Cover Letter"   | Quick cover letter generation                          |

### 7.2 Content Generation (P0)

| Test ID | Test Case            | Type | Steps                                             | Expected Result                                 |
| ------- | -------------------- | ---- | ------------------------------------------------- | ----------------------------------------------- |
| AI-007  | Improve bullet       | E2E  | 1. Enter bullet 2. Click "Improve"                | Rewritten with stronger action verbs (1 credit) |
| AI-008  | Quantify achievement | E2E  | 1. Enter bullet 2. Click "Quantify"               | Metrics and numbers added (1 credit)            |
| AI-009  | Suggest skills       | E2E  | 1. Click "Suggest Skills"                         | Relevant skills suggested (1 credit)            |
| AI-010  | Generate bullets     | E2E  | 1. Fill position info 2. Click "Generate"         | 4 bullets created (2 credits)                   |
| AI-011  | Generate summary     | E2E  | 1. Fill personal info 2. Click "Generate Summary" | Professional summary generated (2 credits)      |

### 7.3 ATS Analysis Flow (P1)

| Test ID | Test Case                         | Type | Steps                                                   | Expected Result                              |
| ------- | --------------------------------- | ---- | ------------------------------------------------------- | -------------------------------------------- |
| AI-012  | ATS: open dialog                  | E2E  | 1. Click "AI Optimize"                                  | Dialog opens                                 |
| AI-013  | ATS: min 50 chars job description | Unit | 1. Enter < 50 chars                                     | Cannot analyze, validation error             |
| AI-014  | ATS: valid analysis               | E2E  | 1. Paste 200+ char JD 2. Enter title 3. Click "Analyze" | Analysis results shown (3 credits)           |
| AI-015  | ATS: score display                | Unit | 1. Render ATS results                                   | Score 0-100 displayed                        |
| AI-016  | ATS: missing keywords             | Unit | 1. Render ATS results                                   | Missing keywords list shown                  |
| AI-017  | ATS: suggestions with severity    | Unit | 1. Render ATS results                                   | Suggestions with severity levels and actions |
| AI-018  | ATS: strengths highlighted        | Unit | 1. Render ATS results                                   | Strengths section shown                      |
| AI-019  | ATS: improvements recommended     | Unit | 1. Render ATS results                                   | Improvements section shown                   |
| AI-020  | ATS: learnable skills             | Unit | 1. Render ATS results                                   | Skills with learning resources shown         |

### 7.4 Tailor Resume Flow (P1)

| Test ID | Test Case                     | Type | Steps                                           | Expected Result                                                |
| ------- | ----------------------------- | ---- | ----------------------------------------------- | -------------------------------------------------------------- |
| AI-021  | Tailor: enter job description | E2E  | 1. Click "Tailor" 2. Enter JD                   | Can proceed                                                    |
| AI-022  | Tailor: progress stages       | E2E  | 1. Submit tailor request                        | Shows: Analyzing → Matching → Optimizing → Finalizing          |
| AI-023  | Tailor: results display       | Unit | 1. Render tailor results                        | Tailored summary, enhanced bullets, added keywords, change log |
| AI-024  | Tailor: create copy           | E2E  | 1. View results 2. Click "Create tailored copy" | New resume created (5 credits)                                 |
| AI-025  | Tailor: apply to current      | E2E  | 1. View results 2. Click "Apply changes"        | Current resume updated                                         |
| AI-026  | Tailor: download tailored     | E2E  | 1. View results 2. Click "Download"             | Tailored PDF downloads                                         |

### 7.5 Interview Prep Flow (P1)

| Test ID | Test Case                           | Type | Steps                                          | Expected Result                                      |
| ------- | ----------------------------------- | ---- | ---------------------------------------------- | ---------------------------------------------------- |
| AI-027  | Interview Prep: select resume       | E2E  | 1. Navigate to interview prep 2. Select resume | Resume selected                                      |
| AI-028  | Interview Prep: enter JD            | E2E  | 1. Enter job description                       | JD accepted                                          |
| AI-029  | Interview Prep: generate questions  | E2E  | 1. Submit resume + JD                          | 15-20 questions generated (5 credits)                |
| AI-030  | Interview Prep: question types      | Unit | 1. Render questions                            | Behavioral, technical, situational questions present |
| AI-031  | Interview Prep: sample answers      | Unit | 1. Render questions                            | Each question has sample answer with key points      |
| AI-032  | Interview Prep: follow-up questions | Unit | 1. Render questions                            | Follow-up questions shown                            |
| AI-033  | Interview Prep: skill gap analysis  | Unit | 1. Render results                              | Skill gap analysis shown                             |
| AI-034  | Interview Prep: readiness score     | Unit | 1. Render results                              | Readiness score 0-100                                |
| AI-035  | Interview Prep: practice mode       | E2E  | 1. Click "Practice mode"                       | Answers hidden                                       |
| AI-036  | Interview Prep: difficulty levels   | E2E  | 1. Toggle difficulty                           | Easy, Medium, Hard filter works                      |
| AI-037  | Interview Prep: free tier limit     | Unit | 1. Render for free user                        | Limited to 5 questions                               |
| AI-038  | Interview Prep: premium full        | Unit | 1. Render for premium user                     | 15-20 questions available                            |

### 7.6 Score Resume (P1)

| Test ID | Test Case                 | Type | Steps                                            | Expected Result                 |
| ------- | ------------------------- | ---- | ------------------------------------------------ | ------------------------------- |
| AI-039  | Score via command palette | E2E  | 1. Open command palette 2. Select "Score Resume" | Resume scored (2 credits)       |
| AI-040  | Score breakdown           | Unit | 1. Render score results                          | Score with breakdown categories |

### 7.7 LinkedIn Optimization (P2)

| Test ID | Test Case                     | Type | Steps                                                     | Expected Result                    |
| ------- | ----------------------------- | ---- | --------------------------------------------------------- | ---------------------------------- |
| AI-041  | LinkedIn optimize via palette | E2E  | 1. Open command palette 2. Select "LinkedIn Optimization" | Optimization generated (5 credits) |

### 7.8 Credit System (P0)

| Test ID | Test Case                      | Type | Steps                                    | Expected Result              |
| ------- | ------------------------------ | ---- | ---------------------------------------- | ---------------------------- |
| AI-042  | Free tier: 30 credits          | Unit | 1. New free user                         | 30 credits available         |
| AI-043  | Credit deduction: 1 credit op  | Unit | 1. Use "Improve bullet"                  | Credits decrease by 1        |
| AI-044  | Credit deduction: 2 credit op  | Unit | 1. Use "Generate bullets"                | Credits decrease by 2        |
| AI-045  | Credit deduction: 3 credit op  | Unit | 1. Use "ATS analysis"                    | Credits decrease by 3        |
| AI-046  | Credit deduction: 5 credit op  | Unit | 1. Use "Cover letter"                    | Credits decrease by 5        |
| AI-047  | Out of credits                 | E2E  | 1. Exhaust all credits 2. Try AI feature | Upgrade prompt shown         |
| AI-048  | Credit display in dashboard    | Unit | 1. Render dashboard header               | Current credit balance shown |
| AI-049  | Credit updates after AI action | E2E  | 1. Use AI feature                        | Display updates immediately  |
| AI-050  | Low credit warning             | Unit | 1. Credits < threshold                   | Warning shown                |
| AI-051  | Premium: unlimited credits     | Unit | 1. Premium user uses AI                  | No credit deduction          |
| AI-052  | Monthly credit reset           | Unit | 1. Mock month change                     | Credits reset to 30          |

### 7.9 AI Caching (P1)

| Test ID | Test Case                       | Type | Steps                                    | Expected Result                                   |
| ------- | ------------------------------- | ---- | ---------------------------------------- | ------------------------------------------------- |
| AI-053  | Cache hit returns cached result | Unit | 1. Make AI request 2. Same request again | Second request returns cached result, no API call |
| AI-054  | Cache miss makes API call       | Unit | 1. Make new AI request                   | API call made                                     |
| AI-055  | Cache expiration                | Unit | 1. Cache entry expires                   | Next request makes fresh API call                 |

---

## 8. Cover Letter Builder

### 8.1 Cover Letter Creation (P1)

| Test ID | Test Case           | Type | Steps                                       | Expected Result                 |
| ------- | ------------------- | ---- | ------------------------------------------- | ------------------------------- |
| CL-001  | Create cover letter | E2E  | 1. Click "New Cover Letter"                 | Editor opens at `/cover-letter` |
| CL-002  | Edit existing       | E2E  | 1. Navigate to `/edit-cover-letter?id={id}` | Cover letter loaded             |

### 8.2 Section 1: Job Details (P1)

| Test ID | Test Case                 | Type | Steps                    | Expected Result  |
| ------- | ------------------------- | ---- | ------------------------ | ---------------- |
| CL-003  | Job title required        | Unit | 1. Leave job title empty | Validation error |
| CL-004  | Job reference optional    | Unit | 1. Leave reference empty | No error         |
| CL-005  | Application date optional | Unit | 1. Leave date empty      | No error         |

### 8.3 Section 2: Recipient Information (P1)

| Test ID | Test Case                    | Type | Steps                              | Expected Result                |
| ------- | ---------------------------- | ---- | ---------------------------------- | ------------------------------ |
| CL-006  | Company name required        | Unit | 1. Leave company empty             | Validation error               |
| CL-007  | Hiring manager name optional | Unit | 1. Leave empty                     | No error                       |
| CL-008  | All optional fields save     | E2E  | 1. Fill title, department, address | All saved and shown in preview |

### 8.4 Section 3: Your Information (P1)

| Test ID | Test Case          | Type | Steps                                      | Expected Result                |
| ------- | ------------------ | ---- | ------------------------------------------ | ------------------------------ |
| CL-009  | Full name required | Unit | 1. Leave name empty                        | Validation error               |
| CL-010  | Email required     | Unit | 1. Leave email empty                       | Validation error               |
| CL-011  | Sync from Resume   | E2E  | 1. Click "Sync from Resume"                | Data pulled from linked resume |
| CL-012  | Optional fields    | E2E  | 1. Fill phone, location, LinkedIn, website | All saved                      |

### 8.5 Section 4: Letter Content (P0)

| Test ID | Test Case                  | Type | Steps                                 | Expected Result                                                                         |
| ------- | -------------------------- | ---- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| CL-013  | Salutation dropdown        | Unit | 1. Open salutation dropdown           | Options: Dear Hiring Manager, Dear Recruiting Team, To Whom It May Concern, Dear [Name] |
| CL-014  | Custom salutation          | E2E  | 1. Select "Dear [Name]" 2. Enter name | Custom salutation shown                                                                 |
| CL-015  | Opening paragraph required | Unit | 1. Leave opening empty                | Validation error                                                                        |
| CL-016  | Body paragraphs (1-4)      | E2E  | 1. Add 1 body paragraph               | Shown in preview                                                                        |
| CL-017  | Multiple body paragraphs   | E2E  | 1. Add 4 body paragraphs              | All shown in preview                                                                    |
| CL-018  | Closing paragraph required | Unit | 1. Leave closing empty                | Validation error                                                                        |
| CL-019  | Sign off dropdown          | Unit | 1. Open sign off dropdown             | Options: Sincerely, Best regards, Kind regards, Respectfully, Thank you                 |

### 8.6 Cover Letter Templates (P1)

| Test ID | Test Case        | Type | Steps             | Expected Result                         |
| ------- | ---------------- | ---- | ----------------- | --------------------------------------- |
| CL-020  | Modern template  | Unit | 1. Select Modern  | Clean, teal accent, contemporary style  |
| CL-021  | Classic template | Unit | 1. Select Classic | Traditional business letter, serif font |

### 8.7 AI Cover Letter Generation (P1)

| Test ID | Test Case                 | Type | Steps                            | Expected Result                                              |
| ------- | ------------------------- | ---- | -------------------------------- | ------------------------------------------------------------ |
| CL-022  | Quick generate dialog     | E2E  | 1. Open generation dialog        | Form: resume selector, company, position, JD, hiring manager |
| CL-023  | Generate cover letter     | E2E  | 1. Fill form 2. Click "Generate" | Cover letter content generated (5 credits)                   |
| CL-024  | Review and edit generated | E2E  | 1. Generate 2. Edit content      | Edits saved                                                  |

---

## 9. Export Features

### 9.1 Resume PDF Export (P0)

| Test ID  | Test Case                       | Type   | Steps                                 | Expected Result                    |
| -------- | ------------------------------- | ------ | ------------------------------------- | ---------------------------------- |
| EXPT-001 | Export PDF                      | E2E    | 1. Click export PDF                   | PDF downloads                      |
| EXPT-002 | PDF filename format             | Unit   | 1. Export PDF                         | Filename: `resume-{timestamp}.pdf` |
| EXPT-003 | PDF uses template customization | Manual | 1. Customize colors + fonts 2. Export | PDF reflects customizations        |
| EXPT-004 | PDF A4 page size                | Manual | 1. Export PDF 2. Check dimensions     | A4 format                          |
| EXPT-005 | PDF multi-page break            | Manual | 1. Create long resume 2. Export       | Clean page breaks                  |
| EXPT-006 | PDF text is selectable          | Manual | 1. Export PDF 2. Try to select text   | Text is selectable (not image)     |

### 9.2 Resume DOCX Export (P1)

| Test ID  | Test Case            | Type   | Steps                     | Expected Result                         |
| -------- | -------------------- | ------ | ------------------------- | --------------------------------------- |
| EXPT-007 | Export DOCX          | E2E    | 1. Click export DOCX      | DOCX downloads                          |
| EXPT-008 | DOCX filename format | Unit   | 1. Export DOCX            | Filename: `resume-{timestamp}.docx`     |
| EXPT-009 | DOCX is editable     | Manual | 1. Export 2. Open in Word | Content editable, formatting maintained |

### 9.3 Resume JSON Export (P1)

| Test ID  | Test Case             | Type | Steps                   | Expected Result                     |
| -------- | --------------------- | ---- | ----------------------- | ----------------------------------- |
| EXPT-010 | Export JSON           | E2E  | 1. Click export JSON    | JSON downloads                      |
| EXPT-011 | JSON filename format  | Unit | 1. Export JSON          | Filename: `resume-{timestamp}.json` |
| EXPT-012 | JSON is valid         | Unit | 1. Export JSON 2. Parse | Valid JSON, pretty-printed          |
| EXPT-013 | JSON schema versioned | Unit | 1. Check exported JSON  | Schema version present              |

### 9.4 Cover Letter Export (P1)

| Test ID  | Test Case                 | Type | Steps                         | Expected Result                                                   |
| -------- | ------------------------- | ---- | ----------------------------- | ----------------------------------------------------------------- |
| EXPT-014 | Cover letter PDF export   | E2E  | 1. Export cover letter as PDF | PDF downloads                                                     |
| EXPT-015 | Cover letter PDF filename | Unit | 1. Export                     | Filename: `cover-letter-{company}-{timestamp}.pdf`                |
| EXPT-016 | Cover letter JSON export  | E2E  | 1. Export as JSON             | JSON with schema `https://resumeforge.app/schema/cover-letter/v1` |

### 9.5 Bulk Export (P2)

| Test ID  | Test Case                       | Type | Steps                                  | Expected Result                            |
| -------- | ------------------------------- | ---- | -------------------------------------- | ------------------------------------------ |
| EXPT-017 | Export all resumes (JSON)       | E2E  | 1. Settings → Export All Resumes       | JSON file with all resumes downloads       |
| EXPT-018 | Export all cover letters (JSON) | E2E  | 1. Settings → Export All Cover Letters | JSON file with all cover letters downloads |
| EXPT-019 | Bulk export includes metadata   | Unit | 1. Check exported file                 | Metadata wrapper present                   |

### 9.6 Export Edge Cases (P0)

| Test ID  | Test Case                       | Type | Steps                              | Expected Result                          |
| -------- | ------------------------------- | ---- | ---------------------------------- | ---------------------------------------- |
| EXPT-020 | Export empty resume blocked     | E2E  | 1. Try to export empty resume      | Warning: "Cannot export an empty resume" |
| EXPT-021 | Export handles missing template | Unit | 1. Export with invalid template ID | Graceful fallback                        |

---

## 10. Import Features

### 10.1 JSON Import (P1)

| Test ID  | Test Case           | Type | Steps                       | Expected Result     |
| -------- | ------------------- | ---- | --------------------------- | ------------------- |
| IMPT-001 | Import valid JSON   | E2E  | 1. Upload valid resume JSON | Resume data loaded  |
| IMPT-002 | Import invalid JSON | E2E  | 1. Upload invalid file      | Error message shown |

---

## 11. Public Sharing

### 11.1 Username Setup (P1)

| Test ID   | Test Case                          | Type | Steps                                   | Expected Result                    |
| --------- | ---------------------------------- | ---- | --------------------------------------- | ---------------------------------- |
| SHARE-001 | First-time username setup          | E2E  | 1. Open Share dialog (no username)      | Username creation form shown       |
| SHARE-002 | Username validation: 3-30 chars    | Unit | 1. Enter "ab" (2 chars)                 | Validation error                   |
| SHARE-003 | Username validation: lowercase     | Unit | 1. Enter "MyName"                       | Validation error or auto-lowercase |
| SHARE-004 | Username validation: allowed chars | Unit | 1. Enter "john-doe-123"                 | Accepted                           |
| SHARE-005 | Username availability check        | E2E  | 1. Enter username 2. Check availability | Available/taken status shown       |
| SHARE-006 | Claim username                     | E2E  | 1. Enter available username 2. Claim    | Username saved                     |

### 11.2 Publishing (P1)

| Test ID   | Test Case         | Type | Steps                                | Expected Result                            |
| --------- | ----------------- | ---- | ------------------------------------ | ------------------------------------------ |
| SHARE-007 | Publish toggle on | E2E  | 1. Open Share 2. Toggle "Publish" on | Resume becomes public                      |
| SHARE-008 | Custom slug       | E2E  | 1. Edit slug                         | URL updates to new slug                    |
| SHARE-009 | Copy link         | E2E  | 1. Click "Copy link"                 | URL copied to clipboard                    |
| SHARE-010 | Public URL format | Unit | 1. Publish resume                    | URL: `resumeforge.app/u/{username}/{slug}` |

### 11.3 Privacy Options (P1)

| Test ID   | Test Case     | Type | Steps                     | Expected Result                   |
| --------- | ------------- | ---- | ------------------------- | --------------------------------- |
| SHARE-011 | Hide email    | E2E  | 1. Toggle "Hide Email"    | Email not shown on public page    |
| SHARE-012 | Hide phone    | E2E  | 1. Toggle "Hide Phone"    | Phone not shown on public page    |
| SHARE-013 | Hide location | E2E  | 1. Toggle "Hide Location" | Location not shown on public page |

### 11.4 Share Options (P2)

| Test ID   | Test Case        | Type | Steps                  | Expected Result                     |
| --------- | ---------------- | ---- | ---------------------- | ----------------------------------- |
| SHARE-014 | Twitter share    | E2E  | 1. Click Twitter icon  | Opens Twitter with pre-filled tweet |
| SHARE-015 | LinkedIn share   | E2E  | 1. Click LinkedIn icon | Opens LinkedIn share dialog         |
| SHARE-016 | Facebook share   | E2E  | 1. Click Facebook icon | Opens Facebook share                |
| SHARE-017 | Email share      | E2E  | 1. Click Email icon    | Opens email client with link        |
| SHARE-018 | QR code display  | E2E  | 1. Click QR code       | QR code displayed                   |
| SHARE-019 | QR code download | E2E  | 1. Click download QR   | QR code image downloads             |

### 11.5 Public Page (P1)

| Test ID   | Test Case                   | Type | Steps                     | Expected Result                         |
| --------- | --------------------------- | ---- | ------------------------- | --------------------------------------- |
| SHARE-020 | Public page renders         | E2E  | 1. Visit public URL       | Resume displayed with selected template |
| SHARE-021 | Share button on public page | E2E  | 1. Click share button     | Native share API opens                  |
| SHARE-022 | Download PDF from public    | E2E  | 1. Click "Download PDF"   | PDF downloads                           |
| SHARE-023 | CTA on public page          | E2E  | 1. Visit public page      | "Build Your Resume Free" CTA shown      |
| SHARE-024 | Unpublish removes access    | E2E  | 1. Unpublish 2. Visit URL | 404 or "not available" page             |

### 11.6 Plan Limits (P1)

| Test ID   | Test Case                | Type | Steps                                         | Expected Result            |
| --------- | ------------------------ | ---- | --------------------------------------------- | -------------------------- |
| SHARE-025 | Free: 1 public link      | E2E  | 1. Publish 1 resume 2. Try to publish another | Limit dialog shown         |
| SHARE-026 | Premium: unlimited links | E2E  | 1. Premium user publishes multiple            | All published successfully |

---

## 12. Settings (`/settings`)

### 12.1 Profile (P1)

| Test ID | Test Case                 | Type | Steps                              | Expected Result                  |
| ------- | ------------------------- | ---- | ---------------------------------- | -------------------------------- |
| SET-001 | Email display (read-only) | Unit | 1. Render settings                 | Email displayed but not editable |
| SET-002 | Display name editable     | E2E  | 1. Edit display name 2. Click Save | Name updated                     |
| SET-003 | Save confirmation         | E2E  | 1. Save changes                    | Success toast/confirmation       |

### 12.2 Appearance (P1)

| Test ID | Test Case         | Type | Steps                        | Expected Result             |
| ------- | ----------------- | ---- | ---------------------------- | --------------------------- |
| SET-004 | Light theme       | E2E  | 1. Select "Light"            | App switches to light theme |
| SET-005 | Dark theme        | E2E  | 1. Select "Dark"             | App switches to dark theme  |
| SET-006 | System theme      | E2E  | 1. Select "System"           | Follows OS preference       |
| SET-007 | Theme persistence | E2E  | 1. Set dark theme 2. Refresh | Dark theme persisted        |

### 12.3 Data Export (P1)

| Test ID | Test Case                | Type | Steps                               | Expected Result                      |
| ------- | ------------------------ | ---- | ----------------------------------- | ------------------------------------ |
| SET-008 | Export all resumes       | E2E  | 1. Click "Export All Resumes"       | JSON download with all resumes       |
| SET-009 | Export all cover letters | E2E  | 1. Click "Export All Cover Letters" | JSON download with all cover letters |
| SET-010 | Document counts shown    | Unit | 1. Render data export section       | Shows resume and cover letter counts |

### 12.4 Danger Zone (P0)

| Test ID | Test Case               | Type | Steps                                                                          | Expected Result                                 |
| ------- | ----------------------- | ---- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| SET-011 | Delete account flow     | E2E  | 1. Click "Delete Account" 2. Confirmation dialog 3. Re-authenticate 4. Confirm | Account + all data deleted, redirected to login |
| SET-012 | Delete requires re-auth | E2E  | 1. Click Delete Account                                                        | Re-authentication dialog shown                  |
| SET-013 | Export before delete    | E2E  | 1. Click "Export Your Data"                                                    | Data backup downloads                           |

### 12.5 Dev Tools (P2)

| Test ID | Test Case            | Type | Steps                    | Expected Result                     |
| ------- | -------------------- | ---- | ------------------------ | ----------------------------------- |
| SET-014 | Dev tools admin only | Unit | 1. Render as non-admin   | Dev tools not visible               |
| SET-015 | Premium toggle       | E2E  | 1. Toggle Premium        | Plan switches between Free/Premium  |
| SET-016 | Reset credits        | E2E  | 1. Click "Reset Credits" | Credits set to 0                    |
| SET-017 | Status display       | Unit | 1. Render dev tools      | Shows current plan and credit usage |

---

## 13. Keyboard Shortcuts

### 13.1 Global Shortcuts (P1)

| Test ID | Test Case                     | Type | Steps                         | Expected Result       |
| ------- | ----------------------------- | ---- | ----------------------------- | --------------------- |
| KB-001  | Cmd/Ctrl + K: Command palette | E2E  | 1. Press Cmd+K                | Command palette opens |
| KB-002  | Cmd/Ctrl + S: Save            | E2E  | 1. Press Cmd+S in editor      | Resume saved          |
| KB-003  | Cmd/Ctrl + Z: Undo            | E2E  | 1. Make change 2. Press Cmd+Z | Change undone         |
| KB-004  | Cmd/Ctrl + Shift + Z: Redo    | E2E  | 1. Undo 2. Press Cmd+Shift+Z  | Change redone         |
| KB-005  | Cmd/Ctrl + Y: Redo (alt)      | E2E  | 1. Undo 2. Press Cmd+Y        | Change redone         |

### 13.2 Editor Shortcuts (P1)

| Test ID | Test Case                   | Type | Steps                             | Expected Result          |
| ------- | --------------------------- | ---- | --------------------------------- | ------------------------ |
| KB-006  | Cmd/Ctrl + P: Export PDF    | E2E  | 1. Press Cmd+P in editor          | PDF export triggers      |
| KB-007  | Cmd/Ctrl + E: Export JSON   | E2E  | 1. Press Cmd+E in editor          | JSON export triggers     |
| KB-008  | Enter: Next section         | E2E  | 1. Press Enter (not in input)     | Advances to next section |
| KB-009  | Backspace: Previous section | E2E  | 1. Press Backspace (not in input) | Goes to previous section |

### 13.3 Command Palette (P1)

| Test ID | Test Case               | Type | Steps                                    | Expected Result                 |
| ------- | ----------------------- | ---- | ---------------------------------------- | ------------------------------- |
| KB-010  | ATS Analysis command    | E2E  | 1. Open palette 2. Select "ATS Analysis" | ATS analysis dialog opens       |
| KB-011  | Enhance All command     | E2E  | 1. Open palette 2. Select "Enhance All"  | Batch enhancement starts        |
| KB-012  | Save command            | E2E  | 1. Open palette 2. Select "Save"         | Resume saved                    |
| KB-013  | Export PDF command      | E2E  | 1. Open palette 2. Select "Export PDF"   | PDF export                      |
| KB-014  | Palette search          | E2E  | 1. Open palette 2. Type "ats"            | Filters to ATS-related commands |
| KB-015  | Palette close on Escape | E2E  | 1. Open palette 2. Press Escape          | Palette closes                  |

---

## 14. Mobile Experience

### 14.1 Mobile Editor (P1)

| Test ID | Test Case           | Type | Steps                              | Expected Result                              |
| ------- | ------------------- | ---- | ---------------------------------- | -------------------------------------------- |
| MOB-001 | Toggle form/preview | E2E  | 1. On mobile 2. Tap preview toggle | Switches between form and preview            |
| MOB-002 | Bottom bar renders  | Unit | 1. Render editor at < 768px        | Bottom bar with: Back, Status, Preview, Next |
| MOB-003 | Bottom bar: Back    | E2E  | 1. Tap Back button                 | Previous section                             |
| MOB-004 | Bottom bar: Status  | E2E  | 1. Tap Status button               | Shows issues or ready state                  |
| MOB-005 | Bottom bar: Preview | E2E  | 1. Tap Preview button              | Toggle preview overlay                       |
| MOB-006 | Bottom bar: Next    | E2E  | 1. Tap Next button                 | Next section / Finish                        |
| MOB-007 | Mobile form filling | E2E  | 1. Fill form fields on mobile      | All inputs work correctly                    |

### 14.2 Mobile Preview Overlay (P1)

| Test ID | Test Case                      | Type | Steps                                   | Expected Result     |
| ------- | ------------------------------ | ---- | --------------------------------------- | ------------------- |
| MOB-008 | Full-screen preview            | E2E  | 1. Open preview on mobile               | Full-screen overlay |
| MOB-009 | Pinch to zoom                  | E2E  | 1. Open preview 2. Pinch gesture        | Zooms in/out        |
| MOB-010 | Close button                   | E2E  | 1. Open preview 2. Tap close            | Overlay closes      |
| MOB-011 | Template customizer accessible | E2E  | 1. In mobile preview 2. Open customizer | Customizer works    |
| MOB-012 | Template selector              | E2E  | 1. In mobile preview 2. Change template | Template switches   |

### 14.3 Mobile Dashboard (P1)

| Test ID | Test Case                   | Type | Steps                         | Expected Result                 |
| ------- | --------------------------- | ---- | ----------------------------- | ------------------------------- |
| MOB-013 | Dashboard responsive layout | E2E  | 1. View dashboard at < 768px  | Single column, responsive cards |
| MOB-014 | Mobile actions work         | E2E  | 1. Use card actions on mobile | All actions functional          |

### 14.4 Responsive Breakpoints (P1)

| Test ID | Test Case              | Type | Steps                     | Expected Result              |
| ------- | ---------------------- | ---- | ------------------------- | ---------------------------- |
| MOB-015 | 375px (mobile)         | E2E  | 1. Set viewport to 375px  | Single column, bottom nav    |
| MOB-016 | 768px (tablet)         | E2E  | 1. Set viewport to 768px  | Adapted layout               |
| MOB-017 | 1024px (desktop)       | E2E  | 1. Set viewport to 1024px | Full side-by-side layout     |
| MOB-018 | 1440px (large desktop) | E2E  | 1. Set viewport to 1440px | Full layout with extra space |

---

## 15. Accessibility

### 15.1 Keyboard Navigation (P1)

| Test ID  | Test Case                       | Type | Steps                           | Expected Result                                     |
| -------- | ------------------------------- | ---- | ------------------------------- | --------------------------------------------------- |
| A11Y-001 | Tab navigation                  | E2E  | 1. Tab through page             | All interactive elements focusable in logical order |
| A11Y-002 | Skip link                       | E2E  | 1. Tab to skip link 2. Activate | Skips to main content                               |
| A11Y-003 | Modal focus trap                | E2E  | 1. Open modal 2. Tab            | Focus stays within modal                            |
| A11Y-004 | Escape closes modal             | E2E  | 1. Open modal 2. Press Escape   | Modal closes, focus returns                         |
| A11Y-005 | Focus returns after modal close | E2E  | 1. Open modal 2. Close          | Focus returns to trigger element                    |

### 15.2 ARIA & Screen Reader (P2)

| Test ID  | Test Case              | Type | Steps                         | Expected Result                   |
| -------- | ---------------------- | ---- | ----------------------------- | --------------------------------- |
| A11Y-006 | Form labels            | Unit | 1. Check form fields          | All fields have associated labels |
| A11Y-007 | Error announcements    | Unit | 1. Submit invalid form        | Errors announced via aria-live    |
| A11Y-008 | Icon button labels     | Unit | 1. Check icon-only buttons    | All have `aria-label`             |
| A11Y-009 | Toggle aria-pressed    | Unit | 1. Check toggle controls      | `aria-pressed` attribute present  |
| A11Y-010 | Save status accessible | Unit | 1. Check save indicator       | Screen-reader friendly status     |
| A11Y-011 | Touch targets 44px+    | Unit | 1. Check mobile touch targets | Minimum 44px on mobile            |

### 15.3 Color Contrast (P2)

| Test ID  | Test Case            | Type   | Steps                                | Expected Result        |
| -------- | -------------------- | ------ | ------------------------------------ | ---------------------- |
| A11Y-012 | Light theme contrast | Manual | 1. Run contrast checker              | All text meets WCAG AA |
| A11Y-013 | Dark theme contrast  | Manual | 1. Run contrast checker in dark mode | All text meets WCAG AA |

---

## 16. Error Handling

### 16.1 Authentication Errors (P0)

| Test ID | Test Case      | Type | Steps                           | Expected Result                             |
| ------- | -------------- | ---- | ------------------------------- | ------------------------------------------- |
| ERR-001 | Invalid email  | E2E  | 1. Enter invalid email format   | "Please enter a valid email address"        |
| ERR-002 | Weak password  | E2E  | 1. Enter short password         | "Password must be at least 8 characters"    |
| ERR-003 | Wrong password | E2E  | 1. Login with wrong password    | "Invalid email or password"                 |
| ERR-004 | User exists    | E2E  | 1. Register with existing email | "An account with this email already exists" |

### 16.2 Plan Limit Errors (P0)

| Test ID | Test Case        | Type | Steps                              | Expected Result                                |
| ------- | ---------------- | ---- | ---------------------------------- | ---------------------------------------------- |
| ERR-005 | Resume limit     | E2E  | 1. Free user creates 4th resume    | "You've reached your resume limit (3)"         |
| ERR-006 | Credit limit     | E2E  | 1. Exhaust credits 2. Try AI       | "You've run out of AI credits for this month"  |
| ERR-007 | Premium required | E2E  | 1. Free user tries premium feature | "This feature requires a Premium subscription" |

### 16.3 Export Errors (P1)

| Test ID | Test Case           | Type | Steps                          | Expected Result                           |
| ------- | ------------------- | ---- | ------------------------------ | ----------------------------------------- |
| ERR-008 | PDF export failed   | Unit | 1. Mock PDF generation failure | "Failed to export PDF. Please try again." |
| ERR-009 | Empty resume export | E2E  | 1. Try to export empty resume  | "Cannot export an empty resume"           |

### 16.4 Network Errors (P1)

| Test ID | Test Case          | Type | Steps                        | Expected Result                 |
| ------- | ------------------ | ---- | ---------------------------- | ------------------------------- |
| ERR-010 | Offline save       | E2E  | 1. Go offline 2. Try to save | Offline message shown           |
| ERR-011 | API timeout        | Unit | 1. Mock AI request timeout   | Timeout error with retry option |
| ERR-012 | Server error (500) | Unit | 1. Mock server 500           | User-friendly error message     |

### 16.5 Validation Errors (P0)

| Test ID | Test Case                     | Type | Steps                         | Expected Result                               |
| ------- | ----------------------------- | ---- | ----------------------------- | --------------------------------------------- |
| ERR-013 | Required fields inline        | E2E  | 1. Submit empty form section  | Inline errors near fields                     |
| ERR-014 | Validation summary            | Unit | 1. Multiple validation errors | aria-live summary of errors                   |
| ERR-015 | Optional sections don't block | E2E  | 1. Skip optional sections     | Can proceed without filling optional sections |

---

## 17. Pricing Page (`/pricing`)

### 17.1 Plan Display (P2)

| Test ID   | Test Case            | Type | Steps                  | Expected Result                                                                                              |
| --------- | -------------------- | ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| PRICE-001 | Free plan details    | Unit | 1. Render pricing page | Shows: 3 resumes, 3 cover letters, 30 AI credits/month, all templates, exports, 1 public link                |
| PRICE-002 | Premium plan details | Unit | 1. Render pricing page | Shows: Unlimited everything, batch enhancement, full interview prep, LinkedIn optimization, priority support |
| PRICE-003 | Premium price        | Unit | 1. Render pricing page | Shows €12/month                                                                                              |
| PRICE-004 | Coming soon badge    | Unit | 1. Render Premium plan | "Coming Soon" indicator                                                                                      |
| PRICE-005 | Credit cost table    | Unit | 1. Render pricing page | Shows Quick (1), Medium (2), Heavy (3), Intensive (5) tiers                                                  |

---

## Test Execution

### Priority Matrix

| Priority | Count | Description                            |
| -------- | ----- | -------------------------------------- |
| P0       | ~95   | Critical path - must pass              |
| P1       | ~130  | High priority - production requirement |
| P2       | ~40   | Medium priority - quality release      |
| P3       | ~5    | Low priority - nice-to-have            |

### Test Type Distribution

| Type   | Count | Automation                |
| ------ | ----- | ------------------------- |
| Unit   | ~120  | Vitest (automated)        |
| E2E    | ~130  | Playwright (to implement) |
| Manual | ~20   | Human verification        |

### Pre-Release Checklist

- [ ] All P0 tests passing
- [ ] All P1 tests passing
- [ ] No console errors in production build
- [ ] Mobile responsiveness verified (375px, 768px, 1024px, 1440px)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance audit (Lighthouse score > 80)
- [ ] Accessibility audit (no critical issues)
- [ ] PDF export visual verification for all templates

### Test Environment

| Factor      | Values                                             |
| ----------- | -------------------------------------------------- |
| Browsers    | Chrome (latest), Firefox (latest), Safari (latest) |
| Mobile      | iOS Safari, Android Chrome                         |
| Viewports   | 375px, 768px, 1024px, 1440px                       |
| Network     | Fast 3G, 4G, WiFi                                  |
| Users       | Free tier, Premium tier, Admin                     |
| Auth States | Unauthenticated, Authenticated, Expired session    |

### Running Tests

```bash
# Unit tests (Vitest)
npm test

# Specific test file
npm test -- path/to/test.ts

# With coverage
npm run test:coverage
```

---

## Bug Reporting Template

```markdown
## Bug Report

**Test ID**: [e.g., EDIT-050]
**Title**: [Brief description]
**Severity**: Critical / High / Medium / Low
**Environment**: [Browser, OS, Screen size]

### Steps to Reproduce

1.
2.
3.

### Expected Result

[What should happen]

### Actual Result

[What actually happened]

### Screenshots/Videos

[Attach if applicable]

### Console Errors

[Any JS errors]
```

---

_Total test cases: ~270 covering all documented features from USER_FLOW.md_
_Last updated: 2026-02-02_
