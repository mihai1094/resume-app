import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkExperienceForm } from '../work-experience-form';
import { WorkExperience } from '@/lib/types/resume';
import { generateId } from '@/lib/utils';

// Mock useFormArray to expose items expanded by default
vi.mock('@/hooks/use-form-array', () => ({
  useFormArray: vi.fn(({ items, onAdd, onUpdate, onRemove }) => ({
    items,
    expandedIds: new Set(items.map((i: { id: string }) => i.id)),
    isExpanded: () => true,
    handleAdd: onAdd,
    handleUpdate: onUpdate,
    handleRemove: onRemove,
    handleToggle: vi.fn(),
    confirmationState: null,
    closeConfirmation: vi.fn(),
    handleConfirm: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-array-field-validation', () => ({
  useArrayFieldValidation: vi.fn(() => ({
    getFieldError: vi.fn(() => undefined),
    markFieldTouched: vi.fn(),
    markErrors: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-smart-placeholder', () => ({
  useSmartPlaceholder: vi.fn(() => ({
    placeholder: '',
    isAnimating: false,
  })),
}));

// Mock SortableList to render items directly without framer-motion
vi.mock('@/components/ui/sortable-list', () => ({
  SortableList: ({ items, renderItem }: { items: unknown[]; renderItem: (item: unknown, index: number, isDragging: boolean) => React.ReactNode }) => (
    <div>{items.map((item, index) => <div key={index}>{renderItem(item, index, false)}</div>)}</div>
  ),
  DragHandle: () => <div data-testid="drag-handle" />,
}));

// Mock AI-related hooks and components
vi.mock('@/hooks/use-ai-action', () => ({
  useAiAction: vi.fn(() => ({
    status: 'idle',
    suggestion: null,
    canUndo: false,
    run: vi.fn(),
    apply: vi.fn(),
    undo: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-bullet-tips', () => ({
  useBulletTips: vi.fn(() => []),
}));

vi.mock('@/hooks/use-ghost-suggestion', () => ({
  useGhostSuggestion: vi.fn(() => ({
    suggestion: null,
    isLoading: false,
    isVisible: false,
    accept: vi.fn(),
    dismiss: vi.fn(),
  })),
}));

vi.mock('@/components/ai/ai-action', () => ({
  AiAction: () => null,
}));

vi.mock('@/components/ai/ai-preview-sheet', () => ({
  AiPreviewSheet: () => null,
}));

vi.mock('@/components/shared/confirmation-dialog', () => ({
  ConfirmationDialog: () => null,
}));

vi.mock('../writing-tips', () => ({
  WritingTips: () => null,
}));

vi.mock('./ghost-suggestion', () => ({
  GhostSuggestion: () => null,
}));

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    formatDate: vi.fn((date: string) => date || ''),
    calculateDuration: vi.fn(() => '2 years'),
  };
});

describe('WorkExperienceForm', () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnReorder = vi.fn();

  const defaultExperience: WorkExperience = {
    id: generateId(),
    company: 'Test Company',
    position: 'Software Engineer',
    location: 'Remote',
    startDate: '2020-01',
    endDate: '2022-12',
    current: false,
    description: ['Worked on projects'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with work experience entries', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
  });

  it('should render add button', () => {
    render(
      <WorkExperienceForm
        experiences={[]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // Empty state shows "Add Position" button
    const addButton = screen.getByRole('button', { name: /add position/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should call onAdd when add button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <WorkExperienceForm
        experiences={[]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const addButton = screen.getByRole('button', { name: /add position/i });
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('should render all fields for work experience entry', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
  });

  it('should call onUpdate when company is changed', async () => {
    const user = userEvent.setup();
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const companyInput = screen.getByLabelText(/Company Name/);
    await user.type(companyInput, 'X');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ company: 'Test CompanyX' })
    );
  });

  it('should call onUpdate when position is changed', async () => {
    const user = userEvent.setup();
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const positionInput = screen.getByLabelText(/Position Title/);
    await user.type(positionInput, 'X');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ position: 'Software EngineerX' })
    );
  });

  it('should handle current job checkbox', async () => {
    const user = userEvent.setup();
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const currentCheckbox = screen.getByLabelText(/I currently work here/i);
    await user.click(currentCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ current: true, endDate: '' })
    );
  });

  it('should call onRemove when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // The Trash2 icon button doesn't have text, find by the trash icon's parent button
    const trashButtons = screen.getAllByRole('button');
    // Find the button that contains the trash icon (it's a ghost variant with hover:text-destructive)
    const deleteButton = trashButtons.find(
      (btn) => btn.querySelector('.lucide-trash2')
    );
    expect(deleteButton).toBeTruthy();
    await user.click(deleteButton!);

    expect(mockOnRemove).toHaveBeenCalledWith(defaultExperience.id);
  });

  it('should handle empty experiences array', () => {
    render(
      <WorkExperienceForm
        experiences={[]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // Shows empty state with action button
    expect(screen.getByRole('button', { name: /add position/i })).toBeInTheDocument();
    expect(screen.getByText(/share your professional journey/i)).toBeInTheDocument();
  });

  it('should handle multiple work experience entries', () => {
    const experiences: WorkExperience[] = [
      defaultExperience,
      {
        ...defaultExperience,
        id: generateId(),
        company: 'Another Company',
        position: 'Developer',
      },
    ];

    render(
      <WorkExperienceForm
        experiences={experiences}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Another Company')).toBeInTheDocument();
  });

  it('should display description section with bullets', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // Description label is rendered as a plain label element
    expect(screen.getByText('Description')).toBeInTheDocument();
    // The bullet text should be in a textarea
    expect(screen.getByDisplayValue('Worked on projects')).toBeInTheDocument();
  });

  it('should have add bullet button', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByRole('button', { name: /add bullet/i })).toBeInTheDocument();
  });

  it('should render "Add Another Position" button when items exist', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    expect(screen.getByRole('button', { name: /add another position/i })).toBeInTheDocument();
  });
});

