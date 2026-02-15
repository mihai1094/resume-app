import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonalInfoForm } from '../personal-info-form';
import { PersonalInfo } from '@/lib/types/resume';

// Mock hooks
vi.mock('@/hooks/use-touched-fields', () => ({
  useTouchedFields: vi.fn(() => ({
    markTouched: vi.fn(),
    markErrors: vi.fn(),
    getFieldError: vi.fn(() => undefined),
  })),
}));

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

vi.mock('@/hooks/use-ai-preferences', () => ({
  useAiPreferences: vi.fn(() => ({
    preferences: { tone: 'professional', length: 'medium' },
    setTone: vi.fn(),
    setLength: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-smart-placeholder', () => ({
  useSmartPlaceholder: vi.fn(() => ({
    placeholder: '',
    isAnimating: false,
  })),
}));

vi.mock('@/lib/validation', () => ({
  validatePersonalInfo: vi.fn(() => ({})),
}));

// Mock photo upload to avoid complexity
vi.mock('../photo-upload', () => ({
  PhotoUpload: () => <div data-testid="photo-upload" />,
}));

// Mock AI components
vi.mock('@/components/ai/ai-action', () => ({
  AiAction: () => null,
}));

vi.mock('@/components/ai/ai-preview-sheet', () => ({
  AiPreviewSheet: () => null,
}));

describe('PersonalInfoForm', () => {
  const mockOnChange = vi.fn();
  const defaultData: PersonalInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York',
    website: 'https://johndoe.com',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    summary: 'Software developer',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render core form fields', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
  });

  it('should render link fields when data has values', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Website/)).toBeInTheDocument();
    expect(screen.getByLabelText(/LinkedIn/)).toBeInTheDocument();
    expect(screen.getByLabelText(/GitHub/)).toBeInTheDocument();
  });

  it('should display current values in form fields', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
  });

  it('should call onChange when first name is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const firstNameInput = screen.getByLabelText(/First Name/);
    await user.type(firstNameInput, 'X');

    // onChange is called per keystroke with the appended value
    expect(mockOnChange).toHaveBeenCalledWith({ firstName: 'JohnX' });
  });

  it('should call onChange when last name is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const lastNameInput = screen.getByLabelText(/Last Name/);
    await user.type(lastNameInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ lastName: 'DoeX' });
  });

  it('should call onChange when email is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/Email/);
    await user.type(emailInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ email: 'john@example.comX' });
  });

  it('should call onChange when phone is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const phoneInput = screen.getByLabelText(/Phone/);
    await user.type(phoneInput, '0');

    expect(mockOnChange).toHaveBeenCalledWith({ phone: '123-456-78900' });
  });

  it('should call onChange when location is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const locationInput = screen.getByLabelText(/Location/);
    await user.type(locationInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ location: 'New YorkX' });
  });

  it('should call onChange when website is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const websiteInput = screen.getByLabelText(/Website/);
    await user.type(websiteInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ website: 'https://johndoe.comX' });
  });

  it('should call onChange when LinkedIn is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const linkedinInput = screen.getByLabelText(/LinkedIn/);
    await user.type(linkedinInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ linkedin: 'linkedin.com/in/johndoeX' });
  });

  it('should call onChange when GitHub is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const githubInput = screen.getByLabelText(/GitHub/);
    await user.type(githubInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ github: 'github.com/johndoeX' });
  });

  it('should call onChange when summary is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    // Summary textarea has empty label, find by display value instead
    const summaryInput = screen.getByDisplayValue('Software developer');
    await user.type(summaryInput, 'X');

    expect(mockOnChange).toHaveBeenCalledWith({ summary: 'Software developerX' });
  });

  it('should render Professional Summary section', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
  });

  it('should render Personal Details section', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Personal Details')).toBeInTheDocument();
  });

  it('should mark fields as required', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const firstNameInput = screen.getByLabelText(/First Name/);
    expect(firstNameInput).toHaveAttribute('aria-required', 'true');

    const lastNameInput = screen.getByLabelText(/Last Name/);
    expect(lastNameInput).toHaveAttribute('aria-required', 'true');

    const emailInput = screen.getByLabelText(/Email/);
    expect(emailInput).toHaveAttribute('aria-required', 'true');

    const phoneInput = screen.getByLabelText(/Phone/);
    expect(phoneInput).toHaveAttribute('aria-required', 'true');

    const locationInput = screen.getByLabelText(/Location/);
    expect(locationInput).toHaveAttribute('aria-required', 'true');
  });

  it('should hide link fields when data has no values for them', () => {
    const minimalData: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'New York',
    };

    render(<PersonalInfoForm data={minimalData} onChange={mockOnChange} />);

    // Link fields should not be visible when no data
    expect(screen.queryByLabelText(/Website/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/LinkedIn/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/GitHub/)).not.toBeInTheDocument();

    // But add-link buttons should be present
    expect(screen.getByRole('button', { name: /Website/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LinkedIn/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/ })).toBeInTheDocument();
  });

  it('should display email input with email type', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/Email/);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should render Job Title field', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Job Title/)).toBeInTheDocument();
  });
});

