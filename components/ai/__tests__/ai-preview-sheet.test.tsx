import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiPreviewSheet } from '../ai-preview-sheet';

describe('AiPreviewSheet', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Test Title',
    status: 'ready' as const,
  };

  it('should render title and description', () => {
    render(
      <AiPreviewSheet
        {...defaultProps}
        description="Test description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should show status badge for ready state', () => {
    render(<AiPreviewSheet {...defaultProps} status="ready" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('should show status badge for running state', () => {
    render(<AiPreviewSheet {...defaultProps} status="running" />);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
  });

  it('should show status badge for applied state', () => {
    render(<AiPreviewSheet {...defaultProps} status="applied" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('should show status badge for error state', () => {
    render(<AiPreviewSheet {...defaultProps} status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should display suggestion text in textarea when no children', () => {
    render(
      <AiPreviewSheet
        {...defaultProps}
        suggestion="This is a test suggestion"
      />
    );

    expect(screen.getByText('This is a test suggestion')).toBeInTheDocument();
  });

  it('should render custom children instead of default textarea', () => {
    render(
      <AiPreviewSheet {...defaultProps}>
        <div data-testid="custom-content">
          <button>Custom Add Button</button>
          <span>Custom skill item</span>
        </div>
      </AiPreviewSheet>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Add Button')).toBeInTheDocument();
    expect(screen.getByText('Custom skill item')).toBeInTheDocument();
    // Should NOT show the default textarea when children are provided
    expect(screen.queryByText('AI suggestion')).not.toBeInTheDocument();
  });

  it('should show Apply button when onApply is provided', () => {
    const onApply = vi.fn();
    render(
      <AiPreviewSheet
        {...defaultProps}
        suggestion="Test"
        onApply={onApply}
      />
    );

    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('should call onApply when Apply button is clicked', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(
      <AiPreviewSheet
        {...defaultProps}
        suggestion="Test"
        onApply={onApply}
      />
    );

    await user.click(screen.getByRole('button', { name: /apply/i }));
    expect(onApply).toHaveBeenCalled();
  });

  it('should show Undo button when onUndo is provided', () => {
    const onUndo = vi.fn();
    render(
      <AiPreviewSheet
        {...defaultProps}
        onUndo={onUndo}
        canUndo={true}
      />
    );

    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('should call onUndo when Undo button is clicked', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();

    render(
      <AiPreviewSheet
        {...defaultProps}
        onUndo={onUndo}
        canUndo={true}
      />
    );

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(onUndo).toHaveBeenCalled();
  });

  it('should disable Undo button when canUndo is false', () => {
    const onUndo = vi.fn();
    render(
      <AiPreviewSheet
        {...defaultProps}
        onUndo={onUndo}
        canUndo={false}
      />
    );

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it('should disable Apply button when no suggestion', () => {
    const onApply = vi.fn();
    render(
      <AiPreviewSheet
        {...defaultProps}
        onApply={onApply}
        suggestion=""
      />
    );

    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
  });

  it('should show loading spinner when isApplying is true', () => {
    const onApply = vi.fn();
    render(
      <AiPreviewSheet
        {...defaultProps}
        suggestion="Test"
        onApply={onApply}
        isApplying={true}
      />
    );

    // Button should be disabled when applying
    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
  });

  it('should show both current and suggestion when previousText is provided', () => {
    render(
      <AiPreviewSheet
        {...defaultProps}
        previousText="Current content"
        suggestion="New suggestion"
      />
    );

    expect(screen.getAllByText('Current').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, element) => element?.textContent === 'Current content').length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, element) => element?.textContent === 'New suggestion').length
    ).toBeGreaterThan(0);
  });

  it('should render children with interactive elements', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <AiPreviewSheet {...defaultProps}>
        <div>
          <button onClick={handleClick}>Interactive Button</button>
        </div>
      </AiPreviewSheet>
    );

    await user.click(screen.getByText('Interactive Button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render list of selectable items as children', () => {
    const items = [
      { name: 'TypeScript', category: 'Technical' },
      { name: 'React', category: 'Framework' },
      { name: 'Node.js', category: 'Technical' },
    ];

    render(
      <AiPreviewSheet {...defaultProps}>
        <div data-testid="items-list">
          {items.map((item) => (
            <div key={item.name} data-testid={`item-${item.name}`}>
              <span>{item.name}</span>
              <span>{item.category}</span>
              <button>Add</button>
            </div>
          ))}
        </div>
      </AiPreviewSheet>
    );

    expect(screen.getByTestId('items-list')).toBeInTheDocument();
    expect(screen.getByTestId('item-TypeScript')).toBeInTheDocument();
    expect(screen.getByTestId('item-React')).toBeInTheDocument();
    expect(screen.getByTestId('item-Node.js')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /add/i })).toHaveLength(3);
  });
});
