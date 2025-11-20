import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillsForm } from '../skills-form';
import { Skill } from '@/lib/types/resume';
import { generateId } from '@/lib/utils';

describe('SkillsForm', () => {
  const mockOnAdd = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnUpdate = vi.fn();

  const defaultSkills: Skill[] = [
    {
      id: generateId(),
      name: 'TypeScript',
      category: 'Languages',
      level: 'expert',
    },
    {
      id: generateId(),
      name: 'React',
      category: 'Frameworks',
      level: 'advanced',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skills list', () => {
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should render add skill input fields', () => {
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByPlaceholderText(/add.*skill/i)).toBeInTheDocument();
  });

  it('should call onAdd when adding a new skill', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const skillInput = screen.getByPlaceholderText(/add.*skill/i);
    await user.type(skillInput, 'Python');

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: 'Python',
      category: expect.any(String),
      level: expect.any(String),
    });
  });

  it('should not add skill with empty name', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should add skill on Enter key press', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const skillInput = screen.getByPlaceholderText(/add.*skill/i);
    await user.type(skillInput, 'JavaScript');
    await user.keyboard('{Enter}');

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it('should call onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove|delete/i });
    await user.click(removeButtons[0]);

    expect(mockOnRemove).toHaveBeenCalledWith(defaultSkills[0].id);
  });

  it('should group skills by category', () => {
    const skills: Skill[] = [
      { id: generateId(), name: 'TypeScript', category: 'Languages', level: 'expert' },
      { id: generateId(), name: 'JavaScript', category: 'Languages', level: 'advanced' },
      { id: generateId(), name: 'React', category: 'Frameworks', level: 'expert' },
    ];

    render(
      <SkillsForm
        skills={skills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Should display category headers
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('Frameworks')).toBeInTheDocument();
  });

  it('should display skill level badges', () => {
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Level badges should be displayed
    expect(screen.getByText('expert')).toBeInTheDocument();
    expect(screen.getByText('advanced')).toBeInTheDocument();
  });

  it('should handle empty skills array', () => {
    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByPlaceholderText(/add.*skill/i)).toBeInTheDocument();
  });

  it('should allow selecting category when adding skill', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Category selector should be present
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    expect(categorySelect).toBeInTheDocument();
  });

  it('should allow selecting level when adding skill', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Level selector should be present
    const levelSelect = screen.getByRole('combobox', { name: /level/i });
    expect(levelSelect).toBeInTheDocument();
  });

  it('should clear input after adding skill', async () => {
    const user = userEvent.setup();
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const skillInput = screen.getByPlaceholderText(/add.*skill/i) as HTMLInputElement;
    await user.type(skillInput, 'Python');

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Input should be cleared
    expect(skillInput.value).toBe('');
  });
});

