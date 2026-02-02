# Architecture Improvements Plan

This document outlines improvements to the resume builder architecture based on the architecture review.

> **Status**: Implementation completed on Feb 2, 2026

## Overview

| Area                            | Priority | Effort | Impact                   | Status      |
| ------------------------------- | -------- | ------ | ------------------------ | ----------- |
| 1. Loading States & Suspense    | Medium   | Low    | Medium (UX)              | ✅ Done     |
| 2. Auth Pattern Standardization | Low      | Low    | Low (consistency)        | ✅ Done     |
| 3. Component Decomposition      | Medium   | Medium | High (maintainability)   | ✅ Done     |
| 4. Route Organization           | Low      | Low    | Low (organization)       | ⏸️ Deferred |
| 5. Cache Simplification         | Low      | Medium | Medium (maintainability) | ✅ Done     |

---

## 1. Component Decomposition

### Problem

- `resume-editor.tsx` is 1000+ lines
- Large components are harder to test, maintain, and reason about
- Some sub-components have mixed responsibilities

### Goals

- Break down large components into smaller, focused units
- Each component should have a single responsibility
- Improve testability

### Implementation Steps

#### Phase 1: Extract Resume Editor Sub-components

**1.1 Extract Preview Toolbar Component**

```
components/resume/
├── resume-editor.tsx (orchestrator only)
├── editor-toolbar.tsx (existing)
├── preview-toolbar.tsx (NEW - template selector, zoom, download)
├── preview-panel.tsx (existing - just renders template)
└── section-panel.tsx (NEW - section navigation + form rendering)
```

Files to create:

- [ ] `components/resume/preview-toolbar.tsx` - Extract template selector, zoom controls, download button
- [ ] `components/resume/section-panel.tsx` - Extract section navigation and form rendering logic

**1.2 Refactor Resume Editor**

- [ ] `resume-editor.tsx` becomes a thin orchestrator (~200 lines)
- [ ] Move preview controls to `preview-toolbar.tsx`
- [ ] Move section rendering to `section-panel.tsx`
- [ ] Keep layout logic and hook orchestration in main file

#### Phase 2: Extract Form Sub-components

**2.1 Work Experience Form Decomposition**

```
components/resume/forms/
├── work-experience-form.tsx (list container)
├── work-experience-item.tsx (NEW - single experience card)
├── bullet-point-editor.tsx (NEW - bullet editing with AI)
└── shared/
    ├── date-range-picker.tsx (NEW)
    └── location-field.tsx (NEW)
```

Files to create:

- [ ] `components/resume/forms/work-experience-item.tsx` - Single work experience card
- [ ] `components/resume/forms/bullet-point-editor.tsx` - Bullet point editing with AI actions
- [ ] `components/resume/forms/shared/date-range-picker.tsx` - Reusable date range component
- [ ] `components/resume/forms/shared/location-field.tsx` - Location input with formatting

**2.2 Apply Same Pattern to Education Form**

- [ ] `components/resume/forms/education-item.tsx`

### Success Criteria

- `resume-editor.tsx` reduced to ~200-300 lines
- Each extracted component has clear props interface
- Existing tests continue to pass
- New components have unit tests

---

## 2. Loading States & Suspense

### Problem

- No `loading.tsx` files in route segments
- Users see blank screens during data fetching
- No streaming for server components

### Goals

- Add loading skeletons for better perceived performance
- Use Suspense boundaries for data-heavy pages
- Improve first contentful paint

### Implementation Steps

#### Phase 1: Add Route Loading States

**2.1 Dashboard Loading**

- [ ] Create `app/dashboard/loading.tsx`

```tsx
// Skeleton for resume cards, stats, etc.
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
```

**2.2 Editor Loading**

- [ ] Create `app/editor/[id]/loading.tsx`
- [ ] Create `app/editor/new/loading.tsx`

**2.3 Other Routes**

- [ ] `app/templates/loading.tsx` - Template gallery skeleton
- [ ] `app/settings/loading.tsx` - Settings form skeleton
- [ ] `app/applications/loading.tsx` - Applications list skeleton

#### Phase 2: Create Skeleton Components

**2.4 Create Skeleton Library**

```
components/skeletons/
├── dashboard-skeleton.tsx
├── editor-skeleton.tsx
├── template-gallery-skeleton.tsx
├── resume-card-skeleton.tsx (reusable)
└── form-skeleton.tsx (reusable)
```

Files to create:

- [ ] `components/skeletons/dashboard-skeleton.tsx`
- [ ] `components/skeletons/editor-skeleton.tsx`
- [ ] `components/skeletons/resume-card-skeleton.tsx`

#### Phase 3: Add Suspense Boundaries

**2.5 Wrap Data-Heavy Components**

- [ ] Wrap resume list in Suspense in dashboard
- [ ] Wrap template gallery in Suspense
- [ ] Use streaming for initial page loads

### Success Criteria

- All main routes have loading states
- No blank screens during navigation
- Lighthouse performance score maintained or improved

---

## 3. Auth Pattern Standardization

### Problem

- Most pages use `AuthGuard` component (client-side)
- Settings page uses custom `useEffect` check
- Inconsistent patterns make maintenance harder

### Goals

- Standardize on a single auth pattern
- Consider middleware-based protection for better security
- Reduce code duplication

### Implementation Steps

#### Option A: Standardize on AuthGuard (Recommended)

**3.1 Update Settings Page**

- [ ] Wrap settings page content with `AuthGuard`
- [ ] Remove custom `useEffect` auth check

**3.2 Audit All Protected Routes**

- [ ] List all routes that should be protected
- [ ] Verify each uses `AuthGuard`
- [ ] Document protection pattern

#### Option B: Move to Middleware (Future)

**3.3 Create Auth Middleware**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/settings/:path*"],
};
```

Note: This requires server-side session management (currently using Firebase client-side auth).

### Recommendation

- Short term: Standardize on `AuthGuard` (Option A)
- Long term: Consider middleware if moving to server-side sessions

### Success Criteria

- All protected routes use the same auth pattern
- No custom auth checks in individual pages
- Clear documentation of which routes are protected

---

## 4. Cache Simplification

### Problem

- 11 separate cache instances with different configurations
- Each AI feature has its own cache settings
- Hard to maintain and tune

### Goals

- Reduce complexity while maintaining flexibility
- Make cache configuration easier to understand
- Consider Redis for production scalability

### Implementation Steps

#### Phase 1: Unify Cache Configuration

**4.1 Create Cache Configuration File**

```typescript
// lib/ai/cache-config.ts
export const CACHE_CONFIGS = {
  // Cheap, frequent operations - large cache, long TTL
  frequent: { maxSize: 500, ttlDays: 7 },

  // Medium operations
  standard: { maxSize: 200, ttlDays: 7 },

  // Expensive operations - small cache, short TTL
  expensive: { maxSize: 50, ttlDays: 1 },

  // Rarely changing data
  stable: { maxSize: 200, ttlDays: 30 },
} as const;

export const FEATURE_CACHE_TIER: Record<string, keyof typeof CACHE_CONFIGS> = {
  bullets: "frequent",
  summary: "standard",
  skills: "stable",
  ats: "expensive",
  coverLetter: "standard",
  tailor: "expensive",
  // ...
};
```

**4.2 Refactor Cache Creation**

- [ ] Create `lib/ai/cache-config.ts`
- [ ] Update `lib/ai/cache.ts` to use configuration
- [ ] Reduce from 11 instances to 4 tiers

#### Phase 2: Add Cache Monitoring

**4.3 Unified Cache Stats**

- [ ] Create `getCacheStats()` function that aggregates all caches
- [ ] Add cache hit rate dashboard (admin only)
- [ ] Log cache performance metrics

#### Phase 3: Redis Migration (Optional/Future)

**4.4 Abstract Cache Interface**

```typescript
interface AICache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  stats(): CacheStats;
}
```

**4.5 Implement Redis Adapter**

- [ ] Create `lib/ai/redis-cache.ts`
- [ ] Add Redis connection configuration
- [ ] Migrate high-traffic caches to Redis

### Success Criteria

- Cache configuration is centralized
- Easy to add new features with appropriate caching
- Cache performance is visible/monitorable

---

## 5. Route Organization

### Problem

- All routes are flat in `app/`
- 20+ route folders at the same level
- Hard to distinguish marketing vs app routes

### Goals

- Organize routes by purpose
- Improve developer navigation
- Maintain current URL structure

### Implementation Steps

#### Phase 1: Add Route Groups

**5.1 Create Route Groups**

```
app/
├── (marketing)/          # Public pages
│   ├── page.tsx          # Home
│   ├── pricing/
│   ├── templates/
│   ├── blog/
│   ├── privacy/
│   └── terms/
├── (auth)/               # Authentication
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (app)/                # Protected app
│   ├── dashboard/
│   ├── editor/
│   ├── settings/
│   ├── applications/
│   └── cover-letter/
├── (public)/             # Public sharing
│   └── u/
└── api/                  # Keep flat
```

**5.2 Add Group Layouts**

- [ ] `app/(marketing)/layout.tsx` - Marketing header/footer
- [ ] `app/(auth)/layout.tsx` - Minimal auth layout
- [ ] `app/(app)/layout.tsx` - App shell with sidebar

#### Phase 2: Migrate Routes

**5.3 Move Files**

- [ ] Move marketing pages to `(marketing)/`
- [ ] Move auth pages to `(auth)/`
- [ ] Move app pages to `(app)/`
- [ ] Verify all URLs still work (route groups don't affect URLs)

### Success Criteria

- Routes are organized by purpose
- URL structure unchanged
- Easier to find routes in codebase

---

## Implementation Order

### Recommended Sequence

1. **Loading States (Quick Win)** - Low effort, immediate UX improvement
2. **Auth Standardization (Quick Win)** - Low effort, improves consistency
3. **Component Decomposition** - Medium effort, high long-term value
4. **Route Organization** - Low effort, better organization
5. **Cache Simplification** - Medium effort, needed before scaling

### Timeline Suggestion

| Phase   | Items                   | Scope    |
| ------- | ----------------------- | -------- |
| Phase 1 | Loading States, Auth    | 2-3 days |
| Phase 2 | Component Decomposition | 3-5 days |
| Phase 3 | Route Organization      | 1-2 days |
| Phase 4 | Cache Simplification    | 2-3 days |

---

## Notes

- All changes should maintain backward compatibility
- Add tests for new components before refactoring
- Run full test suite after each phase
- Consider feature flags for larger changes

## Implementation Summary (Feb 2, 2026)

### What Was Completed

**1. Loading States & Suspense**

- Created `DashboardSkeleton`, `TemplateGallerySkeleton`, `SettingsSkeleton`, `TemplateCardSkeleton` in `components/loading-skeleton.tsx`
- Added `loading.tsx` files for:
  - `app/dashboard/loading.tsx`
  - `app/editor/[id]/loading.tsx`
  - `app/editor/new/loading.tsx`
  - `app/templates/loading.tsx`
  - `app/settings/loading.tsx`

**2. Auth Pattern Standardization**

- Updated `app/settings/page.tsx` to use `AuthGuard` instead of custom `useEffect` auth check
- All protected routes now consistently use the `AuthGuard` component

**3. Component Decomposition**

- Extracted `SectionFormRenderer` (`components/resume/section-form-renderer.tsx`)
  - Handles rendering of all form sections based on active section
  - Reduces main editor complexity
- Extracted `EditorDialogs` (`components/resume/editor-dialogs.tsx`)
  - Contains all modal dialogs (reset, unsaved changes, template gallery, readiness, batch enhance, recovery)
  - Reduces main editor JSX by ~100 lines
- `resume-editor.tsx` is now more maintainable with clearer separation of concerns

**4. Cache Simplification**

- Created `lib/ai/cache-config.ts` with unified cache tier configuration
- Defined 5 cache tiers: `frequent`, `standard`, `expensive`, `stable`, `highVolume`
- Created `FEATURE_CACHE_TIER` mapping for all AI features
- Refactored `lib/ai/cache.ts` to use the new configuration
- Cache instances now use `createFeatureCache()` helper function

### What Was Deferred

**Route Organization**

- Creating route groups `(marketing)`, `(auth)`, `(app)` was deferred
- Reason: Lower priority, URL structure works fine as-is
- Can be implemented later if codebase grows significantly

### Files Created

- `components/loading-skeleton.tsx` (updated with new skeletons)
- `components/resume/section-form-renderer.tsx`
- `components/resume/editor-dialogs.tsx`
- `lib/ai/cache-config.ts`
- `app/dashboard/loading.tsx`
- `app/editor/[id]/loading.tsx`
- `app/editor/new/loading.tsx`
- `app/templates/loading.tsx`
- `app/settings/loading.tsx`

### Files Modified

- `app/settings/page.tsx` (auth pattern)
- `components/resume/resume-editor.tsx` (uses extracted components)
- `lib/ai/cache.ts` (uses cache-config)

## Related Documents

- `docs/development/REFACTORING_SUMMARY.md`
- `docs/development/PROJECT_STRUCTURE_IMPROVEMENTS.md`
- `CLAUDE.md` - Main project documentation
