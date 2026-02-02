# ResumeForge - Manual Test Script

> Step-by-step walkthrough for manual testing of all flows.
> Estimated time: 90-120 minutes.

---

## Setup

- **Browser:** Chrome (latest), also verify on Firefox & Safari
- **Viewports:** Desktop (1440px), Tablet (768px), Mobile (375px)
- **Start URL:** `http://localhost:3000`
- **Prep:** Have a LinkedIn PDF export ready for import testing
- **Accounts:** One new (for registration), one existing (for login)

---

## 1. Home Page

1. Open `/` in incognito
2. Verify hero headline "Land interviews, not rejections." with typing animation
3. Verify trust badges: "Free to start", "No credit card", "ATS-optimized"
4. Verify interactive resume preview auto-rotates between templates (Modern, Classic, Creative)
5. Scroll down — confirm stats section animates on scroll (22 templates, 15+ ATS, < 5 min, Live)
6. Verify 4 key benefits render with icons (PDF Export, AI Optimization, Templates, Preview)
7. Verify "How It Works" shows 3 steps
8. Verify featured templates section shows 3 templates (Adaptive, Modern, Timeline)
9. Click "Create Your Resume" → should redirect to `/register`
10. Go back, click "View All Templates" → should go to `/templates`
11. Expand/collapse at least 2 FAQ items — verify 7 total FAQs exist
12. Scroll to footer — verify all links are present and clickable
13. Verify "Trusted By" company logos section is visible

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 2. Registration

1. Go to `/register`
2. Click "Create account" with all fields empty → verify inline errors on First Name, Last Name, Email, Password
3. Enter invalid email (e.g. "test") → verify email error
4. Enter weak password "abc" → verify password strength shows Weak
5. Enter medium password "Abcdef1" → verify strength shows Medium
6. Enter strong password "MyPass1!" → verify strength shows Strong
7. Verify password requirements checklist shows: 8+ chars, uppercase, lowercase, number, special char
8. Fill all fields, leave Terms unchecked → click "Create account" → verify cannot submit
9. Check Terms, click "Create account"
10. Verify toast "Account created successfully!"
11. Verify redirect to `/onboarding`

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 3. Onboarding

### 3a. Start from Scratch

1. On Step 1, verify "Back" button is hidden
2. Verify all 6 popular role buttons: Software Engineer, Product Manager, Data Scientist, UX Designer, Marketing Manager, Business Analyst
3. Click "Software Engineer" → verify job title field is populated
4. Click "Next"
5. On Step 2, verify "Back" button is now visible
6. Verify template cards show: recommended badge, ATS score, preview thumbnail
7. For "Software Engineer" — verify Technical, Modern, Minimalist are recommended
8. Select a template → verify it highlights
9. Click "Create Resume" → verify redirect to `/editor/new?template={id}&jobTitle=Software Engineer`

### 3b. LinkedIn Import

1. Go back to `/onboarding`
2. Click "Upload LinkedIn PDF" → select a LinkedIn PDF
3. Verify ImportSummaryDialog shows extracted: name, experience, education, skills
4. Click confirm → verify redirect to `/editor/new?import=true`

### 3c. Skip

1. Go back to `/onboarding`
2. Click "Skip setup" → verify redirect to `/editor/new`

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 4. Resume Editor - Core Sections

### 4a. Personal Information

1. Verify section nav shows 8 sections with correct icons on left sidebar
2. Verify active section is highlighted, progress shows "0 of 8 sections completed"
3. Fill: First Name, Last Name, Email, Phone, Location
4. Verify preview panel updates live as you type each field
5. Leave Job Title empty → verify no validation error (optional)
6. Click "+ Website" → verify collapsible field expands → enter a URL
7. Expand LinkedIn field → enter URL → verify shown in preview
8. Click "Next"

### 4b. Work Experience

1. Click "Add Position"
2. Fill: Position Title, Company, Start Date
3. Check "I currently work here" → verify End Date field disappears, preview shows "Present"
4. Uncheck it → verify End Date reappears
5. Add 3 bullet points manually → verify each appears in preview
6. Add a second position with details
7. Drag to reorder positions → verify order changes in both form and preview
8. Expand/collapse a position card → verify toggle works
9. Delete one position → verify removed from preview
10. Click "Next"

### 4c. Education

1. Click "Add Education"
2. Fill: Institution, Degree, Field of Study, Start Date
3. Check "Currently Attending" → verify End Date disappears
4. Enter GPA → verify shown in preview
5. Add an achievement bullet point
6. Add second education entry → verify both in preview
7. Click "Next"

### 4d. Skills

1. Add 3 skills with different categories (Technical, Soft Skills, Tools)
2. Verify category dropdown shows: Technical, Soft Skills, Languages, Tools, Other
3. Set proficiency on one skill → verify dropdown shows: Beginner, Intermediate, Advanced, Expert
4. Remove one skill with X button → verify removed from preview
5. Click "Next"

### 4e. Projects

1. Click "Add Project"
2. Fill: Project Name, Description
3. Enter technologies "React, TypeScript, Node" → verify parsed
4. Enter Live URL and GitHub URL → verify in preview
5. Click "Next"

### 4f. Certifications

1. On "Certifications" tab: add a certification with Name, Issuer, Issue Date
2. Switch to "Courses" tab: add a course with Course Name, Platform
3. Verify both appear in preview
4. Click "Next"

### 4g. Languages

1. Add a language with Name and Proficiency
2. Verify proficiency options: Native, Fluent, Conversational, Basic
3. Click "Next"

### 4h. Additional

1. On "Extra-Curricular" tab: add an activity with Title, Organization, Start Date
2. Switch to "Hobbies" tab: add a hobby with Name
3. Switch to "Custom Sections" tab: add a custom entry with Section Title, Item Title
4. Click "Finish & Save"
5. Verify save completes → redirected to dashboard

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 5. Template Gallery

1. Go to `/templates`
2. Verify all 22 templates are displayed in a grid
3. **Filter by Layout:** select "Single-column" → verify only single-column templates shown
4. Clear filter → verify all 22 return
5. **Filter by Style:** select "ATS-Optimized" → verify high-ATS templates shown
6. **Filter by Photo:** select "With photo" → verify only photo-supporting templates
7. **Multi-select:** select "Modern" + "Creative" → verify both styles shown
8. Clear all filters
9. Hover over a template card → verify overlay with description, color swatches, badges, "Use Template"
10. Click a color swatch on hover → verify preview thumbnail updates
11. Click "Use Template" → verify navigates to editor with that template

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 6. Template Customization

1. In editor, open template selector dropdown in preview panel
2. Switch to a different template → verify preview updates immediately
3. Click "Customize" button
4. **Colors:** Click each preset (Ocean, Emerald, Sunset, Plum, Charcoal, Sand) → verify preview updates each time
5. Use custom primary color picker → set a custom color → verify preview
6. **Font:** Change font family to each option (Sans, Serif, Mono, Georgia, Garamond, Palatino) → verify
7. **Font size:** Slide from 10 to 18px → verify text scales in preview
8. **Line spacing:** Adjust slider → verify spacing changes
9. **Section spacing:** Adjust slider → verify gap between sections changes
10. Close customizer → verify customizations persist

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 7. AI Features

> Verify credit balance in dashboard header before starting. Note starting credits: ___

### 7a. Content Generation

1. In editor Personal Info → click "Generate Summary" → verify AI generates summary (2 credits)
2. Apply the generated summary → verify it appears in preview
3. In Work Experience → enter a bullet → click "Improve" → verify AI rewrites with stronger verbs (1 credit)
4. On same bullet → click "Quantify" → verify AI adds metrics/numbers (1 credit)
5. Click "Generate" bullets → verify 4 new bullets generated (2 credits)
6. In Skills → click "Suggest Skills" → verify AI suggests relevant skills (1 credit)
7. Click "Undo" on AI suggestions → verify suggestions removed

### 7b. ATS Analysis

1. From editor, click "AI Optimize" in control bar
2. Enter < 50 chars in job description → verify validation error
3. Paste a real job description (200+ chars), enter job title and company
4. Click "Analyze" → verify results show (3 credits):
   - ATS Score (0-100)
   - Missing keywords list
   - Suggestions with severity levels
   - Strengths section
   - Improvements section
   - Learnable skills with resources

### 7c. Tailor Resume

1. Click "Tailor" in control bar
2. Enter a job description → submit
3. Verify progress stages: Analyzing → Matching → Optimizing → Finalizing
4. Verify results: tailored summary, enhanced bullets, added keywords, change log
5. Click "Create tailored copy" → verify new resume created (5 credits)

### 7d. Interview Prep

1. From dashboard or editor, click "Interview Prep"
2. Select a resume and enter job description
3. Submit → verify questions generated (5 credits)
4. Verify question types: behavioral, technical, situational
5. Verify each question has: sample answer, key points, follow-up questions
6. Verify readiness score (0-100)
7. Toggle "Practice mode" → verify answers are hidden
8. Toggle difficulty levels (Easy, Medium, Hard) → verify filtering works

### 7e. Batch Enhancement

1. In editor, click "Enhance All" in control bar
2. Verify it enhances summary + all bullet points (5 credits)
3. Verify preview updates with enhanced content

### 7f. Cover Letter AI

1. From a resume card on dashboard, click "Cover Letter" AI tool
2. Fill: company name, position, job description
3. Click "Generate" → verify full cover letter generated (5 credits)
4. Verify content can be edited after generation

### 7g. Credits

1. Check credit balance → verify it decreased correctly after all actions above
2. Note total spent: ___ credits (expected: ~30 for all above)
3. If credits run out → try an AI feature → verify upgrade prompt shown
4. Verify credit balance shown in dashboard stats section

**Pass:** [ ] Yes [ ] No
**Notes:** Starting credits: ___ | Ending credits: ___

---

## 8. Export

### 8a. Resume Export

1. From editor More menu → "Export PDF" → verify PDF downloads
2. Open PDF → verify: content matches preview, text is selectable, A4 page size
3. Verify PDF filename format: `resume-{timestamp}.pdf`
4. With customized colors/fonts → export PDF → verify customizations appear in PDF
5. Create a long resume (multiple positions, education, etc.) → export PDF → verify clean page breaks
6. From dashboard card → click "DOCX" → verify DOCX downloads and is editable
7. From dashboard More menu → "Export JSON" → verify valid JSON with schema version

### 8b. Cover Letter Export

1. From cover letter card → click "PDF" → verify PDF downloads
2. Verify filename: `cover-letter-{company}-{timestamp}.pdf`

### 8c. Bulk Export

1. Go to Settings → "Export All Resumes" → verify JSON downloads with all resumes
2. "Export All Cover Letters" → verify JSON downloads

### 8d. Edge Cases

1. Create a brand new empty resume → try to export PDF → verify warning "Cannot export an empty resume"

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 9. Dashboard

### 9a. Layout & Stats

1. Go to `/dashboard`
2. Verify stats: Total Resumes (X/3), Cover Letters (X/3), AI Credits
3. Verify "Resumes" tab is active by default

### 9b. Resume Cards

1. Verify each card shows: name (truncated if long), template badge (color-coded), last updated date, readiness badge
2. Click "Edit" → verify editor opens with all saved data intact
3. Go back → click "Preview" → verify dialog at 60% scale with name + template + date → close
4. Click "PDF" → verify download starts
5. Click "DOCX" → verify download starts
6. Open More menu → "Export JSON" → verify download
7. Open More menu → "Delete" → click "Cancel" → verify resume still exists
8. Open More menu → "Delete" → click "Delete" → verify loading state → resume removed from list

### 9c. Cover Letters Tab

1. Switch to "Cover Letters" tab
2. If empty → verify EmptyState with "Create Cover Letter" CTA
3. If has data → verify cards with: name, template badge, completion status (X/4 or "Complete"), company name

### 9d. Resume Grouping

1. If a master resume has tailored versions → verify collapsible section with count badge
2. Expand → verify tailored versions listed

### 9e. Plan Limits

1. With 3 resumes (free limit) → click "Create Resume" → verify plan limit dialog
2. Verify dialog shows "Upgrade plan" option → click → verify navigates to `/pricing#pro`

### 9f. Optimize Dialog

1. Click "Optimize for Job" button
2. Verify form: job description textarea, job title input, company input, resume selector
3. Fill and click "Analyze" → verify results view with ATS score + suggestions
4. Click through to wizard view → verify step-by-step improvement guide

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 10. Cover Letter Builder

### 10a. Full Manual Flow

1. Go to `/cover-letter`
2. **Section 1 - Job Details:** Fill Job Title (required), leave Reference and Date empty (optional)
3. **Section 2 - Recipient:** Fill Company Name (required), optionally add Hiring Manager name/title
4. **Section 3 - Your Info:** Fill Full Name and Email (required)
5. Click "Sync from Resume" → verify data pulled from a linked resume
6. **Section 4 - Content:**
   - Select salutation → verify options: Dear Hiring Manager, Dear Recruiting Team, To Whom It May Concern, Dear [Name]
   - Select "Dear [Name]" → enter custom name → verify preview updates
   - Write Opening paragraph (required)
   - Add 2 Body paragraphs
   - Write Closing paragraph (required)
   - Select Sign Off → verify options: Sincerely, Best regards, Kind regards, Respectfully, Thank you
7. Verify live preview renders complete letter with all sections
8. Switch template between Modern and Classic → verify style changes

### 10b. Export

1. Export as PDF → verify download with filename `cover-letter-{company}-{timestamp}.pdf`
2. Return to dashboard → verify card shows "Complete" status

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 11. Public Sharing

### 11a. Username Setup

1. On a resume card, click "Share"
2. If no username → verify username creation form
3. Try "ab" (2 chars) → verify error
4. Try "MyName" → verify auto-lowercase or error
5. Enter valid username "john-doe-123" → check availability → claim it

### 11b. Publishing & Privacy

1. In Share dialog Settings tab → toggle "Publish" on
2. Optionally edit custom slug
3. Verify URL format: `resumeforge.app/u/{username}/{slug}`
4. Go to Share tab → click "Copy link" → verify copied to clipboard
5. Verify social share buttons: Twitter, LinkedIn, Facebook, Email
6. Verify QR code displayed → click download QR → verify image downloads
7. Toggle "Hide Email" and "Hide Phone"
8. Open public link in incognito → verify resume displays, email/phone hidden
9. Verify "Download PDF" button works on public page
10. Verify "Build Your Resume Free" CTA shown on public page

### 11c. Unpublish

1. Toggle Publish off → refresh public URL → verify 404/unavailable

### 11d. Plan Limits

1. With 1 published resume (free limit) → try to publish another → verify limit dialog

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 12. Settings

1. Go to `/settings`
2. **Profile:** Verify email displayed but not editable
3. Change display name → Save → verify success toast
4. **Appearance:** Select Dark → verify entire app switches to dark theme
5. Navigate to dashboard and editor in dark mode → verify all pages render correctly
6. Select Light → verify switch back
7. Select System → verify follows OS preference
8. Refresh page → verify theme persisted
9. **Data Export:** Verify document counts shown → click "Export All Resumes" → verify JSON
10. **Danger Zone:** Click "Export Your Data" → verify backup downloads
11. _(Optional/Destructive)_ Click "Delete Account" → verify confirmation dialog → verify re-authentication required

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 13. Keyboard Shortcuts

### 13a. Global

1. Press `Cmd+K` (or `Ctrl+K`) → verify command palette opens
2. Type "ats" → verify filtered to ATS-related commands
3. Press `Escape` → verify palette closes
4. Press `Cmd+S` in editor → verify save triggers (check save indicator text)
5. Make a change → `Cmd+Z` → verify undo
6. `Cmd+Shift+Z` → verify redo

### 13b. Editor

1. Press `Cmd+P` in editor → verify PDF export triggers
2. With focus outside any input → press `Enter` → verify next section
3. Press `Backspace` (outside input) → verify previous section

### 13c. Command Palette Commands

1. Open palette → select "ATS Analysis" → verify dialog opens
2. Open palette → select "Enhance All" → verify batch enhancement starts
3. Open palette → select "Export PDF" → verify export

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 14. UI & UX Polish

### 14a. Auto-Save Indicator

1. In editor, make a change → verify status shows "Saving to cloud..."
2. Wait → verify status changes to "Saved just now"
3. Wait 30+ seconds → verify shows "Saved 30s ago"
4. Wait longer → verify shows "Saved Xm ago"

### 14b. Recovery System

1. In editor, make changes, then hard-refresh the page (Cmd+Shift+R)
2. Verify RecoveryPrompt dialog appears with last modified timestamp
3. Click "Recover Draft" → verify unsaved data restored
4. Repeat: make changes, hard-refresh, this time click "Discard" → verify fresh data loaded

### 14c. Navigate Away Warning

1. Make unsaved changes in editor → click browser back button
2. Verify warning dialog asks to save or discard

### 14d. Loading States

1. Refresh `/dashboard` → verify loading skeleton appears before data loads
2. Navigate to `/editor/{id}` → verify loading state while resume loads
3. Trigger any AI action → verify loading spinner/progress during generation

### 14e. Toast Notifications

1. Save a resume → verify success toast appears
2. Export PDF → verify success toast
3. Delete a resume → verify confirmation + success toast
4. Trigger an error (e.g. AI with no credits) → verify error toast

### 14f. Theme Consistency

1. Switch to Dark mode in Settings
2. Visit each page: Home, Dashboard, Editor, Templates, Cover Letter, Settings, Pricing
3. Verify no white backgrounds, no unreadable text, no broken styling on any page
4. Switch back to Light mode → same check

### 14g. Empty States

1. New user with no resumes → dashboard shows OnboardingChecklist
2. No cover letters → Cover Letters tab shows EmptyState with CTA
3. Verify empty states have clear call-to-action buttons

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 15. Mobile Testing

> Resize browser to 375px width or use DevTools device emulation (iPhone SE)

### 15a. Home & Navigation

1. Open `/` → verify single-column layout, no horizontal overflow
2. Verify hamburger menu for navigation
3. Tap through navigation links → verify all work

### 15b. Mobile Editor

1. Navigate to editor → verify bottom bar appears (Back, Status, Preview, Next)
2. Tap "Preview" → verify full-screen preview overlay
3. In preview: pinch to zoom (if touch device) → verify zoom works
4. Tap close → verify returns to form
5. Fill a form field → verify keyboard doesn't break layout or hide inputs
6. Navigate sections using bottom bar arrows → verify all 8 sections accessible
7. Tap "Status" → verify shows issues or ready state

### 15c. Mobile Dashboard & Other Pages

1. Go to dashboard → verify cards stack vertically, all actions accessible
2. Visit `/templates` → verify grid adjusts, filters via bottom sheet
3. Visit `/settings` → verify all sections usable

### 15d. Tablet (768px)

1. Set viewport to 768px → verify adapted layout (not desktop, not fully mobile)

### 15e. Large Desktop (1440px)

1. Set viewport to 1440px → verify full layout with proper spacing, no stretched elements

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 16. Auth Edge Cases

1. Open `/dashboard` in incognito (not logged in) → verify redirect to `/login`
2. Verify toast "Please log in to access dashboard"
3. Open `/editor/new` not logged in → verify redirect to `/login`
4. Open `/settings` not logged in → verify redirect to `/login`
5. Login with wrong password → verify error "Invalid email or password"
6. Click "Forgot password?" → verify redirect to `/forgot-password`
7. Enter email → submit → verify confirmation screen
8. Login with valid credentials → verify redirect to dashboard
9. Verify session persists: close tab, reopen app → still logged in
10. Logout → verify redirect to home
11. Try to access `/dashboard` again → verify redirect to `/login`

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 17. Error Handling & Validation

### 17a. Form Validation

1. In editor Personal Info → leave all fields empty → click "Next"
2. Verify validation banner shows error count and field-level inline errors
3. Click "Fix Now" → verify scrolls to first error field
4. Click "Continue Anyway" → verify proceeds to next section
5. Verify optional sections (Projects, Languages, etc.) don't block progression

### 17b. Plan Limits

1. Free user with 3 resumes → try to create 4th → verify limit dialog with upgrade option
2. Free user with 0 AI credits → try AI feature → verify "out of credits" message

### 17c. Export Errors

1. Try to export an empty resume → verify warning "Cannot export an empty resume"

### 17d. Network (if testable)

1. Disable network in DevTools → make changes → verify offline/error indicator
2. Re-enable → verify sync resumes

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 18. Accessibility Basics

1. Navigate to editor → press Tab repeatedly → verify focus moves in logical order
2. Verify skip link: Tab once from top of page → verify "Skip to main content" link
3. Open any modal/dialog → Tab → verify focus is trapped inside
4. Press Escape → verify modal closes and focus returns to trigger element
5. Check icon-only buttons (e.g. delete, expand) → verify they have visible focus rings
6. Submit an invalid form → verify error is announced (check with screen reader or inspect `aria-live`)
7. On mobile (375px) → verify all touch targets are at least 44px

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## 19. Pricing Page

1. Go to `/pricing`
2. Verify Free plan shows: 3 resumes, 3 cover letters, 30 AI credits/month, all templates, PDF/DOCX export, 1 public link
3. Verify Premium plan shows: Unlimited everything, €12/month, "Coming Soon" indicator
4. Verify credit cost table: Quick (1), Medium (2), Heavy (3), Intensive (5)

**Pass:** [ ] Yes [ ] No
**Notes:**

---

## Summary

| # | Test | Pass | Fail | Notes |
|---|------|------|------|-------|
| 1 | Home Page | | | |
| 2 | Registration | | | |
| 3 | Onboarding | | | |
| 4 | Editor - All Sections | | | |
| 5 | Template Gallery | | | |
| 6 | Template Customization | | | |
| 7 | AI Features | | | |
| 8 | Export | | | |
| 9 | Dashboard | | | |
| 10 | Cover Letter Builder | | | |
| 11 | Public Sharing | | | |
| 12 | Settings | | | |
| 13 | Keyboard Shortcuts | | | |
| 14 | UI & UX Polish | | | |
| 15 | Mobile Testing | | | |
| 16 | Auth Edge Cases | | | |
| 17 | Error Handling | | | |
| 18 | Accessibility | | | |
| 19 | Pricing Page | | | |

**Tested by:** _______________
**Date:** _______________
**Browser/OS:** _______________
**Build/Commit:** _______________
**AI Credits Start/End:** ___ / ___
