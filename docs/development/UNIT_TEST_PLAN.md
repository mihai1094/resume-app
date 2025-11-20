# Unit Test Plan

## Current Test Coverage Status

### ✅ Existing Tests

**Components:**
- ✅ `components/forms/form-field.test.tsx` - Comprehensive form field tests
- ✅ `components/forms/form-checkbox.test.tsx` - Checkbox component tests
- ✅ `components/forms/form-textarea.test.tsx` - Textarea component tests
- ✅ `components/forms/form-date-picker.test.tsx` - Date picker tests
- ✅ `components/shared/skip-link.test.tsx` - Skip link accessibility tests

**Hooks:**
- ✅ `hooks/__tests__/use-field-validation.test.ts` - Field validation hook tests
- ✅ `hooks/__tests__/use-form-array.test.ts` - Form array management tests

**Validation:**
- ✅ `lib/validation/__tests__/resume-validation.test.ts` - Resume validation logic tests

### ❌ Missing Tests (Priority Order)

---

## Phase 1: Critical Hooks (High Priority)

### 1.1 `hooks/use-resume.ts` ⚠️ **CRITICAL**
**Priority:** 🔴 **HIGHEST**
**Estimated Time:** 4-6 hours
**Coverage Goal:** 95%+

**Test Cases:**
- [ ] Initial state with default resume data
- [ ] `updatePersonalInfo` - updates personal information correctly
- [ ] `addWorkExperience` - adds new work experience entry
- [ ] `updateWorkExperience` - updates existing work experience
- [ ] `removeWorkExperience` - removes work experience by ID
- [ ] `reorderWorkExperience` - reorders work experience entries
- [ ] `addEducation` - adds new education entry
- [ ] `updateEducation` - updates existing education
- [ ] `removeEducation` - removes education by ID
- [ ] `reorderEducation` - reorders education entries
- [ ] `addSkill` - adds new skill
- [ ] `removeSkill` - removes skill by ID
- [ ] `addLanguage` - adds new language
- [ ] `updateLanguage` - updates existing language
- [ ] `removeLanguage` - removes language by ID
- [ ] `addCourse` - adds new course
- [ ] `updateCourse` - updates existing course
- [ ] `removeCourse` - removes course by ID
- [ ] `addHobby` - adds new hobby
- [ ] `updateHobby` - updates existing hobby
- [ ] `removeHobby` - removes hobby by ID
- [ ] `addExtraCurricular` - adds new extra-curricular activity
- [ ] `updateExtraCurricular` - updates existing extra-curricular
- [ ] `removeExtraCurricular` - removes extra-curricular by ID
- [ ] `resetResume` - resets to default state
- [ ] `loadResume` - loads resume data from external source
- [ ] Validation state updates correctly
- [ ] Edge cases: empty arrays, invalid IDs, duplicate entries

**File:** `hooks/__tests__/use-resume.test.ts`

---

### 1.2 `hooks/use-local-storage.ts` ⚠️ **CRITICAL**
**Priority:** 🔴 **HIGH**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 90%+

**Test Cases:**
- [ ] Initial value from localStorage
- [ ] Setting value updates localStorage
- [ ] Debouncing works correctly (500ms default)
- [ ] `isSaving` state transitions
- [ ] `lastSaved` timestamp updates
- [ ] `clearValue` removes from localStorage
- [ ] `getSaveStatus` returns correct status strings
- [ ] Handles localStorage errors gracefully
- [ ] SSR safety (window undefined)

**File:** `hooks/__tests__/use-local-storage.test.ts`

---

### 1.3 `hooks/use-saved-resumes.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 85%+

**Test Cases:**
- [ ] `getSavedResumes` - retrieves all saved resumes
- [ ] `saveResume` - saves resume with metadata
- [ ] `deleteResume` - removes resume by ID
- [ ] `updateResume` - updates existing resume
- [ ] `getResumeById` - retrieves specific resume
- [ ] Handles empty state
- [ ] Handles invalid IDs

**File:** `hooks/__tests__/use-saved-resumes.test.ts`

---

### 1.4 `hooks/use-user.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 1-2 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] `createUser` - creates new user account
- [ ] `getUser` - retrieves current user
- [ ] `logout` - clears user data
- [ ] `isAuthenticated` - returns correct auth state
- [ ] Persists user data in localStorage
- [ ] Handles missing user gracefully

**File:** `hooks/__tests__/use-user.test.ts`

---

### 1.5 `hooks/use-drag-and-drop.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2 hours
**Coverage Goal:** 85%+

**Test Cases:**
- [ ] `handleDragStart` - sets drag data
- [ ] `handleDragOver` - prevents default, allows drop
- [ ] `handleDrop` - reorders items correctly
- [ ] `handleDragEnd` - cleans up drag state
- [ ] Edge cases: invalid indices, empty arrays

**File:** `hooks/__tests__/use-drag-and-drop.test.ts`

---

### 1.6 `hooks/use-keyboard-shortcuts.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1-2 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] Registers keyboard shortcuts
- [ ] Calls callbacks on key press
- [ ] Handles modifier keys (Ctrl, Cmd)
- [ ] Prevents default behavior
- [ ] Cleanup on unmount

**File:** `hooks/__tests__/use-keyboard-shortcuts.test.ts`

---

### 1.7 `hooks/use-history.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 2 hours
**Coverage Goal:** 85%+

**Test Cases:**
- [ ] `undo` - reverts to previous state
- [ ] `redo` - advances to next state
- [ ] `canUndo` / `canRedo` - returns correct state
- [ ] History limit (max 50 states)
- [ ] Clears future history on new action

**File:** `hooks/__tests__/use-history.test.ts`

---

### 1.8 `hooks/use-touched-fields.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1 hour
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] `markTouched` - marks field as touched
- [ ] `isTouched` - checks if field is touched
- [ ] `resetTouched` - clears touched state
- [ ] `getTouchedFields` - returns all touched fields

**File:** `hooks/__tests__/use-touched-fields.test.ts`

---

## Phase 2: Core Components (High Priority)

### 2.1 `components/resume/resume-editor.tsx` ⚠️ **CRITICAL**
**Priority:** 🔴 **HIGHEST**
**Estimated Time:** 6-8 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] Renders all sections correctly
- [ ] Section navigation works
- [ ] Preview toggle functionality
- [ ] Template selection
- [ ] Mobile/desktop responsive behavior
- [ ] Auto-save integration
- [ ] Export functionality (JSON, PDF)
- [ ] Reset confirmation dialog
- [ ] Section completion tracking
- [ ] Progress percentage calculation
- [ ] Keyboard shortcuts integration
- [ ] Template customization panel

**File:** `components/resume/__tests__/resume-editor.test.tsx`

**Note:** This is a complex component. Consider testing in smaller units:
- Section navigation logic
- Preview toggle logic
- Template selection logic

---

### 2.2 `components/resume/editor-header.tsx`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] Renders user information
- [ ] Export buttons (JSON, PDF)
- [ ] Import functionality
- [ ] Reset button with confirmation
- [ ] Logout functionality
- [ ] Save status display
- [ ] Progress indicator
- [ ] Preview toggle button
- [ ] Template gallery button
- [ ] Customizer toggle button

**File:** `components/resume/__tests__/editor-header.test.tsx`

---

### 2.3 `components/resume/section-navigation.tsx`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2 hours
**Coverage Goal:** 85%+

**Test Cases:**
- [ ] Renders all sections
- [ ] Highlights active section
- [ ] Shows completion status
- [ ] Collapse/expand functionality
- [ ] Section click navigation
- [ ] Progress bar display
- [ ] Template preview

**File:** `components/resume/__tests__/section-navigation.test.tsx`

---

### 2.4 `components/resume/preview-panel.tsx`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 75%+

**Test Cases:**
- [ ] Renders selected template
- [ ] Displays resume data correctly
- [ ] Shows validation errors
- [ ] Template customization applied
- [ ] Responsive layout
- [ ] Loading states

**File:** `components/resume/__tests__/preview-panel.test.tsx`

---

### 2.5 `components/resume/mobile-section-tabs.tsx`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1-2 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] Renders tabs for all sections
- [ ] Active tab highlighting
- [ ] Section switching
- [ ] Completion indicators
- [ ] Mobile-only rendering

**File:** `components/resume/__tests__/mobile-section-tabs.test.tsx`

---

### 2.6 `components/resume/mobile-preview-overlay.tsx`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1-2 hours
**Coverage Goal:** 75%+

**Test Cases:**
- [ ] Opens/closes overlay
- [ ] Renders preview content
- [ ] Close button functionality
- [ ] Backdrop click to close
- [ ] Mobile-only rendering

**File:** `components/resume/__tests__/mobile-preview-overlay.test.tsx`

---

### 2.7 `components/resume/section-wrapper.tsx`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1 hour
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] Renders section title and description
- [ ] Previous/Next navigation
- [ ] Progress indicator
- [ ] Disabled state for navigation buttons

**File:** `components/resume/__tests__/section-wrapper.test.tsx`

---

### 2.8 `components/resume/template-customizer.tsx`
**Priority:** 🟢 **LOW**
**Estimated Time:** 2 hours
**Coverage Goal:** 75%+

**Test Cases:**
- [ ] Renders all customization options
- [ ] Color picker functionality
- [ ] Font family selection
- [ ] Font size slider
- [ ] Line spacing slider
- [ ] Section spacing slider
- [ ] Reset to defaults
- [ ] Updates preview in real-time

**File:** `components/resume/__tests__/template-customizer.test.tsx`

---

### 2.9 `components/resume/template-preview-gallery.tsx`
**Priority:** 🟢 **LOW**
**Estimated Time:** 2 hours
**Coverage Goal:** 75%+

**Test Cases:**
- [ ] Renders all templates
- [ ] Template selection
- [ ] Preview rendering
- [ ] Dialog open/close
- [ ] Active template highlighting

**File:** `components/resume/__tests__/template-preview-gallery.test.tsx`

---

## Phase 3: Form Components (Medium Priority)

### 3.1 Resume Form Components
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 8-10 hours total
**Coverage Goal:** 80%+

**Components to Test:**
- [ ] `components/resume/forms/personal-info-form.test.tsx`
- [ ] `components/resume/forms/work-experience-form.test.tsx`
- [ ] `components/resume/forms/education-form.test.tsx`
- [ ] `components/resume/forms/skills-form.test.tsx`
- [ ] `components/resume/forms/languages-form.test.tsx`
- [ ] `components/resume/forms/courses-form.test.tsx`
- [ ] `components/resume/forms/hobbies-form.test.tsx`
- [ ] `components/resume/forms/extra-curricular-form.test.tsx`

**Common Test Cases for Each Form:**
- [ ] Renders all form fields
- [ ] Handles input changes
- [ ] Validation errors display
- [ ] Add/remove array items
- [ ] Reorder functionality (where applicable)
- [ ] Required field validation
- [ ] Form submission handling
- [ ] Accessibility (labels, ARIA attributes)

---

## Phase 4: Service Layer (Medium Priority)

### 4.1 `lib/services/resume.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 90%+

**Test Cases:**
- [ ] `exportToJSON` - exports correct JSON format
- [ ] `importFromJSON` - imports JSON correctly
- [ ] `validateResumeData` - validates resume structure
- [ ] `generateId` - generates unique IDs
- [ ] Error handling for invalid data

**File:** `lib/services/__tests__/resume.test.ts`

---

### 4.2 `lib/services/export.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 3-4 hours
**Coverage Goal:** 80%+

**Test Cases:**
- [ ] `exportToPDF` - generates PDF blob
- [ ] Handles all template types
- [ ] Error handling
- [ ] File naming
- [ ] PDF content validation (snapshot testing)

**File:** `lib/services/__tests__/export.test.ts`

**Note:** PDF testing may require mocking `@react-pdf/renderer`

---

### 4.3 `lib/services/import.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2 hours
**Coverage Goal:** 85%+

**Test Cases:**
- [ ] `importFromJSON` - imports JSON correctly
- [ ] Validates imported data structure
- [ ] Handles missing fields gracefully
- [ ] Error handling for invalid JSON
- [ ] Data migration for old formats

**File:** `lib/services/__tests__/import.test.ts`

---

### 4.4 `lib/services/cv-import.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 2-3 hours
**Coverage Goal:** 75%+

**Test Cases:**
- [ ] DOCX import parsing
- [ ] PDF import parsing
- [ ] Data extraction accuracy
- [ ] Error handling
- [ ] File type detection

**File:** `lib/services/__tests__/cv-import.test.ts`

**Note:** Requires mocking `mammoth` and `pdfjs-dist`

---

### 4.5 `lib/services/storage.ts`
**Priority:** 🟡 **MEDIUM**
**Estimated Time:** 2 hours
**Coverage Goal:** 90%+

**Test Cases:**
- [ ] `get` - retrieves data correctly
- [ ] `set` - saves data correctly
- [ ] `remove` - deletes data
- [ ] `clear` - clears all data
- [ ] Error handling for quota exceeded
- [ ] SSR safety

**File:** `lib/services/__tests__/storage.test.ts`

---

## Phase 5: Utility Functions (Low Priority)

### 5.1 `lib/utils/resume.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 1-2 hours
**Coverage Goal:** 90%+

**Test Cases:**
- [ ] `generateId` - generates unique IDs
- [ ] `createDefaultResume` - creates valid default resume
- [ ] `formatDate` - formats dates correctly
- [ ] `parseDate` - parses date strings
- [ ] All utility functions

**File:** `lib/utils/__tests__/resume.test.ts`

---

### 5.2 `lib/utils/cn.ts`
**Priority:** 🟢 **LOW**
**Estimated Time:** 30 minutes
**Coverage Goal:** 100%+

**Test Cases:**
- [ ] Merges class names correctly
- [ ] Handles conditional classes
- [ ] Handles undefined/null values
- [ ] Handles arrays of classes

**File:** `lib/utils/__tests__/cn.test.ts`

---

## Phase 6: Template Components (Low Priority)

### 6.1 Resume Templates
**Priority:** 🟢 **LOW**
**Estimated Time:** 4-6 hours total
**Coverage Goal:** 70%+

**Templates to Test:**
- [ ] `components/resume/templates/modern-template.test.tsx`
- [ ] `components/resume/templates/classic-template.test.tsx`
- [ ] `components/resume/templates/executive-template.test.tsx`
- [ ] `components/resume/templates/minimalist-template.test.tsx`
- [ ] `components/resume/templates/creative-template.test.tsx`
- [ ] `components/resume/templates/technical-template.test.tsx`

**Common Test Cases:**
- [ ] Renders all resume sections
- [ ] Handles missing optional sections
- [ ] Applies customization (colors, fonts)
- [ ] Responsive layout
- [ ] Snapshot testing for visual regression

---

## Phase 7: Shared Components (Low Priority)

### 7.1 Shared Components
**Priority:** 🟢 **LOW**
**Estimated Time:** 2-3 hours total
**Coverage Goal:** 75%+

**Components to Test:**
- [ ] `components/shared/error-message.test.tsx`
- [ ] `components/shared/loading.test.tsx`
- [ ] `components/shared/footer.test.tsx`
- [ ] `components/shared/header.test.tsx`
- [ ] `components/error-boundary.test.tsx`
- [ ] `components/loading-skeleton.test.tsx`
- [ ] `components/scroll-reveal.test.tsx`

---

### 7.2 UI Components (shadcn/ui)
**Priority:** 🟢 **LOW**
**Estimated Time:** 4-6 hours total
**Coverage Goal:** 70%+

**Note:** These are third-party components. Focus on testing customizations and integrations.

**Components to Test (if customized):**
- [ ] `components/ui/button.test.tsx` - Custom variants
- [ ] `components/ui/month-picker.test.tsx` - Custom component

---

## Phase 8: Integration Tests (Future)

### 8.1 End-to-End User Flows
**Priority:** 🔵 **FUTURE**
**Estimated Time:** 8-12 hours
**Coverage Goal:** N/A (E2E)

**Test Scenarios:**
- [ ] Complete resume creation flow
- [ ] Template switching
- [ ] Export/import flow
- [ ] Multi-resume management
- [ ] Auto-save functionality
- [ ] Form validation flow

**Note:** Consider using Playwright or Cypress for E2E tests.

---

## Test Coverage Goals Summary

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| **Hooks** | ~30% | 90%+ | 🔴 HIGH |
| **Components** | ~20% | 80%+ | 🟡 MEDIUM |
| **Services** | ~0% | 85%+ | 🟡 MEDIUM |
| **Utils** | ~0% | 90%+ | 🟢 LOW |
| **Validation** | ~100% | 100% | ✅ DONE |
| **Forms** | ~25% | 80%+ | 🟡 MEDIUM |
| **Templates** | ~0% | 70%+ | 🟢 LOW |

**Overall Target:** 75%+ code coverage

---

## Implementation Strategy

### Week 1: Critical Hooks
- Focus on `use-resume.ts` and `use-local-storage.ts`
- These are the foundation of the app

### Week 2: Core Components
- `resume-editor.tsx` and `editor-header.tsx`
- Break down into smaller testable units

### Week 3: Form Components
- All resume form components
- Reuse test patterns

### Week 4: Services & Utils
- Service layer tests
- Utility function tests

### Week 5: Polish & Templates
- Template components
- Shared components
- Increase coverage to target

---

## Testing Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component/hook does, not how
   - Test user interactions and outcomes

2. **Use Descriptive Test Names**
   - `it('should update work experience when valid data is provided')`
   - Not: `it('works correctly')`

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should add new work experience', () => {
     // Arrange
     const { result } = renderHook(() => useResume());

     // Act
     act(() => {
       result.current.addWorkExperience({...});
     });

     // Assert
     expect(result.current.resumeData.workExperience).toHaveLength(1);
   });
   ```

4. **Mock External Dependencies**
   - Mock localStorage, window APIs
   - Mock third-party libraries (pdfjs, mammoth)

5. **Test Edge Cases**
   - Empty states
   - Invalid inputs
   - Error conditions
   - Boundary values

6. **Accessibility Testing**
   - Test ARIA attributes
   - Test keyboard navigation
   - Test screen reader compatibility

7. **Snapshot Testing (Sparingly)**
   - Use for templates and complex UI
   - Update snapshots intentionally

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- use-resume.test.ts

# Run tests matching pattern
npm test -- --grep "use-resume"
```

---

## Coverage Reports

After running `npm run test:coverage`, check:
- `coverage/` directory for HTML reports
- Terminal output for summary
- CI/CD integration for coverage tracking

---

## Next Steps

1. ✅ Review this plan
2. ⬜ Install coverage provider (`@vitest/coverage-v8`)
3. ⬜ Set up CI/CD coverage reporting
4. ⬜ Start with Phase 1 (Critical Hooks)
5. ⬜ Create test utilities and mocks
6. ⬜ Establish testing patterns and conventions

---

**Last Updated:** 2024-12-19
**Status:** Planning Phase

