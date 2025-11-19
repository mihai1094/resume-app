# Resume Forms Pattern Guide

All form components should follow this structure for consistency and maintainability.

## 1. Use Shared Components

Always use the shared form components from `@/components/forms`:

- **`FormField`** - For text inputs (name, email, phone, etc.)
- **`FormTextarea`** - For multi-line text (summaries, descriptions)
- **`FormDatePicker`** - For date selection (start/end dates)
- **`FormCheckbox`** - For boolean inputs (current job, current study)

### Example:
```typescript
import { FormField, FormTextarea, FormDatePicker, FormCheckbox } from "@/components/forms";

<FormField
  label="Company Name"
  value={exp.company}
  onChange={(val) => handleUpdate(exp.id, { company: val })}
  placeholder="Tech Corp"
  required
  error={getFieldError(index, "company")}
  icon={<Building2 className="w-4 h-4" />}
/>
```

## 2. Validation

Import validators from `@/lib/validation` and show errors inline:

```typescript
import { validateWorkExperience, validatePersonalInfo } from "@/lib/validation";

// Get validation errors
const validationErrors = validateWorkExperience(experiences);

// Helper to get field-specific error
const getFieldError = (index: number, field: string): string | undefined => {
  return validationErrors.find(
    (e) => e.field === `experience.${index}.${field}`
  )?.message;
};

// Use in form field
<FormField
  error={getFieldError(index, "company")}
  // ... other props
/>
```

## 3. Array Forms

Use `useFormArray` hook for managing lists of items:

```typescript
import { useFormArray } from "@/hooks/use-form-array";

const {
  items,
  expandedIds,
  isExpanded,
  handleAdd,
  handleUpdate,
  handleRemove,
  handleToggle,
  dragAndDrop,
} = useFormArray({
  items: experiences,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  isItemComplete: (exp) => !!(exp.position && exp.company && exp.startDate),
  autoExpandIncomplete: true,
});
```

### Features:
- **Auto-expand incomplete entries** - Ensures users see what needs to be filled
- **Collapse complete entries** - Keeps the form clean
- **Drag and drop** - Integrated via `dragAndDrop` object
- **Confirmation dialogs** - Built-in for remove operations

## 4. Props Interface

All array forms should follow this interface pattern:

```typescript
interface FormProps {
  data: DataType | DataType[];  // Single item or array
  onAdd?: () => void;           // For array forms
  onUpdate: (id: string, updates: Partial<DataType>) => void;
  onRemove?: (id: string) => void;  // For array forms
  onReorder?: (startIndex: number, endIndex: number) => void;  // For array forms
}
```

## 5. Form Structure

### Single Item Forms (e.g., PersonalInfoForm):
```typescript
export function PersonalInfoForm({ data, onChange }: Props) {
  const validationErrors = validatePersonalInfo(data);

  return (
    <div className="space-y-6">
      <FormField ... />
      <FormField ... />
    </div>
  );
}
```

### Array Forms (e.g., WorkExperienceForm):
```typescript
export function WorkExperienceForm({ experiences, onAdd, onUpdate, onRemove, onReorder }: Props) {
  const { items, isExpanded, handleAdd, handleUpdate, handleRemove, handleToggle } = useFormArray({...});
  const validationErrors = validateWorkExperience(experiences);

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <>
          {items.map((item, index) => (
            <Card>
              <CardHeader onClick={() => handleToggle(item.id)}>
                {/* Summary */}
              </CardHeader>
              {isExpanded(item.id) && (
                <CardContent>
                  <FormField ... />
                  <FormDatePicker ... />
                </CardContent>
              )}
            </Card>
          ))}
          <Button onClick={handleAdd}>Add Another</Button>
        </>
      )}
    </div>
  );
}
```

## 6. Best Practices

1. **Always validate** - Use the centralized validation system
2. **Show errors inline** - Pass errors to form fields
3. **Use icons** - Add relevant icons to form fields for better UX
4. **Provide helper text** - Use `helperText` prop for guidance
5. **Handle empty states** - Show helpful empty states with action buttons
6. **Consistent spacing** - Use `space-y-6` for form sections
7. **Grid layouts** - Use `grid grid-cols-1 md:grid-cols-2 gap-4` for side-by-side fields

## Example Usage

See these files as reference implementations:
- **`work-experience-form.tsx`** - Complex array form with drag-and-drop
- **`education-form.tsx`** - Array form with validation
- **`personal-info-form.tsx`** - Single item form with validation

## Migration Checklist

When refactoring an existing form:

- [ ] Replace `Input` with `FormField`
- [ ] Replace `Textarea` with `FormTextarea` (or use `Textarea` directly for bullet lists)
- [ ] Replace `MonthPicker` wrapper with `FormDatePicker`
- [ ] Replace `Checkbox` + `Label` with `FormCheckbox`
- [ ] Add validation using centralized validators
- [ ] Use `useFormArray` for array forms
- [ ] Show errors inline on each field
- [ ] Add icons to form fields
- [ ] Test all functionality still works

