"# ResumeForge Competitive Product Vision

This document captures the current surface area of ResumeForge and outlines high-impact additions that can help us stand out in a crowded resume/cover-letter market.

## Current Feature Set

- **ATS-friendly resume builder** – Sectioned editor with validation hooks, sortable entries, and customizable templates, plus PDF export via @react-pdf/renderer.
- **Cover letter workspace** – Dedicated flow mirroring the resume editor (sections, templates, JSON/PDF export, local autosave).
- **Data persistence & sync** – Firestore + localStorage drafts, saved document cards on the dashboard, and per-user template customization.
- **Content management** – Hooks for saved cover letters/resumes, template galleries, and interface components such as SectionNavigation, MobileSectionTabs, and preview panes.
- **Upcoming AI placeholders** – Hooks/components already stubbed for AI assistants, scoring, and smart tips.

## Competitive Differentiators To Build

### 1. AI-assisted writing & optimization

- Guided resume refinement: analyze a pasted job description and automatically tailor bullet points, skills ordering, and tone guidance.
- Cover letter co-pilot: generate first drafts from resume data + job posting context, while keeping human-in-the-loop editing.
- Impact meter: scan bullets for quantifiable results, verbs, and ATS keywords, surfacing suggestions inline (e.g., “add metrics”, “mention cloud stack”).

### 2. Job-specific workflows

- Application tracker in the dashboard storing postings, deadlines, links, and which resume/cover-letter version was used.
- Keyword gap analysis: compare each saved resume against a job description and highlight missing skills/phrases.
- Interview prep cards tied to saved applications (company research tips, behavioral question suggestions).

### 3. Collaboration & review

- Shareable review links with inline commenting so mentors/coaches can provide feedback without full accounts.
- Version history + diffing between iterations to show exactly what changed across drafts.
- Team/bootcamp workspaces where administrators can monitor student progress.

### 4. Analytics & guidance

- “Completion score” that factors depth, quantified metrics, layout balance, and ATS heuristics, not just required fields.
- Visual heatmap overlay in the preview panel showing how ATS parsers or recruiters scan the document (above-the-fold emphasis).
- Insight dashboards summarizing user behavior (e.g., sections left blank most often) to drive onboarding nudges or templates.

### 5. Ecosystem extensions

- LinkedIn/GitHub importers that pre-fill experience/skills from existing profiles.
- Lightweight portfolio/landing page generator backed by the same resume data, enabling one-click sharing beyond PDFs.
- Public API or webhooks so recruiting agencies, coding bootcamps, or HR tools can slot ResumeForge into their pipelines.

## Next Steps

1. **Scope AI-assisted MVP** – leverage existing hooks/validation to insert AI rewrite endpoints, starting with job-description tailoring.
2. **Design the application tracker** – extend dashboard data models to store job postings, status, and document variants.
3. **Prototype collaboration** – experiment with signed URLs + Firestore subcollections for comments before hardening permissions.

Delivering these layers on top of our solid editor foundation positions ResumeForge as more than “just another template site”—it becomes a career acceleration workspace that blends intelligent guidance, collaboration, and measurable outcomes."
