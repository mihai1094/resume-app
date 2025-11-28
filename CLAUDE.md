# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 resume builder application with TypeScript, Tailwind CSS, and shadcn/ui components. The app allows users to create, edit, and export professional resumes using multiple templates. Data is persisted using localStorage with auto-save functionality.

## Development Commands

### Running the Application
```bash
# Development server (binds to 0.0.0.0 for network access)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

### Working with shadcn/ui Components
```bash
# Add new shadcn/ui components
npx shadcn@latest add [component-name]
```

## Architecture

### Application Structure

**Next.js App Router** (`app/`)
- Uses Next.js 14 App Router architecture
- Pages: `/` (home), `/create` (resume editor), `/preview` (preview page), `/dashboard` (saved resumes)
- SEO optimization via `sitemap.ts` and `robots.ts`
- Global styles in `app/globals.css`

**State Management Pattern**
- Custom hooks-based state management (no external state library)
- Primary hook: `useResume()` - manages all resume data and CRUD operations
- Auto-save pattern via `useLocalStorage()` hook with debouncing (500ms)
- Session-based resume loading via sessionStorage for "load resume" flow

**Data Flow**
1. User interactions → Form components
2. Form components → `useResume()` hook operations
3. `useResume()` updates state → triggers `useLocalStorage()` auto-save
4. `resumeData` changes → live preview update via template components

### Core Directories

**`lib/`** - Business logic and utilities
- `lib/types/resume.ts` - TypeScript interfaces for all resume data (PersonalInfo, WorkExperience, Education, etc.)
- `lib/services/` - Service layer for storage, import/export, and resume operations
- `lib/utils/` - Utility functions including `cn()` for className merging
- `lib/constants/` - Skills, languages, templates configuration
- `lib/seo/` - SEO metadata and structured data generation

**`hooks/`** - Custom React hooks
- `use-resume.ts` - Main resume state management (add/update/remove operations)
- `use-local-storage.ts` - Auto-save with debouncing and "save status" UI
- `use-user.ts` - Simple user account management (localStorage-based)
- `use-saved-resumes.ts` - Manage multiple saved resumes per user
- `use-drag-and-drop.ts` - Reordering functionality for work experience and education

**`components/`** - React components
- `components/ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `components/resume/` - Resume-specific components
  - `resume-editor.tsx` - Main editor component with section navigation and preview
  - `forms/` - Form components for each resume section
  - `templates/` - Resume template components (Modern, Classic, Executive)
    - HTML templates for live preview
    - `templates/pdf/` - @react-pdf/renderer templates for PDF export

**`config/`** - Configuration files
- `config/storage.ts` - localStorage key definitions
- `config/app.ts` - App-wide configuration

### Key Architectural Patterns

**Resume Data Types**
- Centralized in `lib/types/resume.ts`
- All entities have an `id` field (generated via `generateId()`)
- Support for optional sections: projects, languages, certifications, courses, hobbies, extraCurricular

**Template System**
- Two separate template implementations:
  1. HTML templates for live preview (React components)
  2. PDF templates using @react-pdf/renderer for export
- Template selection via `templateId` prop
- Templates: modern, classic, executive

**Export Functionality**
- PDF export via `@react-pdf/renderer` (professional quality)
- JSON export for data backup/import
- Service: `lib/services/export.ts`
- DOCX export planned but not yet implemented

**Storage Architecture**
- Primary: `StorageService` class in `lib/services/storage.ts`
- Auto-save: Debounced localStorage writes (500ms delay)
- Multi-resume support: Each user can save multiple resumes with metadata
- Resume loading: sessionStorage for cross-page data transfer

## Important Patterns

### Adding New Resume Sections

When adding a new section (e.g., "Projects"), you need to:
1. Add type definition to `lib/types/resume.ts`
2. Add field to `ResumeData` interface
3. Update `useResume()` hook with add/update/remove operations
4. Create form component in `components/resume/forms/`
5. Add section to `sections` array in `resume-editor.tsx`
6. Update all template components to render the new section
7. Update validation in `lib/utils/resume.ts`

### Form Component Pattern

All form components follow this pattern:
```tsx
interface FormProps {
  data: EntityType[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<EntityType>) => void;
  onRemove: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void; // optional
}
```

### Auto-save Pattern

The application uses debounced auto-save:
- Changes to `resumeData` trigger useEffect in `resume-editor.tsx`
- `useLocalStorage` hook debounces writes (500ms)
- UI displays save status: "Saving...", "Saved [time]", "Failed to save"

## Path Aliases

TypeScript path alias `@/*` maps to project root:
```typescript
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
```

## Styling Guidelines

- **Tailwind CSS** for all styling (utility-first)
- **CSS variables** for theming (defined in `app/globals.css`)
- **shadcn/ui** base color: slate
- **Responsive design**: Mobile-first with lg (1024px) breakpoint for desktop
- **Mobile UX**: Toggle between form and preview; desktop shows side-by-side

## Important Notes

### localStorage Constraints
- SSR-safe checks: `typeof window !== "undefined"`
- All localStorage operations wrapped in try-catch
- No authentication/backend - all data is client-side

### Resume Editor Behavior
- Desktop (≥1024px): Shows form + preview side-by-side
- Mobile (<1024px): Toggle between form and preview
- Collapsible sidebar navigation on desktop
- Progress tracking shows completion per section

### Date Handling
- Uses `date-fns` library for date operations
- Custom `MonthPicker` component for month/year selection
- "Current" checkbox for ongoing work/education

### PDF Export
- Uses `@react-pdf/renderer` (not jspdf/html2canvas)
- PDF templates are separate React components in `templates/pdf/`
- Element-based PDF export is deprecated

## Documentation

Comprehensive documentation in `docs/`:
- `docs/seo/` - SEO implementation guides
- `docs/roadmap/` - Feature roadmap and planning
- `docs/development/` - Architecture decisions and refactoring notes

See `docs/README.md` for full documentation structure.
