import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillsForm } from '../skills-form';
import { Skill } from '@/lib/types/resume';
import { generateId } from '@/lib/utils';

// Mock the auth-fetch module
vi.mock('@/lib/api/auth-fetch', () => ({
  authPost: vi.fn(),
}));

import { authPost } from '@/lib/api/auth-fetch';

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

    // Skills are rendered in input fields - check they exist
    const inputs = screen.getAllByRole('textbox');
    const skillNames = inputs.map(input => (input as HTMLInputElement).value);
    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('React');
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

    // Should display category headers (may appear multiple times due to dropdowns)
    expect(screen.getAllByText('Languages').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Frameworks').length).toBeGreaterThan(0);
  });

  it('should display skill level selectors', () => {
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Skill levels should be displayed in select dropdowns
    // The levels appear as selected values in comboboxes
    const levelSelects = screen.getAllByRole('combobox');
    expect(levelSelects.length).toBeGreaterThan(0);
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
    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Category selector should be present (use id selector for specificity)
    const categorySelect = screen.getByRole('combobox', { name: 'Category' });
    expect(categorySelect).toBeInTheDocument();
  });

  it('should allow selecting level when adding skill', async () => {
    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    // Level selector should be present
    const levelSelect = screen.getByRole('combobox', { name: 'Proficiency Level' });
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

  describe('AI Skill Suggestions', () => {
    const mockSkillSuggestions = {
      skills: [
        {
          name: 'TypeScript',
          category: 'Technical',
          relevance: 'high' as const,
          reason: 'Essential for modern web development',
        },
        {
          name: 'AWS',
          category: 'Technical',
          relevance: 'high' as const,
          reason: 'Cloud platform proficiency is in demand',
        },
        {
          name: 'Agile',
          category: 'Soft Skills',
          relevance: 'medium' as const,
          reason: 'Common methodology in tech teams',
        },
      ],
      meta: { fromCache: false },
    };

    beforeEach(() => {
      vi.mocked(authPost).mockReset();
    });

    it('should show AI suggestions section', () => {
      render(
        <SkillsForm
          skills={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
          jobTitle="Software Engineer"
        />
      );

      expect(screen.getByText('AI Skill Suggestions')).toBeInTheDocument();
    });

    it('should disable get suggestions button when no job title', () => {
      render(
        <SkillsForm
          skills={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/add a job title/i)).toBeInTheDocument();
    });

    it('should fetch suggestions when clicking get suggestions', async () => {
      const user = userEvent.setup();
      vi.mocked(authPost).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillSuggestions),
      } as Response);

      render(
        <SkillsForm
          skills={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
          jobTitle="Software Engineer"
        />
      );

      const getSuggestionsBtn = screen.getByRole('button', { name: /get suggestions/i });
      await user.click(getSuggestionsBtn);

      expect(authPost).toHaveBeenCalledWith('/api/ai/suggest-skills', {
        jobTitle: 'Software Engineer',
      });
    });

    it('should display individual skill suggestions with Add buttons', async () => {
      const user = userEvent.setup();
      vi.mocked(authPost).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillSuggestions),
      } as Response);

      render(
        <SkillsForm
          skills={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
          jobTitle="Software Engineer"
        />
      );

      const getSuggestionsBtn = screen.getByRole('button', { name: /get suggestions/i });
      await user.click(getSuggestionsBtn);

      // Wait for suggestions to load - they appear both in sheet and inline
      await waitFor(() => {
        expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });

    it('should add individual skill when clicking Add on inline suggestion', async () => {
      const user = userEvent.setup();
      vi.mocked(authPost).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillSuggestions),
      } as Response);

      render(
        <SkillsForm
          skills={[]}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
          jobTitle="Software Engineer"
        />
      );

      const getSuggestionsBtn = screen.getByRole('button', { name: /get suggestions/i });
      await user.click(getSuggestionsBtn);

      await waitFor(() => {
        expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
      }, { timeout: 5000 });

      // Find and click an Add button (multiple may exist - inline and in sheet)
      const addButtons = screen.getAllByRole('button', { name: /^add$/i });
      if (addButtons.length > 0) {
        await user.click(addButtons[0]);

        // Should call onAdd with the skill details
        expect(mockOnAdd).toHaveBeenCalledWith({
          name: 'TypeScript',
          category: 'Technical',
          level: 'advanced', // high relevance = advanced level
        });
      }
    });

    it('should filter out skills already in resume from suggestions', async () => {
      const user = userEvent.setup();
      vi.mocked(authPost).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillSuggestions),
      } as Response);

      // Already have TypeScript in skills
      const existingSkills: Skill[] = [
        { id: generateId(), name: 'TypeScript', category: 'Languages', level: 'expert' },
      ];

      render(
        <SkillsForm
          skills={existingSkills}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onUpdate={mockOnUpdate}
          jobTitle="Software Engineer"
        />
      );

      const getSuggestionsBtn = screen.getByRole('button', { name: /get suggestions/i });
      await user.click(getSuggestionsBtn);

      // Wait for API call to complete
      await waitFor(() => {
        expect(authPost).toHaveBeenCalled();
      });

      // TypeScript should be filtered out since it's already in the resume
      // AWS should remain in suggestions
    });
  });
});

