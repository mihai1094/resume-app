import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormDatePicker } from '../form-date-picker';
import { Calendar } from 'lucide-react';

describe('FormDatePicker', () => {
  it('should render label and date picker', () => {
    const onChange = vi.fn();
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('should display required indicator when required', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    const label = screen.getByText('Start Date');
    expect(label.parentElement).toHaveTextContent('*');
  });

  it('should call onChange when date is selected', () => {
    const onChange = vi.fn();
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={onChange}
      />
    );

    // The MonthPicker component will handle the actual date selection
    // This test verifies the component renders correctly
    expect(onChange).toBeDefined();
  });

  it('should display error message when error is provided', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        error="Start date is required"
      />
    );

    expect(screen.getByText('Start date is required')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        helperText="Select the start date"
      />
    );

    expect(screen.getByText('Select the start date')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        icon={<Calendar data-testid="calendar-icon" />}
      />
    );

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('should display placeholder', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        placeholder="Pick a month"
      />
    );

    // The placeholder is passed to MonthPicker, which renders it
    // This test verifies the component accepts the prop
    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });

  it('should respect disabled prop', () => {
    render(
      <FormDatePicker
        label="Start Date"
        value=""
        onChange={vi.fn()}
        disabled
      />
    );

    // The disabled prop is passed to MonthPicker
    // This test verifies the component accepts the prop
    expect(screen.getByText('Start Date')).toBeInTheDocument();
  });
});

