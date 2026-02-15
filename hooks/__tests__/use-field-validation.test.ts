import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldValidation } from '../use-field-validation';
import { validators } from '@/lib/validation';

describe('useFieldValidation', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));
    expect(result.current.error).toBeNull();
  });

  it('should set error when validation fails', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    act(() => {
      result.current.validate('invalid-email');
    });

    expect(result.current.error).toBe('Invalid email format');
  });

  it('should clear error when validation passes', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    act(() => {
      result.current.validate('invalid-email');
    });
    expect(result.current.error).toBe('Invalid email format');

    act(() => {
      result.current.validate('valid@example.com');
    });
    expect(result.current.error).toBeNull();
  });

  it('should return true when validation passes', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate('valid@example.com');
    });

    expect(isValid!).toBe(true);
  });

  it('should return false when validation fails', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate('invalid-email');
    });

    expect(isValid!).toBe(false);
  });

  it('should allow manual error setting', () => {
    const { result } = renderHook(() => useFieldValidation(validators.email));

    act(() => {
      result.current.setError('Custom error');
    });

    expect(result.current.error).toBe('Custom error');
  });

  it('should work with required validator', () => {
    const { result } = renderHook(() => useFieldValidation(validators.required));

    act(() => {
      result.current.validate('');
    });
    expect(result.current.error).toBe('This field is required');

    act(() => {
      result.current.validate('value');
    });
    expect(result.current.error).toBeNull();
  });

  it('should work with phone validator', () => {
    const { result } = renderHook(() => useFieldValidation(validators.phone));

    act(() => {
      result.current.validate('123');
    });
    expect(result.current.error).toBe('Use a valid phone with country/area code');

    act(() => {
      result.current.validate('1234567890');
    });
    expect(result.current.error).toBeNull();
  });
});

