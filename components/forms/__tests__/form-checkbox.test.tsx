import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormCheckbox } from '../form-checkbox';

describe('FormCheckbox', () => {
  it('should render label and checkbox', () => {
    const onCheckedChange = vi.fn();
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );

    expect(screen.getByLabelText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should call onCheckedChange when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should reflect checked state', () => {
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={true}
        onCheckedChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should display error message when error is provided', () => {
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={false}
        onCheckedChange={vi.fn()}
        error="You must accept the terms"
      />
    );

    expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={false}
        onCheckedChange={vi.fn()}
        helperText="Please read the terms carefully"
      />
    );

    expect(screen.getByText('Please read the terms carefully')).toBeInTheDocument();
  });

  it('should display required indicator when required', () => {
    render(
      <FormCheckbox
        label="Required Checkbox"
        checked={false}
        onCheckedChange={vi.fn()}
        required
      />
    );

    const label = screen.getByText('Required Checkbox');
    expect(label).toHaveTextContent('*');
  });

  it('should not display helper text when error is present', () => {
    render(
      <FormCheckbox
        label="Accept Terms"
        checked={false}
        onCheckedChange={vi.fn()}
        error="Error message"
        helperText="Helper text"
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should set aria-required when required', () => {
      render(
        <FormCheckbox
          label="Required Checkbox"
          checked={false}
          onCheckedChange={vi.fn()}
          required
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when error exists', () => {
      render(
        <FormCheckbox
          label="Accept Terms"
          checked={false}
          onCheckedChange={vi.fn()}
          error="Error message"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with checkbox via aria-describedby', () => {
      render(
        <FormCheckbox
          label="Accept Terms"
          checked={false}
          onCheckedChange={vi.fn()}
          error="Error message"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const errorId = checkbox.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('should mark error message with role="alert"', () => {
      render(
        <FormCheckbox
          label="Accept Terms"
          checked={false}
          onCheckedChange={vi.fn()}
          error="Error message"
        />
      );

      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});

