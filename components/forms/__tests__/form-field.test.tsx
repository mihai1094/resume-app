import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '../form-field';
import { Mail } from 'lucide-react';

describe('FormField', () => {
  it('should render label and input', () => {
    const onChange = vi.fn();
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display required indicator when required', () => {
    render(
      <FormField
        label="Required Field"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    const label = screen.getByText('Required Field');
    expect(label.parentElement).toHaveTextContent('*');
  });

  it('should call onChange when input value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(onChange).toHaveBeenCalled();
  });

  it('should display error message when error is provided', () => {
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={vi.fn()}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-destructive');
  });

  it('should display helper text when no error', () => {
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={vi.fn()}
        helperText="This is helpful text"
      />
    );

    expect(screen.getByText('This is helpful text')).toBeInTheDocument();
  });

  it('should not display helper text when error is present', () => {
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={vi.fn()}
        error="Error message"
        helperText="Helper text"
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <FormField
        label="Email"
        value=""
        onChange={vi.fn()}
        icon={<Mail data-testid="mail-icon" />}
      />
    );

    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
  });

  it('should apply error styling to input when error exists', () => {
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={vi.fn()}
        error="Error message"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
  });

  it('should support different input types', () => {
    render(
      <FormField
        label="Email"
        value=""
        onChange={vi.fn()}
        type="email"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should display placeholder', () => {
    render(
      <FormField
        label="Test Field"
        value=""
        onChange={vi.fn()}
        placeholder="Enter value"
      />
    );

    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should associate label with input using htmlFor', () => {
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Field');
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('should set aria-required when required', () => {
      render(
        <FormField
          label="Required Field"
          value=""
          onChange={vi.fn()}
          required
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when error exists', () => {
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with input via aria-describedby', () => {
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('should associate helper text with input via aria-describedby', () => {
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
          helperText="Helper text"
        />
      );

      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(screen.getByText('Helper text')).toHaveAttribute('id', describedBy);
    });

    it('should mark error message with role="alert"', () => {
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should call onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(
        <FormField
          label="Test Field"
          value=""
          onChange={vi.fn()}
          onBlur={onBlur}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it('should have accessible required indicator', () => {
      render(
        <FormField
          label="Required Field"
          value=""
          onChange={vi.fn()}
          required
        />
      );

      const asterisk = screen.getByLabelText('required');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveTextContent('*');
    });
  });
});

