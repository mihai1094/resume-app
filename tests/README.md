# Testing

This project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react) for unit testing.

## Setup

Install dependencies:

```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

- `lib/validation/__tests__/` - Validation logic tests
- `hooks/__tests__/` - Custom hooks tests
- `components/forms/__tests__/` - Form component tests

## Writing Tests

### Example: Testing a Component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../form-field';

describe('FormField', () => {
  it('should render correctly', () => {
    render(<FormField label="Test" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
  });
});
```

### Example: Testing a Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldValidation } from '../use-field-validation';

describe('useFieldValidation', () => {
  it('should validate correctly', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    act(() => {
      result.current.validate('invalid-email');
    });

    expect(result.current.error).toBe('Invalid email format');
  });
});
```

## Test Coverage Goals

- **Validation logic**: 100% coverage
- **Hooks**: 90%+ coverage
- **Components**: 80%+ coverage

