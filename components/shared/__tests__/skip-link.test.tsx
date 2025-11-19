import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipLink } from '../skip-link';

describe('SkipLink', () => {
  it('should render skip link', () => {
    render(
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    );

    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should be hidden by default (sr-only)', () => {
    render(
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    );

    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('sr-only');
  });

  it('should be visible on focus', async () => {
    const user = userEvent.setup();
    render(
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    );

    const link = screen.getByText('Skip to main content');
    await user.tab();

    // When focused, it should have focus:not-sr-only class
    expect(link).toHaveClass('focus:not-sr-only');
  });

  it('should have proper focus styles', () => {
    render(
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    );

    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('focus:absolute');
    expect(link).toHaveClass('focus:z-50');
    expect(link).toHaveClass('focus:px-4');
    expect(link).toHaveClass('focus:py-2');
    expect(link).toHaveClass('focus:bg-primary');
    expect(link).toHaveClass('focus:text-primary-foreground');
    expect(link).toHaveClass('focus:rounded-md');
    expect(link).toHaveClass('focus:shadow-lg');
    expect(link).toHaveClass('focus:outline-none');
    expect(link).toHaveClass('focus:ring-2');
  });
});

