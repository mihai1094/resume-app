# Add Resume Section

Guide for adding a new section to the resume builder.

## Arguments

- `$ARGUMENTS` - The section name (e.g., "Awards", "Publications", "Volunteer")

## Steps (based on CLAUDE.md patterns)

1. Add type definition to `lib/types/resume.ts`
2. Add field to `ResumeData` interface
3. Update `useResume()` hook with add/update/remove operations
4. Create form component in `components/resume/forms/`
5. Add section to `sections` array in `resume-editor.tsx`
6. Update all template components (modern, classic, executive) to render the new section
7. Update PDF templates in `templates/pdf/`
8. Update validation in `lib/utils/resume.ts`

Ask for confirmation before implementing each step.
