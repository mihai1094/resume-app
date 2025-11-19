# Frontend Refactoring Tasks - Code Organization & Architecture

**Goal:** Improve code maintainability, readability, and developer experience without changing functionality.

**Timeline:** 2-3 weeks (part-time) or 1 week (full-time)

**Status:** Not Started

---

## Overview

The current codebase works well but has some architectural debt:
- `resume-editor.tsx` is 986 lines (should be <300)
- Form components have duplicated logic
- No centralized validation system
- Business logic mixed with UI components

These 10 tasks will refactor the frontend incrementally without breaking existing functionality.

---

## ✅ Task Checklist

### Phase 1: Foundation (Tasks 1-3)

- [ ] **Task 1:** Create shared form field components
- [ ] **Task 2:** Extract validation logic into a centralized system
- [ ] **Task 3:** Create a reusable form array manager hook

### Phase 2: Component Extraction (Tasks 4-6)

- [ ] **Task 4:** Split `resume-editor.tsx` - Extract header and navigation
- [ ] **Task 5:** Split `resume-editor.tsx` - Extract preview panel
- [ ] **Task 6:** Create a generic section wrapper component

### Phase 3: Form Refactoring (Tasks 7-9)

- [ ] **Task 7:** Refactor work experience form to use new patterns
- [ ] **Task 8:** Refactor education form to use new patterns
- [ ] **Task 9:** Standardize all section forms with shared patterns

### Phase 4: Polish (Task 10)

- [ ] **Task 10:** Add error boundaries and loading states

---

## Detailed Task Breakdown

---

### 📝 Task 1: Create Shared Form Field Components

**Time Estimate:** 2-3 hours

**Why:** Form fields are duplicated across all form components. Extract common patterns.

**What to Create:**

1. **`components/forms/form-field.tsx`**
```typescript
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  helperText?: string
}

export function FormField({ label, value, onChange, placeholder, required, error, helperText }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  )
}
```

2. **`components/forms/form-textarea.tsx`**
   - Same pattern but for textarea fields

3. **`components/forms/form-date-picker.tsx`**
   - Wraps MonthPicker with consistent styling

4. **`components/forms/form-checkbox.tsx`**
   - Wraps Checkbox with label and error handling

**Files to Create:**
- `components/forms/form-field.tsx`
- `components/forms/form-textarea.tsx`
- `components/forms/form-date-picker.tsx`
- `components/forms/form-checkbox.tsx`
- `components/forms/index.ts` (barrel export)

**Success Criteria:**
- All form components have consistent styling
- Validation errors display uniformly
- Helper text shows when no errors

**Testing:**
- Update one form (e.g., personal-info-form.tsx) to use new components
- Verify functionality unchanged

---

### 🔍 Task 2: Extract Validation Logic into Centralized System

**Time Estimate:** 3-4 hours

**Why:** Validation is scattered across components. Centralize for consistency.

**What to Create:**

1. **`lib/validation/resume-validation.ts`**
```typescript
import { ResumeData } from "@/lib/types/resume"

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Field-level validators
export const validators = {
  email: (value: string): string | null => {
    if (!value) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format"
    }
    return null
  },

  phone: (value: string): string | null => {
    if (!value) return "Phone is required"
    if (!/^\+?[\d\s-()]+$/.test(value)) {
      return "Invalid phone format"
    }
    return null
  },

  required: (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return "This field is required"
    }
    return null
  },

  url: (value?: string): string | null => {
    if (!value) return null // Optional field
    try {
      new URL(value)
      return null
    } catch {
      return "Invalid URL format"
    }
  },

  dateRange: (startDate: string, endDate?: string, current?: boolean): string | null => {
    if (!startDate) return "Start date is required"
    if (!current && !endDate) return "End date is required (or check 'Current')"
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return "Start date must be before end date"
    }
    return null
  }
}

// Section validators
export function validatePersonalInfo(info: ResumeData['personalInfo']): ValidationError[] {
  const errors: ValidationError[] = []

  const emailError = validators.email(info.email)
  if (emailError) errors.push({ field: 'email', message: emailError })

  const phoneError = validators.phone(info.phone)
  if (phoneError) errors.push({ field: 'phone', message: phoneError })

  const requiredFields = ['firstName', 'lastName', 'location'] as const
  requiredFields.forEach(field => {
    const error = validators.required(info[field])
    if (error) errors.push({ field, message: error })
  })

  if (info.website) {
    const urlError = validators.url(info.website)
    if (urlError) errors.push({ field: 'website', message: urlError })
  }

  return errors
}

export function validateWorkExperience(experiences: ResumeData['workExperience']): ValidationError[] {
  const errors: ValidationError[] = []

  experiences.forEach((exp, index) => {
    if (!exp.company) errors.push({ field: `experience.${index}.company`, message: 'Company name is required' })
    if (!exp.position) errors.push({ field: `experience.${index}.position`, message: 'Position is required' })

    const dateError = validators.dateRange(exp.startDate, exp.endDate, exp.current)
    if (dateError) errors.push({ field: `experience.${index}.dates`, message: dateError })

    if (exp.description.length === 0 || exp.description.every(d => !d.trim())) {
      errors.push({ field: `experience.${index}.description`, message: 'At least one responsibility is required' })
    }
  })

  return errors
}

// Main resume validator
export function validateResume(data: ResumeData): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Validate each section
  errors.push(...validatePersonalInfo(data.personalInfo))
  errors.push(...validateWorkExperience(data.workExperience))
  // Add more sections...

  // Warnings (not blocking, but helpful)
  if (data.workExperience.length === 0) {
    warnings.push({ field: 'workExperience', message: 'Consider adding work experience' })
  }

  if (data.skills.length < 5) {
    warnings.push({ field: 'skills', message: 'Adding more skills will strengthen your resume' })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
```

2. **`hooks/use-field-validation.ts`** (Real-time field validation)
```typescript
import { useState, useCallback } from 'react'

export function useFieldValidation(
  validator: (value: any) => string | null
) {
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback((value: any) => {
    const errorMsg = validator(value)
    setError(errorMsg)
    return errorMsg === null
  }, [validator])

  return { error, validate, setError }
}
```

**Files to Create:**
- `lib/validation/resume-validation.ts`
- `lib/validation/field-validators.ts`
- `hooks/use-field-validation.ts`

**Success Criteria:**
- All validation logic in one place
- Easy to add new validators
- Can validate individual fields or entire sections
- Distinguish between errors (blocking) and warnings (helpful)

---

### 🎣 Task 3: Create Reusable Form Array Manager Hook

**Time Estimate:** 2-3 hours

**Why:** Work experience, education, courses, etc. all manage arrays of items with add/remove/reorder. Extract this pattern.

**What to Create:**

**`hooks/use-form-array.ts`**
```typescript
import { useState, useCallback } from 'react'

interface UseFormArrayOptions<T> {
  initialItems: T[]
  onAdd: () => void
  onUpdate: (id: string, updates: Partial<T>) => void
  onRemove: (id: string) => void
  onReorder?: (startIndex: number, endIndex: number) => void
}

export function useFormArray<T extends { id: string }>(
  options: UseFormArrayOptions<T>
) {
  const { initialItems, onAdd, onUpdate, onRemove, onReorder } = options
  const [expandedId, setExpandedId] = useState<string | null>(
    initialItems[0]?.id || null
  )

  const handleAdd = useCallback(() => {
    onAdd()
    // Expand the newly added item (it will be the last one)
    // This requires knowing the new ID, so we might need to adjust the pattern
  }, [onAdd])

  const handleRemove = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onRemove(id)
      if (expandedId === id) {
        setExpandedId(null)
      }
    }
  }, [onRemove, expandedId])

  const handleToggle = useCallback((id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }, [expandedId])

  return {
    items: initialItems,
    expandedId,
    handleAdd,
    handleUpdate: onUpdate,
    handleRemove,
    handleReorder: onReorder,
    handleToggle,
    setExpandedId
  }
}
```

**Files to Create:**
- `hooks/use-form-array.ts`

**Success Criteria:**
- Accordion expand/collapse logic centralized
- Add/remove confirmations handled
- Easy to use in any array form

---

### 🧩 Task 4: Split resume-editor.tsx - Extract Header and Navigation

**Time Estimate:** 2-3 hours

**Why:** The header section is 180+ lines and self-contained. Easy win to extract.

**What to Create:**

1. **`components/resume/editor-header.tsx`**
```typescript
interface EditorHeaderProps {
  user: User | null
  onExportJSON: () => void
  onExportPDF: () => void
  onReset: () => void
  onLogout: () => void
  onImport: (data: ResumeData) => void
  saveStatus: string
  completedSections: number
  totalSections: number
  showPreview: boolean
  onTogglePreview: () => void
}

export function EditorHeader({ ... }: EditorHeaderProps) {
  // Extract lines 408-583 from resume-editor.tsx
}
```

2. **`components/resume/section-navigation.tsx`**
```typescript
interface SectionNavigationProps {
  sections: Section[]
  activeSection: string
  onSectionChange: (section: string) => void
  isSectionComplete: (section: string) => boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function SectionNavigation({ ... }: SectionNavigationProps) {
  // Desktop sidebar navigation (lines 628-764)
}
```

3. **`components/resume/mobile-section-tabs.tsx`**
```typescript
export function MobileSectionTabs({ ... }) {
  // Mobile horizontal tabs (lines 588-624)
}
```

**Files to Create:**
- `components/resume/editor-header.tsx`
- `components/resume/section-navigation.tsx`
- `components/resume/mobile-section-tabs.tsx`

**Files to Modify:**
- `components/resume/resume-editor.tsx` (import and use new components)

**Success Criteria:**
- `resume-editor.tsx` reduced by ~300 lines
- Header extracted to own component
- Navigation extracted to own component
- All functionality still works

---

### 👁️ Task 5: Split resume-editor.tsx - Extract Preview Panel

**Time Estimate:** 2 hours

**Why:** Preview logic is self-contained and can be reused elsewhere.

**What to Create:**

**`components/resume/preview-panel.tsx`**
```typescript
interface PreviewPanelProps {
  templateId: string
  resumeData: ResumeData
  isValid: boolean
  className?: string
}

export function PreviewPanel({ templateId, resumeData, isValid, className }: PreviewPanelProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case "classic":
        return <ClassicTemplate data={resumeData} />
      case "executive":
        return <ExecutiveTemplate data={resumeData} />
      case "modern":
      default:
        return <ModernTemplate data={resumeData} />
    }
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Live Preview</h3>
        </div>
        {isValid && (
          <Badge variant="default" className="bg-green-600">
            <Check className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        )}
      </div>
      <Separator className="mb-4" />
      <div className="overflow-auto max-h-[calc(100vh-16rem)] bg-muted/30 rounded-lg p-4">
        <div className="transform scale-[0.4] origin-top-left" style={{ width: "250%" }}>
          {renderTemplate()}
        </div>
      </div>
    </Card>
  )
}
```

**Files to Create:**
- `components/resume/preview-panel.tsx`
- `components/resume/mobile-preview-overlay.tsx` (for mobile fullscreen preview)

**Files to Modify:**
- `components/resume/resume-editor.tsx`

**Success Criteria:**
- Preview can be reused in other pages (e.g., /my-resumes preview)
- Desktop and mobile preview extracted
- Reduced another ~100 lines from resume-editor

---

### 🎁 Task 6: Create Generic Section Wrapper Component

**Time Estimate:** 2 hours

**Why:** Each section form has the same wrapper (title, description, prev/next buttons). Extract the pattern.

**What to Create:**

**`components/resume/section-wrapper.tsx`**
```typescript
interface SectionWrapperProps {
  title: string
  description: string
  children: React.ReactNode
  currentIndex: number
  totalSections: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export function SectionWrapper({
  title,
  description,
  children,
  currentIndex,
  totalSections,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext
}: SectionWrapperProps) {
  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Form Content */}
      <div className="space-y-6">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentIndex + 1} of {totalSections}
        </div>

        <Button onClick={onNext} disabled={!canGoNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  )
}
```

**Files to Create:**
- `components/resume/section-wrapper.tsx`

**Files to Modify:**
- `components/resume/resume-editor.tsx` (wrap each section's form)

**Success Criteria:**
- All section forms have consistent wrapper
- Navigation logic extracted
- Easy to add new sections

---

### 💼 Task 7: Refactor Work Experience Form

**Time Estimate:** 3-4 hours

**Why:** This is the most complex form. Refactor it first as a template for others.

**What to Do:**

Refactor `components/resume/forms/work-experience-form.tsx` to use:
- New form field components (Task 1)
- Validation system (Task 2)
- Form array hook (Task 3)

**Before (current):**
```typescript
// 200+ lines with inline Input components
<Input
  value={experience.company}
  onChange={(e) => onUpdate(experience.id, { company: e.target.value })}
/>
```

**After (refactored):**
```typescript
import { FormField, FormTextarea, FormDatePicker } from "@/components/forms"
import { useFormArray } from "@/hooks/use-form-array"
import { validateWorkExperience } from "@/lib/validation/resume-validation"

export function WorkExperienceForm({ experiences, onAdd, onUpdate, onRemove, onReorder }) {
  const { items, expandedId, handleToggle, handleAdd, handleRemove } = useFormArray({
    initialItems: experiences,
    onAdd,
    onUpdate,
    onRemove,
    onReorder
  })

  const errors = validateWorkExperience(experiences)

  return (
    <div className="space-y-4">
      {items.map((exp, index) => (
        <Collapsible key={exp.id} open={expandedId === exp.id}>
          <CollapsibleTrigger onClick={() => handleToggle(exp.id)}>
            {exp.position || 'New Position'} at {exp.company || 'Company'}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FormField
              label="Company Name"
              value={exp.company}
              onChange={(val) => onUpdate(exp.id, { company: val })}
              required
              error={errors.find(e => e.field === `experience.${index}.company`)?.message}
            />
            <FormField
              label="Position"
              value={exp.position}
              onChange={(val) => onUpdate(exp.id, { position: val })}
              required
            />
            {/* ... more fields */}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
```

**Success Criteria:**
- Uses shared form components
- Validation integrated
- Cleaner, more maintainable code
- Functionality unchanged

---

### 🎓 Task 8: Refactor Education Form

**Time Estimate:** 2-3 hours

**Why:** Apply the same pattern from Task 7 to education form.

**What to Do:**

Refactor `components/resume/forms/education-form.tsx` using the same patterns:
- Form field components
- Validation
- Form array hook

**Success Criteria:**
- Consistent with work experience form
- Validation working
- Code reuse maximized

---

### 🔄 Task 9: Standardize All Section Forms

**Time Estimate:** 4-5 hours

**Why:** Apply patterns to all remaining forms for consistency.

**What to Do:**

Refactor remaining form components:
- `personal-info-form.tsx`
- `skills-form.tsx`
- `languages-form.tsx`
- `courses-form.tsx`
- `hobbies-form.tsx`
- `extra-curricular-form.tsx`

**Create a Forms Pattern Guide:**

**`components/resume/forms/README.md`**
```markdown
# Resume Forms Pattern Guide

All form components should follow this structure:

## 1. Use Shared Components
- `FormField` for text inputs
- `FormTextarea` for multi-line text
- `FormDatePicker` for dates
- `FormCheckbox` for checkboxes

## 2. Validation
- Import validators from `lib/validation/resume-validation.ts`
- Show errors inline on each field
- Use `useFieldValidation` hook for real-time validation

## 3. Array Forms
- Use `useFormArray` hook for managing lists
- Accordion/collapsible for each item
- Drag-and-drop for reordering (if supported)

## 4. Props Interface
```typescript
interface FormProps {
  data: DataType | DataType[]
  onAdd?: () => void
  onUpdate: (id: string, updates: Partial<DataType>) => void
  onRemove?: (id: string) => void
  onReorder?: (startIndex: number, endIndex: number) => void
}
```

## Example Usage
See `work-experience-form.tsx` as the reference implementation.
```

**Success Criteria:**
- All forms follow the same pattern
- Easy for new developers to understand
- Pattern guide documented

---

### 🛡️ Task 10: Add Error Boundaries and Loading States

**Time Estimate:** 2-3 hours

**Why:** Graceful error handling improves UX when things go wrong.

**What to Create:**

1. **`components/error-boundary.tsx`**
```typescript
'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="p-6 m-4">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}
```

2. **`components/loading-skeleton.tsx`**
```typescript
export function ResumeEditorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-16 bg-muted rounded mb-4" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 h-96 bg-muted rounded" />
        <div className="col-span-6 h-96 bg-muted rounded" />
        <div className="col-span-3 h-96 bg-muted rounded" />
      </div>
    </div>
  )
}
```

3. **Wrap components with error boundaries**
```typescript
// In resume-editor.tsx or app/create/page.tsx
<ErrorBoundary>
  <ResumeEditor templateId={templateId} />
</ErrorBoundary>
```

**Files to Create:**
- `components/error-boundary.tsx`
- `components/loading-skeleton.tsx`
- `components/shared/loading.tsx` (enhance existing)

**Files to Modify:**
- `app/create/page.tsx` (add error boundary)
- `app/my-resumes/page.tsx` (add error boundary)

**Success Criteria:**
- Errors don't crash the whole app
- User sees helpful error messages
- Loading states prevent layout shift

---

## 📊 Before & After Metrics

### Before Refactoring:
- **resume-editor.tsx:** 986 lines
- **Form duplication:** ~60% code similarity across forms
- **Validation:** Scattered across 8+ files
- **Reusability:** Low (hard to extract components)

### After Refactoring (Target):
- **resume-editor.tsx:** ~300 lines (70% reduction)
- **Form duplication:** <20% (shared components)
- **Validation:** Centralized in 1 location
- **Reusability:** High (forms can be used outside resume editor)

### Developer Experience:
- **Time to add new section:** 30 min → 10 min
- **Time to understand codebase:** 4 hours → 1 hour
- **Bug surface area:** Large → Small

---

## 🎯 Implementation Strategy

### Week 1:
- **Day 1-2:** Tasks 1-3 (Foundation)
- **Day 3-4:** Tasks 4-5 (Component extraction)
- **Day 5:** Task 6 (Section wrapper)

### Week 2:
- **Day 1-2:** Task 7 (Work experience refactor)
- **Day 3:** Task 8 (Education refactor)
- **Day 4-5:** Task 9 (Standardize all forms)

### Week 3:
- **Day 1:** Task 10 (Error boundaries)
- **Day 2-3:** Testing and bug fixes
- **Day 4:** Documentation updates
- **Day 5:** Code review and polish

---

## ✅ Testing Checklist

After each task:
- [ ] All existing functionality still works
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Forms save/load correctly
- [ ] Auto-save still works
- [ ] Mobile and desktop both work
- [ ] Preview updates in real-time

---

## 📝 Notes

- **DO NOT change functionality** - only refactor structure
- **Keep localStorage working** - don't break auto-save
- **Test after each task** - don't accumulate bugs
- **Commit after each task** - easy to rollback if needed
- **Update CLAUDE.md** after completion with new patterns

---

## 🚀 Next Steps After Completion

Once these tasks are done, the codebase will be ready for:
1. Adding new features (easier to extend)
2. Writing tests (components are smaller and focused)
3. Onboarding new developers (clearer patterns)
4. Performance optimizations (easier to identify bottlenecks)

---

**Questions?** Review each task before starting. Adjust time estimates based on your pace.
