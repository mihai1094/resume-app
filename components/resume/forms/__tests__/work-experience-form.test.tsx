import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkExperienceForm } from '../work-experience-form';
import { WorkExperience } from '@/lib/types/resume';
import { generateId } from '@/lib/utils';

// Mock hooks
vi.mock('@/hooks/use-form-array', () => ({
  useFormArray: vi.fn(({ items, onAdd, onUpdate, onRemove, onReorder }) => ({
    items,
    expandedIds: new Set([items[0]?.id]),
    isExpanded: (id: string) => items[0]?.id === id,
    handleAdd: onAdd,
    handleUpdate: onUpdate,
    handleRemove: onRemove,
    handleToggle: vi.fn(),
    dragAndDrop: {
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDrop: vi.fn(),
      handleDragEnd: vi.fn(),
    },
  })),
}));

vi.mock('@/hooks/use-touched-fields', () => ({
  useTouchedFields: vi.fn(() => ({
    markTouched: vi.fn(),
    markErrors: vi.fn(),
    getFieldError: vi.fn(() => undefined),
  })),
}));

vi.mock('@/lib/validation', () => ({
  validateWorkExperience: vi.fn(() => ({})),
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
    achievements: ['Achievement 1'],
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

    const addButton = screen.getByRole('button', { name: /add.*experience/i });
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

    const addButton = screen.getByRole('button', { name: /add.*experience/i });
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

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
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

    const companyInput = screen.getByLabelText(/company/i);
    await user.clear(companyInput);
    await user.type(companyInput, 'New Company');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ company: 'New Company' })
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

    const positionInput = screen.getByLabelText(/position/i);
    await user.clear(positionInput);
    await user.type(positionInput, 'Senior Engineer');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ position: 'Senior Engineer' })
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

    const currentCheckbox = screen.getByLabelText(/current job/i);
    await user.click(currentCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      defaultExperience.id,
      expect.objectContaining({ current: true })
    );
  });

  it('should call onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);

    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove|delete/i });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith(defaultExperience.id);
  });

  it('should not remove when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);

    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove|delete/i });
    await user.click(removeButton);

    expect(mockOnRemove).not.toHaveBeenCalled();
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

    expect(screen.getByRole('button', { name: /add.*experience/i })).toBeInTheDocument();
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

  it('should display description field', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // Description is typically a textarea
    const descriptionField = screen.getByLabelText(/description/i);
    expect(descriptionField).toBeInTheDocument();
  });

  it('should display achievements field', () => {
    render(
      <WorkExperienceForm
        experiences={[defaultExperience]}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

    // Achievements field should be present
    const achievementsField = screen.getByLabelText(/achievements/i);
    expect(achievementsField).toBeInTheDocument();
  });
});

