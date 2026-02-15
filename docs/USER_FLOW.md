# ResumeForge - Complete User Flow Documentation

> **Version:** 1.0
> **Last Updated:** February 2, 2026
> **Purpose:** Comprehensive documentation of all user flows, features, and interactions

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Home Page](#2-home-page)
3. [Authentication Flow](#3-authentication-flow)
4. [Onboarding Flow](#4-onboarding-flow)
5. [Dashboard](#5-dashboard)
6. [Resume Editor](#6-resume-editor)
7. [Template System](#7-template-system)
8. [AI Features](#8-ai-features)
9. [Cover Letter Builder](#9-cover-letter-builder)
10. [Export Features](#10-export-features)
11. [Public Sharing](#11-public-sharing)
12. [Settings](#12-settings)
13. [Pricing & Plans](#13-pricing--plans)
14. [Keyboard Shortcuts](#14-keyboard-shortcuts)
15. [Mobile Experience](#15-mobile-experience)

---

## 1. Application Overview

### What is ResumeForge?

ResumeForge is an AI-powered resume builder that helps job seekers create professional, ATS-optimized resumes and cover letters. The application features:

- **22 Professional Templates** with varying ATS compatibility levels
- **AI-Powered Features** for content generation and optimization
- **Real-time Preview** with live updates as you type
- **Multiple Export Formats** (PDF, DOCX, JSON)
- **Cover Letter Builder** with AI generation
- **Public Sharing** with custom URLs and QR codes
- **Interview Preparation** tools with AI-generated questions

### Core User Journey

```
Home → Register → Onboarding → Resume Editor → Dashboard → Export/Share
```

---

## 2. Home Page

**URL:** `/`

### Sections

#### 2.1 Hero Section

- **Headline:** "Land interviews, not rejections." (with typing animation)
- **Subtext:** Value proposition about AI-powered resumes and ATS optimization
- **Primary CTA:** "Create Your Resume" → `/templates` (logged in) or `/register` (guest)
- **Secondary CTA:** "or create a Cover Letter" → `/cover-letter` or `/register`
- **Trust Badges:** "Free to start", "No credit card", "ATS-optimized"
- **Visual:** Interactive resume preview with auto-rotating templates (Modern, Classic, Creative)

#### 2.2 Trusted By Section

- Company logos: Google, Microsoft, Amazon, Meta, Apple, Netflix, Salesforce

#### 2.3 Stats Section

| Stat                   | Value   | Description                      |
| ---------------------- | ------- | -------------------------------- |
| Professional Templates | 22      | Total template count             |
| ATS-Friendly Templates | 15+     | Excellent/Good ATS compatibility |
| To First Draft         | < 5 min | Average time to create           |
| Real-time Preview      | Live    | Instant preview updates          |

#### 2.4 Key Benefits

1. **Instant PDF Export** - Download professional PDFs
2. **Smart AI Optimization** - AI-powered content improvement
3. **Professional Templates** - ATS-optimized designs
4. **Instant Preview** - Real-time visual feedback

#### 2.5 Templates Preview

- Shows top 3 featured templates (Adaptive, Modern, Timeline)
- "View All Templates" button → `/templates`

#### 2.6 How It Works

| Step | Title            | Description                       |
| ---- | ---------------- | --------------------------------- |
| 1    | Choose Template  | Pick from 22 professional designs |
| 2    | Fill Information | Enter your experience and skills  |
| 3    | Download & Apply | Export PDF and start applying     |

#### 2.7 FAQ Section (7 Questions)

- ATS optimization explained
- Data security
- Export formats
- Free vs paid
- Multiple resume versions
- AI features overview
- Comparison to competitors

---

## 3. Authentication Flow

### 3.1 Registration

**URL:** `/register`

#### Form Fields

| Field          | Required | Validation             |
| -------------- | -------- | ---------------------- |
| First Name     | Yes      | Non-empty              |
| Last Name      | Yes      | Non-empty              |
| Email          | Yes      | Valid email format     |
| Password       | Yes      | See requirements below |
| Terms Checkbox | Yes      | Must be checked        |

#### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&\*)

#### Password Strength Indicator

- **Weak:** 0-40%
- **Medium:** 40-70%
- **Strong:** 70-100%

#### Registration Methods

1. **Email/Password**

   - Fill form → "Create account" button
   - Creates Firebase Auth account
   - Creates user metadata in Firestore
   - Redirects to `/onboarding`

2. **Google OAuth**
   - "Sign up with Google" button
   - Google account picker popup
   - Checks if new user
   - Creates metadata if new
   - Redirects to `/onboarding`

#### Post-Registration

- Toast: "Account created successfully!"
- Redirect: `/onboarding`

---

### 3.2 Login

**URL:** `/login`

#### Form Fields

| Field    | Required |
| -------- | -------- |
| Email    | Yes      |
| Password | Yes      |

#### Login Methods

1. **Email/Password**

   - Fill form → "Log in" button
   - Validates credentials
   - Toast: "Welcome back!"

2. **Google OAuth**
   - "Continue with Google" button
   - Google account picker popup

#### Post-Login Routing

- Has saved resumes → `/dashboard`
- No saved resumes → `/` (home)
- Has `returnTo` in session → Preserved redirect

#### Additional Links

- "Forgot password?" → `/forgot-password`
- "Sign up for free" → `/register`

---

### 3.3 Password Recovery

**URL:** `/forgot-password`

#### Flow

1. Enter email address
2. Click "Send reset link"
3. Firebase sends password reset email
4. Confirmation screen shown
5. User clicks link in email
6. Firebase handles password reset

---

### 3.4 Route Protection

Protected routes use `AuthGuard` component:

- `/dashboard/*`
- `/editor/*`
- `/cover-letter/*`
- `/settings/*`
- `/onboarding`
- `/applications`

#### Behavior

- Shows loading spinner while checking auth
- Unauthenticated users redirected to `/login`
- Return URL preserved in `sessionStorage`
- Login page shows toast: "Please log in to access {feature}"

---

## 4. Onboarding Flow

**URL:** `/onboarding`

### Step 1: Choose How to Begin

1. Enter target job title OR select popular role
2. Popular roles (quick-select buttons):
   - Software Engineer
   - Product Manager
   - Data Scientist
   - UX Designer
   - Marketing Manager
   - Business Analyst
3. Custom job title input with real-time validation

### Step 2: Template Selection

#### Template Recommendations

Based on job title, recommendations vary:
| Role Type | Recommended Templates |
|-----------|----------------------|
| Tech (Engineer, Developer) | Technical, Modern, Minimalist |
| Business/Finance | Executive, Ivy, Classic |
| Creative (Designer, Writer) | Creative, Timeline, Modern |
| Management | Executive, Modern, Classic |
| Sales/Marketing | Modern, Classic, Executive |

#### Template Card Features

- Recommended badge (AI-suggested)
- ATS compatibility score
- Template preview thumbnail
- Click to select

### Navigation

| Button        | Action                                                      |
| ------------- | ----------------------------------------------------------- |
| Back          | Previous step (hidden on step 1)                            |
| Next          | Advance to next step                                        |
| Skip setup    | Go directly to `/editor/new`                                |
| Create Resume | Final button → `/editor/new?template={id}&jobTitle={title}` |

---

## 5. Dashboard

**URL:** `/dashboard`

### 5.1 Layout

#### Header (`MyResumesHeader`)

| Element            | Action                                        |
| ------------------ | --------------------------------------------- |
| "My Resumes" title | -                                             |
| Create Resume      | `/onboarding` (first resume) or `/editor/new` |
| Optimize for Job   | Opens optimize dialog                         |

#### Stats Section (`DashboardHeader`)

| Stat          | Display               |
| ------------- | --------------------- |
| Total Resumes | X / Y (count / limit) |
| Cover Letters | X / Y (count / limit) |
| AI Credits    | Current balance       |

### 5.2 Tabs

#### Resumes Tab (Default)

When empty: Shows `OnboardingChecklist` with steps

When has resumes: Shows resume cards in grid (1-3 columns)

#### Cover Letters Tab

When empty: Shows `EmptyState` with "Create Cover Letter" CTA

When has cover letters: Shows cover letter cards in grid

### 5.3 Resume Card

#### Header

- Resume name (truncated)
- Template badge (color-coded)
- Last updated date
- Readiness status badge

#### Primary Actions (2-column grid)

| Button  | Action                     |
| ------- | -------------------------- |
| Edit    | Navigate to `/editor/{id}` |
| Preview | Open preview dialog        |

#### Export Actions (2-column grid)

| Button | Action           |
| ------ | ---------------- |
| PDF    | Download as PDF  |
| DOCX   | Download as DOCX |

#### AI Tools Section

| Button       | Action                               |
| ------------ | ------------------------------------ |
| Cover Letter | Quick cover letter generation dialog |
| Optimize     | Open ATS optimization dialog         |

#### More Menu (Dropdown)

| Option      | Action                       |
| ----------- | ---------------------------- |
| Preview     | Open preview dialog          |
| Export JSON | Download JSON backup         |
| Delete      | Confirmation dialog → Delete |

### 5.4 Resume Grouping

Master resumes group with their tailored versions:

- Master resume shows all actions
- Tailored versions show in collapsible section
- Count badge shows number of tailored versions

### 5.5 Cover Letter Card

#### Header

- Cover letter name
- Template badge
- Last updated
- Completion status (X/4 sections or "Complete")

#### Info Display

- Company name (if set)
- Job title (if set)

#### Actions

| Button  | Action                                   |
| ------- | ---------------------------------------- |
| Edit    | Navigate to `/edit-cover-letter?id={id}` |
| Preview | Open preview                             |
| PDF     | Download PDF                             |
| Delete  | Confirmation dialog                      |

### 5.6 Dialogs

#### Preview Dialog

- Full-screen resume preview
- Template renderer at 60% scale
- Shows: name, template, last updated
- Close button

#### Delete Confirmation Dialog

- Shows item name
- "Cancel" and "Delete" buttons
- Loading state during deletion

#### Plan Limit Dialog

- Triggered when limit reached
- Shows current limit
- "Manage" or "Upgrade plan" options
- Upgrade routes to `/pricing#pro`

#### Optimize Dialog (Multi-step)

1. **Form View:** Enter job description, title, company, select resume
2. **Results View:** ATS score, missing keywords, suggestions
3. **Wizard View:** Step-by-step improvement guide

---

## 6. Resume Editor

**URL:** `/editor/new` or `/editor/{id}`

### 6.1 Editor Layout

#### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│                       Editor Header                          │
├───────────┬────────────────────────────┬────────────────────┤
│  Section  │                            │                    │
│Navigation │      Form Section          │   Preview Panel    │
│  (Sidebar)│                            │                    │
└───────────┴────────────────────────────┴────────────────────┘
```

#### Mobile (<1024px)

```
┌─────────────────────────┐
│      Editor Header      │
├─────────────────────────┤
│                         │
│    Form OR Preview      │
│    (Toggle between)     │
│                         │
├─────────────────────────┤
│    Mobile Bottom Bar    │
└─────────────────────────┘
```

### 6.2 Editor Header

#### Left Side

| Element     | Action                                           |
| ----------- | ------------------------------------------------ |
| Back button | Return to dashboard (with unsaved changes check) |
| Resume name | Display only                                     |

#### Center

| Element      | Description                 |
| ------------ | --------------------------- |
| Progress bar | "X of Y sections completed" |

#### Right Side

| Button            | Action                                                          |
| ----------------- | --------------------------------------------------------------- |
| Show/Hide Preview | Toggle preview panel                                            |
| JD Context Badge  | Job description match info                                      |
| Readiness Badge   | Ready/Needs attention status                                    |
| Save & Exit       | Save and return to dashboard                                    |
| More Menu         | Export PDF, Export JSON, Import, Change Template, Reset, Logout |

### 6.3 Section Navigation

#### Sections (8 total)

| #   | Section              | Icon          | Required |
| --- | -------------------- | ------------- | -------- |
| 1   | Personal Information | User          | Yes      |
| 2   | Work Experience      | Briefcase     | Yes      |
| 3   | Education            | GraduationCap | Yes      |
| 4   | Skills               | Zap           | No       |
| 5   | Projects             | FolderGit2    | No       |
| 6   | Certifications       | Award         | No       |
| 7   | Languages            | Languages     | No       |
| 8   | Additional           | Layers        | No       |

#### Navigation Features

- Click section to jump directly
- Completion checkmarks shown
- Active section highlighted
- Collapsible sidebar (desktop)
- Progress percentage at bottom

### 6.4 Section Details

#### Personal Information

| Field                | Required | Notes                   |
| -------------------- | -------- | ----------------------- |
| First Name           | Yes      |                         |
| Last Name            | Yes      |                         |
| Email                | Yes      | Validated               |
| Phone                | Yes      |                         |
| Location             | Yes      |                         |
| Job Title            | No       | Used for AI suggestions |
| Website              | No       | Collapsible             |
| LinkedIn             | No       | Collapsible             |
| GitHub               | No       | Collapsible             |
| Professional Summary | No       | AI generation available |
| Photo                | No       | Template-dependent      |

**AI Features:**

- "Generate Summary" button uses AI to create summary from experience

---

#### Work Experience

| Field            | Required | Notes                    |
| ---------------- | -------- | ------------------------ |
| Position Title   | Yes      |                          |
| Company Name     | Yes      |                          |
| Location         | No       |                          |
| Start Date       | Yes      | Month picker             |
| End Date         | No       | Month picker             |
| Current Position | No       | Checkbox, hides end date |
| Description      | No       | Bullet points            |

**Features:**

- Add multiple positions
- Drag-and-drop reordering
- Expandable/collapsible cards
- AI bullet improvement
- AI quantification
- Ghost suggestions (AI autocomplete)

**AI Features per Bullet:**
| Button | Action | Credits |
|--------|--------|---------|
| Improve | Rewrite with stronger action verbs | 1 |
| Quantify | Add metrics and numbers | 1 |
| Generate | Create new bullets for role | 2 |

---

#### Education

| Field               | Required | Notes         |
| ------------------- | -------- | ------------- |
| Institution         | Yes      |               |
| Location            | No       |               |
| Degree              | Yes      |               |
| Field of Study      | Yes      |               |
| Start Date          | Yes      | Month picker  |
| End Date            | No       | Month picker  |
| Currently Attending | No       | Checkbox      |
| GPA                 | No       |               |
| Achievements        | No       | Bullet points |

**Features:**

- Add multiple entries
- Drag-and-drop reordering
- Expandable cards

---

#### Skills

| Field       | Required | Notes                                 |
| ----------- | -------- | ------------------------------------- |
| Skill Name  | Yes      |                                       |
| Category    | No       | Dropdown                              |
| Proficiency | No       | Beginner/Intermediate/Advanced/Expert |

**Categories:**

- Technical
- Soft Skills
- Languages
- Tools
- Other

**AI Features:**

- "Suggest Skills" button based on job title
- Auto-fetches suggestions when job title exists
- Undo option for AI suggestions

---

#### Projects

| Field        | Required | Notes           |
| ------------ | -------- | --------------- |
| Project Name | Yes      |                 |
| Description  | No       |                 |
| Start Date   | No       | Month picker    |
| End Date     | No       | Month picker    |
| Technologies | No       | Comma-separated |
| Live URL     | No       |                 |
| GitHub URL   | No       |                 |

---

#### Certifications

**Two types via tabs:**

**Certifications:**
| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | |
| Issuer | No | |
| Issue Date | No | Month picker |
| Expiry Date | No | Month picker |
| Credential ID | No | |
| Verification URL | No | |

**Courses:**
| Field | Required | Notes |
|-------|----------|-------|
| Course Name | Yes | |
| Platform/Institution | No | |
| Completion Date | No | Month picker |
| Certificate ID | No | |
| Certificate URL | No | |

---

#### Languages

| Field         | Required | Notes                              |
| ------------- | -------- | ---------------------------------- |
| Language Name | Yes      |                                    |
| Proficiency   | Yes      | Native/Fluent/Conversational/Basic |

---

#### Additional Sections

**Three sub-sections via tabs:**

**Extra-Curricular Activities:**
| Field | Required |
|-------|----------|
| Title | Yes |
| Organization | Yes |
| Role/Position | No |
| Start Date | Yes |
| End Date | No |
| Current | No (checkbox) |
| Description | No (bullets) |

**Hobbies:**
| Field | Required |
|-------|----------|
| Name | Yes |
| Description | No |

**Custom Sections:**
| Field | Required |
|-------|----------|
| Section Title | Yes |
| Item Title | Yes |
| Date | No |
| Location | No |
| Description | No |

### 6.5 Preview Panel

#### Features

- Live preview at ~40% zoom
- Scrollable within panel
- Template selector dropdown
- "Customize" button → Opens template customizer
- "Complete" badge when all required fields filled

### 6.6 Template Customizer

#### Color Options

**Presets:**

- Ocean (blue)
- Emerald (green)
- Sunset (orange)
- Plum (purple)
- Charcoal (gray)
- Sand (tan)

**Custom Colors:**

- Primary color picker
- Secondary color picker

#### Typography Options

| Option          | Values                                         |
| --------------- | ---------------------------------------------- |
| Font Family     | Sans, Serif, Mono, Georgia, Garamond, Palatino |
| Font Size       | 10-18px (slider)                               |
| Line Spacing    | 1-2x (slider)                                  |
| Section Spacing | 8-32px (slider)                                |

### 6.7 Section Wrapper

#### Components

- Section title and description
- Progress dots (desktop)
- Validation warning banner
- Navigation buttons

#### Navigation Buttons

| Position | First Section | Middle Sections | Last Section    |
| -------- | ------------- | --------------- | --------------- |
| Left     | -             | "Back"          | "Back"          |
| Right    | "Next"        | "Next"          | "Finish & Save" |

#### Validation Banner

When errors exist and "Next" clicked:

- Shows error count and messages
- "Fix Now" button scrolls to first error
- "Continue Anyway" proceeds despite errors

### 6.8 Auto-Save

#### Session Storage (Immediate)

- Saves on every change
- Used for crash recovery
- Shows recovery prompt on page reload

#### Firestore Cloud Save (Debounced)

- 600ms debounce
- Authenticated users only
- Status indicators:
  - "Saving to cloud..."
  - "Saved just now"
  - "Saved Xs ago"
  - "Saved Xm ago"

### 6.9 Recovery System

If unsaved changes detected on page load:

1. `RecoveryPrompt` dialog appears
2. Shows last modified timestamp
3. Options:
   - "Recover Draft" → Load unsaved data
   - "Discard" → Use fresh/saved data

---

## 7. Template System

### 7.1 Template Gallery

**URL:** `/templates`

#### Layout

- Desktop: Sidebar filters + Grid of templates
- Mobile: Bottom sheet filters + Grid

#### Filters

| Filter        | Options                                                 |
| ------------- | ------------------------------------------------------- |
| Layout        | Any, Single-column, Two-column, Sidebar                 |
| Style         | Modern, Classic, Creative, ATS-Optimized (multi-select) |
| Photo Support | Any, With photo, Without photo                          |
| Industry      | Multi-select from available industries                  |

#### Template Card

- Preview thumbnail (A4 aspect ratio)
- Template name
- Hover overlay with:
  - Description
  - Color selector (swatches)
  - Feature badges
  - "Use Template" button

### 7.2 Available Templates (22 Total)

#### ATS-Optimized (Excellent - 95%+ parse rate)

| Template   | Columns | Photo | Popularity |
| ---------- | ------- | ----- | ---------- |
| Clarity    | 1       | No    | 98         |
| Cubic      | 1       | No    | 94         |
| Ivy League | 1       | No    | 92         |
| Simple     | 1       | No    | 94         |
| Diamond    | 1       | No    | 91         |
| Compact    | 1       | No    | 85         |
| Student    | 1       | No    | 89         |
| Structured | 1       | No    | 88         |
| Bold       | 1       | No    | 87         |

#### Good ATS (85%+ parse rate)

| Template   | Columns | Photo | Popularity |
| ---------- | ------- | ----- | ---------- |
| Minimalist | 1       | No    | 96         |
| Classic    | 1       | Yes   | 93         |
| Dublin     | 2       | Yes   | 91         |
| Adaptive   | 2       | Yes   | 90         |
| Cascade    | 2       | No    | 89         |
| Functional | 1       | No    | 86         |
| Iconic     | 2       | Yes   | 88         |

#### Moderate/Low ATS

| Template    | Columns | Photo | ATS Level | Popularity |
| ----------- | ------- | ----- | --------- | ---------- |
| Modern      | 2       | Yes   | Moderate  | 95         |
| Executive   | 2       | Yes   | Moderate  | 86         |
| Infographic | 2       | Yes   | Moderate  | 78         |
| Technical   | 2       | No    | Low       | 84         |
| Timeline    | 1       | No    | Low       | 82         |
| Creative    | 2       | Yes   | Low       | 80         |

### 7.3 Color Palettes

#### Standard Palettes (10)

| Name     | Hex Code |
| -------- | -------- |
| Ocean    | #0ea5e9  |
| Forest   | #059669  |
| Sunset   | #f97316  |
| Plum     | #7c3aed  |
| Charcoal | #334155  |
| Rose     | #e11d48  |
| Amber    | #d97706  |
| Navy     | #1e40af  |
| Sage     | #4d7c0f  |
| Slate    | #475569  |

#### IDE Themes (Technical Template Only)

- VS Code Dark+
- Dracula
- One Dark
- Monokai
- Nord
- GitHub Dark

---

## 8. AI Features

### 8.1 Overview

All AI features use Google Gemini 2.5 Flash with caching for performance.

### 8.2 Feature Matrix

| Feature               | Credits | Location         | Description                  |
| --------------------- | ------- | ---------------- | ---------------------------- |
| Improve Bullet        | 1       | Work Experience  | Rewrite with stronger verbs  |
| Quantify Achievement  | 1       | Work Experience  | Add metrics to bullet        |
| Suggest Skills        | 1       | Skills section   | Suggest relevant skills      |
| Generate Bullets      | 2       | Work Experience  | Create 4 bullets for role    |
| Generate Summary      | 2       | Personal Info    | Create professional summary  |
| Score Resume          | 2       | Command palette  | Rate resume quality          |
| ATS Analysis          | 3       | Optimize button  | Analyze vs job description   |
| Generate Improvement  | 3       | Various          | Suggest improvements         |
| Cover Letter          | 5       | Dashboard/Editor | Generate full cover letter   |
| Tailor Resume         | 5       | Editor           | Customize for job posting    |
| Interview Prep        | 5       | Dashboard        | Generate interview questions |
| Batch Enhance         | 5       | Editor           | Enhance all content at once  |
| LinkedIn Optimization | 5       | Command palette  | Optimize LinkedIn profile    |

### 8.3 AI Control Bar

Located at top of resume editor:

| Button         | Action                              |
| -------------- | ----------------------------------- |
| Enhance All    | Batch enhance summary + all bullets |
| AI Optimize    | Open ATS analysis dialog            |
| Tailor         | Tailor resume to job description    |
| Interview Prep | Generate interview questions        |
| Cover Letter   | Quick cover letter generation       |

### 8.4 ATS Analysis Flow

1. Click "AI Optimize" or "Optimize for Job"
2. Paste job description (min 50 characters)
3. Enter job title and company (optional)
4. Click "Analyze"
5. Results show:
   - **ATS Score** (0-100)
   - **Missing Keywords** list
   - **Suggestions** with severity and actions
   - **Strengths** to highlight
   - **Improvements** recommended
   - **Learnable Skills** with resources

### 8.5 Tailor Resume Flow

1. Click "Tailor" button
2. Enter job description
3. Progress stages:
   - Analyzing job requirements
   - Matching skills
   - Optimizing bullets
   - Finalizing
4. Results show:
   - Tailored summary
   - Enhanced bullets per experience
   - Added keywords
   - Change log
5. Options:
   - Create tailored copy (new resume)
   - Apply changes to current
   - Download tailored version

### 8.6 Interview Prep Flow

1. Navigate to `/dashboard/interview-prep`
2. Select resume and enter job description
3. AI generates:
   - 15-20 questions (behavioral, technical, situational)
   - Sample answers with key points
   - Follow-up questions
   - Skill gap analysis
   - Readiness score (0-100)
4. Practice mode hides answers
5. Difficulty levels: Easy, Medium, Hard

### 8.7 Credit System

#### Free Tier

- 30 credits per month
- Resets monthly

#### Premium Tier

- Unlimited credits

#### Credit Usage Display

- Shown in dashboard header
- Updates after each AI action
- Warning when low

---

## 9. Cover Letter Builder

**URL:** `/cover-letter` or `/edit-cover-letter?id={id}`

### 9.1 Sections (4 Total)

#### Section 1: Job Details

| Field            | Required |
| ---------------- | -------- |
| Job Title        | Yes      |
| Job Reference    | No       |
| Application Date | No       |

#### Section 2: Recipient Information

| Field                | Required |
| -------------------- | -------- |
| Company Name         | Yes      |
| Hiring Manager Name  | No       |
| Hiring Manager Title | No       |
| Department           | No       |
| Company Address      | No       |

#### Section 3: Your Information

| Field     | Required |
| --------- | -------- |
| Full Name | Yes      |
| Email     | Yes      |
| Phone     | No       |
| Location  | No       |
| LinkedIn  | No       |
| Website   | No       |

**"Sync from Resume" button** pulls data from linked resume.

#### Section 4: Letter Content

| Field             | Required       |
| ----------------- | -------------- |
| Salutation        | Yes (dropdown) |
| Opening Paragraph | Yes            |
| Body Paragraphs   | Yes (1-4)      |
| Closing Paragraph | Yes            |
| Sign Off          | Yes (dropdown) |

### 9.2 Salutation Options

- Dear Hiring Manager,
- Dear Recruiting Team,
- To Whom It May Concern,
- Dear [Name], (custom)

### 9.3 Sign Off Options

- Sincerely,
- Best regards,
- Kind regards,
- Respectfully,
- Thank you,

### 9.4 Templates

| Template | Style                                   |
| -------- | --------------------------------------- |
| Modern   | Clean, teal accent, contemporary        |
| Classic  | Traditional business letter, serif font |

### 9.5 AI Generation

Quick generation dialog:

1. Select resume
2. Enter company name and position
3. Paste job description
4. Optionally add hiring manager name
5. Click "Generate"
6. Review and edit generated content

---

## 10. Export Features

### 10.1 Resume Export Formats

#### PDF Export

- Uses @react-pdf/renderer
- Applies template customization (colors, fonts, spacing)
- A4 page size
- Professional formatting
- Filename: `resume-{timestamp}.pdf`

#### DOCX Export

- Microsoft Word format
- Maintains formatting
- Filename: `resume-{timestamp}.docx`

#### JSON Export

- Backup/import format
- Schema versioned
- Pretty-printed
- Filename: `resume-{timestamp}.json`

### 10.2 Cover Letter Export Formats

#### PDF Export

- Matches cover letter template
- A4 page size
- Filename: `cover-letter-{company}-{timestamp}.pdf`

#### JSON Export

- Backup format
- Schema: `https://resumeforge.app/schema/cover-letter/v1`

### 10.3 Bulk Export (Settings)

- Export All Resumes (JSON)
- Export All Cover Letters (JSON)
- Includes metadata wrapper

---

## 11. Public Sharing

### 11.1 Overview

Public sharing allows creating a shareable URL for any resume.

**URL Pattern:** `resumeforge.app/u/{username}/{slug}`

### 11.2 Setup Flow

#### First Time (No Username)

1. Open Share dialog from resume card
2. Choose a username (3-30 chars, lowercase, numbers, hyphens)
3. Check availability
4. Claim username

#### Publishing

1. Open Share dialog
2. Settings tab:
   - Toggle "Publish" on
   - (Optional) Edit custom slug
   - Set privacy options
3. Click "Publish"
4. Share tab:
   - Copy link
   - Social share buttons
   - QR code

### 11.3 Privacy Options

| Option        | Description                      |
| ------------- | -------------------------------- |
| Hide Email    | Remove email from public view    |
| Hide Phone    | Remove phone from public view    |
| Hide Location | Remove location from public view |

### 11.4 Share Options

| Method    | Action                      |
| --------- | --------------------------- |
| Copy Link | Copy URL to clipboard       |
| Twitter   | Share with pre-filled tweet |
| LinkedIn  | Share to LinkedIn           |
| Facebook  | Share to Facebook           |
| Email     | Open email client with link |
| QR Code   | Display/download QR code    |

### 11.5 Public Page Features

- View resume with selected template
- Share button (native share API)
- Download PDF button
- "Build Your Resume Free" CTA
- View tracking (analytics)

### 11.6 Plan Limits

| Plan    | Public Links |
| ------- | ------------ |
| Free    | 1            |
| Premium | Unlimited    |

---

## 12. Settings

**URL:** `/settings`

### 12.1 Sections

#### Profile

- **Email:** Display only (cannot change)
- **Display Name:** Editable text field
- **Save** button

#### Appearance

- **Theme:** Light / Dark / System
- Visual radio buttons with icons

#### Data Export

- **Export All Resumes:** JSON download
- **Export All Cover Letters:** JSON download
- Shows document counts

#### Danger Zone

- **Export Your Data:** Backup before deletion
- **Delete Account:**
  1. Click "Delete Account"
  2. Confirmation dialog appears
  3. Re-authentication required
  4. Account and all data permanently deleted
  5. Redirected to login

### 12.2 Dev Tools (Admin Only)

| Feature        | Purpose                      |
| -------------- | ---------------------------- |
| Current Status | Shows plan and credit usage  |
| Premium Toggle | Switch between Free/Premium  |
| Reset Credits  | Set credits to 0 for testing |

---

## 13. Pricing & Plans

**URL:** `/pricing`

### 13.1 Tiers

#### Free Plan (€0/month)

| Feature                  | Limit    |
| ------------------------ | -------- |
| Resumes                  | 3        |
| Cover Letters            | 3        |
| AI Credits               | 30/month |
| Templates                | All      |
| PDF/DOCX Export          | Yes      |
| ATS Optimization         | Yes      |
| Interview Prep Questions | 5        |
| Public Links             | 1        |

#### Premium Plan (€12/month) - Coming Soon

| Feature               | Limit           |
| --------------------- | --------------- |
| Resumes               | Unlimited       |
| Cover Letters         | Unlimited       |
| AI Credits            | Unlimited       |
| Templates             | All             |
| PDF/DOCX Export       | Yes             |
| Batch Enhancement     | Yes             |
| Full Interview Prep   | 15-20 questions |
| LinkedIn Optimization | Yes             |
| Priority Support      | Yes             |
| Public Links          | Unlimited       |

### 13.2 Credit Costs

| Tier      | Credits | Operations                               |
| --------- | ------- | ---------------------------------------- |
| Quick     | 1       | Improve bullet, Suggest skills, Quantify |
| Medium    | 2       | Generate bullets, Generate summary       |
| Heavy     | 3       | ATS analysis, Generate improvement       |
| Intensive | 5       | Cover letter, Tailor, Interview prep     |

---

## 14. Keyboard Shortcuts

### 14.1 Global Shortcuts

| Shortcut               | Action               |
| ---------------------- | -------------------- |
| `Cmd/Ctrl + K`         | Open command palette |
| `Cmd/Ctrl + S`         | Save                 |
| `Cmd/Ctrl + Z`         | Undo                 |
| `Cmd/Ctrl + Shift + Z` | Redo                 |
| `Cmd/Ctrl + Y`         | Redo (alternate)     |

### 14.2 Editor Shortcuts

| Shortcut       | Action                               |
| -------------- | ------------------------------------ |
| `Cmd/Ctrl + P` | Export PDF                           |
| `Cmd/Ctrl + E` | Export JSON                          |
| `Enter`        | Next section (when not in input)     |
| `Backspace`    | Previous section (when not in input) |

### 14.3 Command Palette Commands

| Command      | Shortcut  | Action            |
| ------------ | --------- | ----------------- |
| ATS Analysis | `Cmd + A` | Open ATS analysis |
| Enhance All  | `Cmd + E` | Batch enhance     |
| Save         | `Cmd + S` | Save resume       |
| Export PDF   | `Cmd + P` | Download PDF      |

---

## 15. Mobile Experience

### 15.1 Key Differences

| Feature      | Desktop                     | Mobile             |
| ------------ | --------------------------- | ------------------ |
| Layout       | Side-by-side                | Single column      |
| Navigation   | Sidebar                     | Bottom bar         |
| Preview      | Always visible (toggleable) | Overlay mode       |
| Section Tabs | Sidebar                     | Horizontal stepper |
| Actions      | Visible buttons             | Hamburger menu     |

### 15.2 Mobile Bottom Bar

| Button  | Icon              | Action                     |
| ------- | ----------------- | -------------------------- |
| Back    | ChevronLeft       | Previous section           |
| Status  | AlertCircle/Check | Show issues or ready state |
| Preview | Eye               | Toggle preview overlay     |
| Next    | ChevronRight      | Next section / Finish      |

### 15.3 Mobile Preview Overlay

- Full-screen preview
- Pinch to zoom
- Close button
- Template customizer accessible
- Template selector available

### 15.4 Responsive Breakpoints

| Breakpoint | Width      | Layout                    |
| ---------- | ---------- | ------------------------- |
| Mobile     | < 768px    | Single column, bottom nav |
| Tablet     | 768-1023px | Adapted layout            |
| Desktop    | ≥ 1024px   | Full side-by-side         |

---

## Appendix: Error Messages

### Authentication Errors

| Error          | Message                                     |
| -------------- | ------------------------------------------- |
| Invalid email  | "Please enter a valid email address"        |
| Weak password  | "Password must be at least 8 characters"    |
| Wrong password | "Invalid email or password"                 |
| User exists    | "An account with this email already exists" |

### Plan Limit Errors

| Error            | Message                                        |
| ---------------- | ---------------------------------------------- |
| Resume limit     | "You've reached your resume limit (3)"         |
| Credit limit     | "You've run out of AI credits for this month"  |
| Premium required | "This feature requires a Premium subscription" |

### Export Errors

| Error        | Message                                   |
| ------------ | ----------------------------------------- |
| PDF failed   | "Failed to export PDF. Please try again." |
| Empty resume | "Cannot export an empty resume"           |

---

_This document provides a complete reference for all user-facing features and flows in ResumeForge._
