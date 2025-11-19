import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormTextarea } from '../form-textarea';

describe('FormTextarea', () => {
  it('should render label and textarea', () => {
    const onChange = vi.fn();
    render(
      <FormTextarea
        label="Description"
        value=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should call onChange when textarea value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FormTextarea
        label="Description"
        value=""
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'test description');

    expect(onChange).toHaveBeenCalled();
  });

  it('should display error message when error is provided', () => {
    render(
      <FormTextarea
        label="Description"
        value=""
        onChange={vi.fn()}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display character count when showCharacterCount is true', () => {
    render(
      <FormTextarea
        label="Description"
        value="Test"
        onChange={vi.fn()}
        showCharacterCount
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should display character count with max length', () => {
    render(
      <FormTextarea
        label="Description"
        value="Test"
        onChange={vi.fn()}
        showCharacterCount
        maxLength={100}
      />
    );

    expect(screen.getByText('4 / 100')).toBeInTheDocument();
  });

  it('should apply error styling when error exists', () => {
    render(
      <FormTextarea
        label="Description"
        value=""
        onChange={vi.fn()}
        error="Error message"
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-destructive');
  });

  it('should respect rows prop', () => {
    render(
      <FormTextarea
        label="Description"
        value=""
        onChange={vi.fn()}
        rows={5}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should display required indicator when required', () => {
    render(
      <FormTextarea
        label="Required Field"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    const label = screen.getByText('Required Field');
    expect(label.parentElement).toHaveTextContent('*');
  });

  describe('Accessibility', () => {
    it('should set aria-required when required', () => {
      render(
        <FormTextarea
          label="Required Field"
          value=""
          onChange={vi.fn()}
          required
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when error exists', () => {
      render(
        <FormTextarea
          label="Description"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with textarea via aria-describedby', () => {
      render(
        <FormTextarea
          label="Description"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const textarea = screen.getByRole('textbox');
      const errorId = textarea.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('should mark error message with role="alert"', () => {
      render(
        <FormTextarea
          label="Description"
          value=""
          onChange={vi.fn()}
          error="Error message"
        />
      );

      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should include character count in aria-describedby', () => {
      render(
        <FormTextarea
          label="Description"
          value="Test"
          onChange={vi.fn()}
          showCharacterCount
        />
      );

      const textarea = screen.getByRole('textbox');
      const describedBy = textarea.getAttribute('aria-describedby');
      expect(describedBy).toContain('count');
    });

    it('should have aria-live on character count', () => {
      render(
        <FormTextarea
          label="Description"
          value="Test"
          onChange={vi.fn()}
          showCharacterCount
        />
      );

      const count = screen.getByText('4');
      expect(count).toHaveAttribute('aria-live', 'polite');
    });
  });
});

