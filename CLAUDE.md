# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern Next.js resume builder application with AI-powered features, Firebase backend, and professional PDF export. Users can create, customize, and optimize resumes using multiple templates with real-time AI suggestions.

**Tech Stack:**
- **Next.js 16** with App Router
- **React 19** with TypeScript (strict mode)
- **Firebase** (Authentication + Firestore)
- **AI Integration** - Google Gemini 2.5 Flash for content generation
- **Styling** - Tailwind CSS + shadcn/ui components
- **PDF Export** - @react-pdf/renderer
- **Testing** - Vitest + React Testing Library (86 test files)

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

# Testing
npm test
```

### Working with shadcn/ui Components
```bash
# Add new shadcn/ui components
npx shadcn@latest add [component-name]
```

## Architecture

### Application Structure

**Next.js App Router** (`app/`)
- Uses Next.js 16 App Router architecture
- Pages: `/` (home), `/editor/new` (create new resume), `/editor/[id]` (edit resume), `/preview` (preview page), `/dashboard` (saved resumes)
- API Routes: `/api/ai/*` (AI features), `/api/auth/*` (authentication)
- SEO optimization via `sitemap.ts` and `robots.ts`
- Global styles in `app/globals.css`

**State Management Pattern**
- Custom hooks-based state management (no external state library)
- Primary hook: `useResume()` - manages all resume data and CRUD operations
- Firebase integration via `useUser()` hook
- Real-time sync with Firestore

**Data Flow**
1. User interactions → Form components
2. Form components → `useResume()` hook operations
3. `useResume()` updates state → triggers Firestore save
4. `resumeData` changes → live preview update via template components

### Core Directories

**`lib/`** - Business logic and utilities
- `lib/types/` - TypeScript interfaces and type definitions
  - `resume.ts` - Resume data structures
  - `errors.ts` - **NEW** Centralized error types
- `lib/services/` - Service layer
  - `firestore.ts` - Firebase Firestore operations
  - `logger.ts` - Structured logging service
  - `export.ts` - PDF/DOCX export
- `lib/api/` - **NEW** API utilities
  - `error-handler.ts` - Centralized error handling
  - `auth-fetch.ts` - Authenticated API requests
- `lib/ai/` - AI content generation services
- `lib/utils/` - Utility functions including `cn()` for className merging
- `lib/constants/` - Skills, languages, templates configuration

**`hooks/`** - Custom React hooks
- `use-resume.ts` - Main resume state management (add/update/remove operations)
- `use-user.ts` - Firebase authentication and user management
- `use-saved-resumes.ts` - Manage multiple saved resumes per user
- `use-drag-and-drop.ts` - Reordering functionality for work experience and education

**`components/`** - React components
- `components/ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `components/resume/` - Resume-specific components
  - `resume-editor.tsx` - Main editor component with section navigation and preview
  - `forms/` - Form components for each resume section
  - `templates/` - Resume template components (Modern, Classic, Executive, etc.)
    - HTML templates for live preview
    - `templates/pdf/` - @react-pdf/renderer templates for PDF export

**`app/api/`** - API Routes
- `app/api/ai/` - AI-powered features (bullet generation, ATS analysis, etc.)
- `app/api/auth/` - Authentication endpoints
- All routes use centralized error handling

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
- Templates: modern, classic, executive, creative, cascade, cubic, adaptive, timeline, ivy

**Export Functionality**
- PDF export via `@react-pdf/renderer` (professional quality)
- JSON export for data backup/import
- Service: `lib/services/export.ts`
- DOCX export via `docx` library (fully implemented)

**Storage Architecture**
- Primary: Firebase Firestore
- Collections: `users`, `resumes`, `cover-letters`, `ai-usage`
- Real-time sync and offline support
- Service: `lib/services/firestore.ts`

## Recent Improvements (January 2026)

### Centralized Error Handling ✅
- **Error Types** (`lib/types/errors.ts`):
  - `AppError` - Base error class
  - `ApiError` - HTTP errors with status codes
  - `AuthError` - Authentication errors
  - `ValidationError` - Input validation with field details
  - `DatabaseError` - Firestore errors
  - `AIServiceError` - AI service errors
  - `RateLimitError`, `CreditError` - Quota errors

- **API Error Handler** (`lib/api/error-handler.ts`):
  ```typescript
  import { handleApiError, validationError } from '@/lib/api/error-handler';
  
  try {
    // API logic
  } catch (error) {
    return handleApiError(error, { module: 'AI', action: 'generate-bullets' });
  }
  ```

### Logging Infrastructure ✅
- **Logger Service** (`lib/services/logger.ts`):
  ```typescript
  import { aiLogger, authLogger, firestoreLogger } from '@/lib/services/logger';
  
  aiLogger.info('Generated content', { action: 'generate-bullets', fromCache: true });
  aiLogger.error('Generation failed', error, { action: 'generate-bullets' });
  ```
- Pre-configured loggers: `aiLogger`, `authLogger`, `storageLogger`, `firestoreLogger`
- Environment-aware (verbose in dev, silent in production)

### Code Quality ✅
- **ESLint Rules**: No `console.log` in production (use logger instead)
- **Type Safety**: Strict TypeScript mode, minimal `any` usage
- **Test Coverage**: 86 test files across lib, hooks, components
- **Error Responses**: Consistent API error format with proper status codes

## AI Features Architecture

### AI Services (`lib/ai/`)
All AI features use Google Gemini 2.5 Flash with caching for performance:

**Content Generation:**
- `bullets.ts` - Generate/improve resume bullet points
- `summary.ts` - Generate professional summaries
- `skills.ts` - Suggest relevant skills
- `cover-letter.ts` - Generate cover letters
- `interview-prep.ts` - Generate interview questions
- `linkedin.ts` - Optimize LinkedIn profiles
- `tailor.ts` - Tailor resume to job description
- `score.ts` - Score resume quality

**Analysis:**
- `ats.ts` - ATS compatibility analysis
- `writing.ts` - Writing quality analysis
- `quantifier.ts` - Quantify achievements

**Utilities:**
- `cache.ts` - LRU cache for AI responses (reduces costs)
- `shared.ts` - Shared AI utilities and model configuration
- `telemetry.ts` - AI usage tracking

See [`.claude/AI_FEATURES.md`](./.claude/AI_FEATURES.md) for detailed AI features documentation.

### AI API Routes (`app/api/ai/`)
All routes follow this pattern:
1. Authentication check (`verifyAuth`)
2. Credit check and deduction (`checkCreditsForOperation`)
3. Input validation and sanitization
4. Cache check (if applicable)
5. AI generation
6. Consistent error handling

Example:
```typescript
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;
  
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "feature-name");
  if (!creditCheck.success) return creditCheck.response;
  
  try {
    // Validate and sanitize input
    // Check cache
    // Generate with AI
    // Return response
  } catch (error) {
    return handleApiError(error, { module: 'AI', action: 'feature-name' });
  }
}
```

## Best Practices

### Error Handling
✅ **DO:**
- Use centralized error types from `lib/types/errors.ts`
- Use `handleApiError()` in API routes
- Use logger service instead of `console.log`
- Include context in error logs

❌ **DON'T:**
- Use `console.log` in production code
- Create custom error handling per route
- Return inconsistent error response formats
- Swallow errors without logging

### Type Safety
✅ **DO:**
- Use TypeScript strict mode
- Define interfaces for all data structures
- Use type guards for runtime validation
- Leverage IntelliSense with proper types

❌ **DON'T:**
- Use `any` type (use `unknown` if needed)
- Skip type definitions for complex objects
- Ignore TypeScript errors

### Testing
✅ **DO:**
- Write tests for new features
- Mock external services (Firebase, AI)
- Test error cases
- Use descriptive test names

❌ **DON'T:**
- Skip tests for critical paths
- Test implementation details
- Leave tests commented out

### AI Integration
✅ **DO:**
- Use caching for repeated requests
- Validate and sanitize all inputs
- Handle quota/timeout errors gracefully
- Log AI usage for monitoring

❌ **DON'T:**
- Make uncached AI calls for common queries
- Trust AI output without validation
- Expose API keys in client code
- Skip error handling for AI calls

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

### Git & Code Commits
**IMPORTANT**: Do NOT push code to the repository unless explicitly told to do so. Only commit and push when you receive an explicit instruction like "push this to GitHub" or "commit your changes". Always ask for permission before pushing.

### Firebase/Firestore
- All database operations in `lib/services/firestore.ts`
- Error handling uses `DatabaseError` type
- Proper error logging with context
- Security rules enforce user-level access control

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

## UX/A11y Guardrails
- Keep skip links on pages; modals/overlays trap focus, close on Escape, and return focus.
- Icon-only/toggle controls need `aria-label` and `aria-pressed`; touch targets ≥44px on mobile.
- Validation: inline errors near fields plus `aria-live` summary; optional sections shouldn't block progression.
- Save/export status must be screen-reader friendly; block empty resume export and handle missing templates gracefully.
- See `docs/ux/a11y-guardrails.md` and `docs/development/preflight-checklist.md` for patterns and release checks.

## Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Type Errors:**
```bash
# Check TypeScript
npx tsc --noEmit
```

**Lint Errors:**
```bash
# Auto-fix linting issues
npm run lint -- --fix
```

**Test Failures:**
```bash
# Run tests in watch mode
npm test
# Run specific test file
npm test -- path/to/test.ts
```

**Firebase Connection:**
- Check `.env.local` has all required Firebase config
- Verify Firebase project settings match environment
- Check Firestore security rules

**AI Features Not Working:**
- Verify `GEMINI_API_KEY` in `.env.local`
- Check credit balance in Firestore
- Review rate limiting settings
- Check AI service logs

## Code Review Checklist

Before submitting changes:
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] No `console.log` statements (use logger)
- [ ] Error handling uses centralized utilities
- [ ] New features have tests
- [ ] API routes have proper auth and validation
- [ ] Types are properly defined
- [ ] Documentation is updated

## Documentation

Comprehensive documentation in `docs/`:
- `docs/seo/` - SEO implementation guides
- `docs/roadmap/` - Feature roadmap and planning
- `docs/development/` - Architecture decisions and refactoring notes

See `docs/README.md` for full documentation structure.

## Context7 MCP

Always use Context7 when generating code, setup/configuration steps, or looking up library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and fetch current documentation without requiring explicit requests.

## Custom Slash Commands

This project includes custom slash commands in `.claude/commands/`:

- `/build` - Run production build and report errors
- `/lint` - Run linting and fix issues
- `/test-component <name>` - Test a specific component
- `/add-section <name>` - Guide for adding a new resume section
- `/review-pr <number>` - Review a pull request
- `/preflight` - Run preflight checks before PR/deploy
- `/debug <issue>` - Help debug an issue

## Quick Reference

### Key Files to Know
- `components/resume/resume-editor.tsx` - Main editor (start here for editor changes)
- `hooks/use-resume.ts` - Resume state management
- `lib/types/resume.ts` - All TypeScript interfaces
- `lib/types/errors.ts` - **NEW** Error type definitions
- `lib/api/error-handler.ts` - **NEW** API error handling
- `lib/services/firestore.ts` - Database operations
- `lib/services/logger.ts` - Logging service
- `components/resume/templates/` - Preview templates
- `components/resume/templates/pdf/` - PDF export templates

### Common Tasks
- **Add UI component**: `npx shadcn@latest add <component>`
- **Run dev server**: `npm run dev`
- **Type check**: `npx tsc --noEmit`
- **Build**: `npm run build`
- **Run tests**: `npm test`
- **Lint code**: `npm run lint`

## Additional Resources

- **AI Features Guide**: [`.claude/AI_FEATURES.md`](./.claude/AI_FEATURES.md)
- **Claude Config**: [`.claude/README.md`](./.claude/README.md)
- **Project README**: [`README.md`](./README.md)
- **Documentation**: [`docs/`](./docs/)
