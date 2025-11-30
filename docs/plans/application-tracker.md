"# Application Tracker Implementation Plan

Goal: extend the dashboard so users can log job applications, track status, and link each application to specific resume/cover-letter variants.

## 1. Product Requirements

- Users can create “applications” with fields: job title, company, job link, deadline, compensation notes, recruiter contact, and notes.
- Each application references the resume and cover letter used (saved document IDs) and stores the exact export timestamp for auditability.
- Track statuses (`Prospecting`, `Applied`, `Phone Screen`, `Interview`, `Offer`, `Rejected`, `Hired`) with timeline/history.
- Provide reminders (due dates, follow-up dates) and dashboards summarizing progress (e.g., pipeline counts, success rate).
- Allow uploading job descriptions (text/file) for later optimization reuse.

## 2. Data Model & Storage

- **New collection/table**: `applications` keyed by user ID.  
  ```ts
  interface JobApplication {
    id: string;
    userId: string;
    jobTitle: string;
    company: string;
    jobUrl?: string;
    location?: string;
    source?: "LinkedIn" | "Indeed" | "Referral" | "Other";
    status: ApplicationStatus;
    statusHistory: Array<{ status: ApplicationStatus; timestamp: string; note?: string }>;
    resumeId?: string;
    coverLetterId?: string;
    resumeSnapshot?: ResumeData;
    coverLetterSnapshot?: CoverLetterData;
    jobDescription?: string;
    attachments?: Array<{ id: string; name: string; url: string }>;
    appliedAt?: string;
    interviewDates?: string[];
    followUpDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
  ```
- Firestore integration via new service module `lib/services/applications.ts` (CRUD, batch updates, status logs).
- Consider `resumeSnapshot`/`coverLetterSnapshot` to freeze content at submission time, ensuring later edits don’t change historical submissions.

## 3. API & Hooks

- `useApplications(userId)` hook mirroring `useSavedResumes`, providing list, loading state, add/update/delete functions.
- Mutations:
  - `createApplication(payload)` – set initial status history. Optional resume/coverLetter snapshot retrieval.
  - `updateApplication(id, updates)` – handle general field edits.
  - `logApplicationStatus(id, status, note?)` – append to history + update `status`.
  - `deleteApplication(id)`.
- Optional: `useApplicationReminder` hook to surface upcoming deadlines on dashboard.

## 4. Dashboard UI Extensions

1. **Dashboard header metrics** – add cards summarizing number of applications by status (“Active Interviews”, “Applied”, “Offers”).
2. **Tabs** – introduce third tab `Applications` alongside Resumes and Cover Letters.
3. **Application list/grid** – display cards with status pills, job/company info, resume/cover letter badges, and CTA buttons:
   - View details (modal or dedicated page).
   - Update status (dropdown).
   - Open associated resume/letter, re-run optimization, or duplicate application.
4. **Application detail drawer/modal** – show timeline, notes, attachments, job description, and quick actions (schedule follow-up, open job link).
5. **Creation flow** – “Log application” button launching modal with multi-step form:
   - Step 1: Job info (title, company, job URL, salary).
   - Step 2: Documents (choose from saved resumes/letters, snapshot preview).
   - Step 3: Status/notes/reminders.

## 5. Integration with Existing Features

- **Optimize dialog** – allow selecting a saved application to autofill job description/role when optimizing a resume.
- **Resume/Cover letter cards** – show badges indicating how many applications each document is linked to; deep link to filtered application view.
- **Notifications/reminders** – re-use `toast` and future scheduling service to remind users of follow-up dates.

## 6. Implementation Tasks

1. **Data layer**
   - [ ] Create `lib/services/applications.ts` with Firestore CRUD + snapshot helpers.
   - [ ] Add hooks `useApplications`, `useApplicationActions`.
   - [ ] Update Firestore security rules (if applicable) to include new collection.
2. **Dashboard UI**
   - [ ] Extend `DashboardHeader` to accept application stats.
   - [ ] Add `Applications` tab with list component (`ApplicationCard`, `ApplicationList`).
   - [ ] Build `ApplicationDetail` modal/drawer and `ApplicationForm` for creation/editing.
3. **Document linking**
   - [ ] Provide UI to select resume/cover letter; fetch and store snapshots.
   - [ ] Update resume/cover letter hook outputs to expose `saveSnapshot` utilities.
4. **Reminders & integrations**
   - [ ] Basic reminder logic (compare `followUpDate` with today, show banner/toast).
   - [ ] Hook optimize dialog to applications for easy re-optimization.
5. **QA & launch**
   - [ ] Seed dev data, test flows end-to-end.
   - [ ] Update docs (`docs/product-vision.md`, marketing copy).
   - [ ] Instrument analytics events (application created, status changed, reminder triggered).

## 7. Timeline (Estimate)

| Phase | Duration | Notes |
| --- | --- | --- |
| Data layer & hooks | 1 week | Firestore + hooks scaffolding |
| Dashboard UI (list/detail/form) | 1.5 weeks | Includes responsive layouts |
| Document linking & snapshots | 0.5 week | Reuse existing export helpers |
| Reminders & integrations | 0.5 week | Basic follow-up banner |
| QA, polishing, docs | 0.5 week | Bug fixes + content updates |

Total: ~4 weeks for a polished V1.*
