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

vi.mock('@/lib/validation', () => ({
  validatePersonalInfo: vi.fn(() => ({})),
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

  it('should render all form fields', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Website')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Summary')).toBeInTheDocument();
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

    const firstNameInput = screen.getByLabelText('First Name');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    expect(mockOnChange).toHaveBeenCalledWith({ firstName: 'Jane' });
  });

  it('should call onChange when last name is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const lastNameInput = screen.getByLabelText('Last Name');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Smith');

    expect(mockOnChange).toHaveBeenCalledWith({ lastName: 'Smith' });
  });

  it('should call onChange when email is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'jane@example.com');

    expect(mockOnChange).toHaveBeenCalledWith({ email: 'jane@example.com' });
  });

  it('should call onChange when phone is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const phoneInput = screen.getByLabelText('Phone');
    await user.clear(phoneInput);
    await user.type(phoneInput, '987-654-3210');

    expect(mockOnChange).toHaveBeenCalledWith({ phone: '987-654-3210' });
  });

  it('should call onChange when location is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const locationInput = screen.getByLabelText('Location');
    await user.clear(locationInput);
    await user.type(locationInput, 'San Francisco');

    expect(mockOnChange).toHaveBeenCalledWith({ location: 'San Francisco' });
  });

  it('should call onChange when website is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const websiteInput = screen.getByLabelText('Website');
    await user.clear(websiteInput);
    await user.type(websiteInput, 'https://janesmith.com');

    expect(mockOnChange).toHaveBeenCalledWith({ website: 'https://janesmith.com' });
  });

  it('should call onChange when LinkedIn is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const linkedinInput = screen.getByLabelText('LinkedIn');
    await user.clear(linkedinInput);
    await user.type(linkedinInput, 'linkedin.com/in/janesmith');

    expect(mockOnChange).toHaveBeenCalledWith({ linkedin: 'linkedin.com/in/janesmith' });
  });

  it('should call onChange when GitHub is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const githubInput = screen.getByLabelText('GitHub');
    await user.clear(githubInput);
    await user.type(githubInput, 'github.com/janesmith');

    expect(mockOnChange).toHaveBeenCalledWith({ github: 'github.com/janesmith' });
  });

  it('should call onChange when summary is updated', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const summaryInput = screen.getByLabelText('Summary');
    await user.clear(summaryInput);
    await user.type(summaryInput, 'New summary text');

    expect(mockOnChange).toHaveBeenCalledWith({ summary: 'New summary text' });
  });

  it('should display completion percentage badge', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    // Should show completion badge
    const badge = screen.getByText(/\d+% Complete/);
    expect(badge).toBeInTheDocument();
  });

  it('should show 100% complete when all fields are filled', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const badge = screen.getByText(/100% Complete/);
    expect(badge).toBeInTheDocument();
  });

  it('should show lower percentage when fields are missing', () => {
    const incompleteData: PersonalInfo = {
      firstName: 'John',
      lastName: '',
      email: '',
      phone: '',
      location: '',
    };

    render(<PersonalInfoForm data={incompleteData} onChange={mockOnChange} />);

    const badge = screen.getByText(/\d+% Complete/);
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).not.toBe('100% Complete');
  });

  it('should mark fields as required', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const firstNameInput = screen.getByLabelText('First Name');
    expect(firstNameInput).toHaveAttribute('aria-required', 'true');

    const lastNameInput = screen.getByLabelText('Last Name');
    expect(lastNameInput).toHaveAttribute('aria-required', 'true');

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('aria-required', 'true');

    const phoneInput = screen.getByLabelText('Phone');
    expect(phoneInput).toHaveAttribute('aria-required', 'true');

    const locationInput = screen.getByLabelText('Location');
    expect(locationInput).toHaveAttribute('aria-required', 'true');
  });

  it('should handle empty optional fields', () => {
    const minimalData: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'New York',
    };

    render(<PersonalInfoForm data={minimalData} onChange={mockOnChange} />);

    expect(screen.getByLabelText('Website')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Summary')).toBeInTheDocument();
  });

  it('should display email input with email type', () => {
    render(<PersonalInfoForm data={defaultData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});

