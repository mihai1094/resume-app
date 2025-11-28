import { describe, it, expect } from 'vitest';
import {
  validators,
  validatePersonalInfo,
  validateWorkExperience,
  validateEducation,
  validateResume,
} from '../resume-validation';
import { PersonalInfo, WorkExperience, Education, ResumeData } from '@/lib/types/resume';

describe('validators', () => {
  describe('email', () => {
    it('should return error for empty email', () => {
      expect(validators.email('')).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      expect(validators.email('invalid')).toBe('Invalid email format');
      expect(validators.email('invalid@')).toBe('Invalid email format');
      expect(validators.email('@example.com')).toBe('Invalid email format');
    });

    it('should return null for valid email', () => {
      expect(validators.email('test@example.com')).toBeNull();
      expect(validators.email('user.name@domain.co.uk')).toBeNull();
    });
  });

  describe('phone', () => {
    it('should return error for empty phone', () => {
      expect(validators.phone('')).toBe('Phone is required');
    });

    it('should return error for invalid phone format', () => {
      expect(validators.phone('123')).toBe('Invalid phone format');
      expect(validators.phone('abc')).toBe('Invalid phone format');
    });

    it('should return null for valid phone', () => {
      expect(validators.phone('1234567890')).toBeNull();
      expect(validators.phone('+1 (555) 123-4567')).toBeNull();
      expect(validators.phone('555-123-4567')).toBeNull();
    });
  });

  describe('required', () => {
    it('should return error for empty string', () => {
      expect(validators.required('')).toBe('This field is required');
      expect(validators.required('   ')).toBe('This field is required');
    });

    it('should return error for null/undefined', () => {
      expect(validators.required(null)).toBe('This field is required');
      expect(validators.required(undefined)).toBe('This field is required');
    });

    it('should return null for valid value', () => {
      expect(validators.required('value')).toBeNull();
      expect(validators.required(0)).toBeNull();
      expect(validators.required(false)).toBeNull();
    });
  });

  describe('url', () => {
    it('should return null for empty/undefined (optional field)', () => {
      expect(validators.url('')).toBeNull();
      expect(validators.url(undefined)).toBeNull();
    });

    it('should return error for invalid URL', () => {
      expect(validators.url('not-a-url')).toBe('Invalid URL format');
      expect(validators.url('http://')).toBe('Invalid URL format');
    });

    it('should return null for valid URL', () => {
      expect(validators.url('https://example.com')).toBeNull();
      expect(validators.url('http://example.com/path')).toBeNull();
    });
  });

  describe('dateRange', () => {
    it('should return error for missing start date', () => {
      expect(validators.dateRange('')).toBe('Start date is required');
    });

    it('should return error for missing end date when not current', () => {
      expect(validators.dateRange('2020-01-01', undefined, false)).toBe(
        "End date is required (or check 'Current')"
      );
    });

    it('should return error when start date is after end date', () => {
      expect(validators.dateRange('2021-01-01', '2020-01-01', false)).toBe(
        'Start date must be before end date'
      );
    });

    it('should return null for valid date range', () => {
      expect(validators.dateRange('2020-01-01', '2021-01-01', false)).toBeNull();
      expect(validators.dateRange('2020-01-01', undefined, true)).toBeNull();
    });
  });
});

describe('validatePersonalInfo', () => {
  it('should return errors for missing required fields', () => {
    const info: PersonalInfo = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
    };

    const errors = validatePersonalInfo(info);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'firstName')).toBe(true);
    expect(errors.some(e => e.field === 'lastName')).toBe(true);
    expect(errors.some(e => e.field === 'email')).toBe(true);
    expect(errors.some(e => e.field === 'phone')).toBe(true);
    expect(errors.some(e => e.field === 'location')).toBe(true);
  });

  it('should return error for invalid email', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '1234567890',
      location: 'New York',
    };

    const errors = validatePersonalInfo(info);
    expect(errors.some(e => e.field === 'email')).toBe(true);
  });

  it('should return error for invalid URL in optional fields', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      location: 'New York',
      website: 'not-a-url',
    };

    const errors = validatePersonalInfo(info);
    expect(errors.some(e => e.field === 'website')).toBe(true);
  });

  it('should return no errors for valid personal info', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      location: 'New York',
      website: 'https://johndoe.com',
    };

    const errors = validatePersonalInfo(info);
    expect(errors.length).toBe(0);
  });
});

describe('validateWorkExperience', () => {
  it('should return errors for missing required fields', () => {
    const experiences: WorkExperience[] = [
      {
        id: '1',
        company: '',
        position: '',
        location: '',
        startDate: '',
        current: false,
        description: [],
      },
    ];

    const errors = validateWorkExperience(experiences);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field.includes('company'))).toBe(true);
    expect(errors.some(e => e.field.includes('position'))).toBe(true);
  });

  it('should return error for missing description', () => {
    const experiences: WorkExperience[] = [
      {
        id: '1',
        company: 'Company',
        position: 'Position',
        location: 'Location',
        startDate: '2020-01-01',
        current: false,
        description: [],
      },
    ];

    const errors = validateWorkExperience(experiences);
    expect(errors.some(e => e.field.includes('description'))).toBe(true);
  });

  it('should return error for invalid date range', () => {
    const experiences: WorkExperience[] = [
      {
        id: '1',
        company: 'Company',
        position: 'Position',
        location: 'Location',
        startDate: '2021-01-01',
        endDate: '2020-01-01',
        current: false,
        description: ['Description'],
      },
    ];

    const errors = validateWorkExperience(experiences);
    expect(errors.some(e => e.field.includes('dates'))).toBe(true);
  });

  it('should return no errors for valid work experience', () => {
    const experiences: WorkExperience[] = [
      {
        id: '1',
        company: 'Company',
        position: 'Position',
        location: 'Location',
        startDate: '2020-01-01',
        endDate: '2021-01-01',
        current: false,
        description: ['Delivered key features that improved conversion by 10%.'],
      },
    ];

    const errors = validateWorkExperience(experiences);
    expect(errors.length).toBe(0);
  });
});

describe('validateEducation', () => {
  it('should return errors for missing required fields', () => {
    const education: Education[] = [
      {
        id: '1',
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        current: false,
      },
    ];

    const errors = validateEducation(education);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field.includes('institution'))).toBe(true);
    expect(errors.some(e => e.field.includes('degree'))).toBe(true);
  });

  it('should return no errors for valid education', () => {
    const education: Education[] = [
      {
        id: '1',
        institution: 'University',
        degree: 'Bachelor',
        field: 'Computer Science',
        location: 'Location',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
        current: false,
      },
    ];

    const errors = validateEducation(education);
    expect(errors.length).toBe(0);
  });
});

describe('validateResume', () => {
  it('should return valid=false when there are errors', () => {
    const resume: ResumeData = {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
      },
      workExperience: [],
      education: [],
      skills: [],
    };

    const result = validateResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should return warnings for missing optional sections', () => {
    const resume: ResumeData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York',
      },
      workExperience: [],
      education: [],
      skills: [],
    };

    const result = validateResume(resume);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.field === 'workExperience')).toBe(true);
  });

  it('should return valid=true for complete resume', () => {
    const resume: ResumeData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York',
      },
      workExperience: [
        {
          id: '1',
          company: 'Company',
          position: 'Position',
          location: 'Location',
          startDate: '2020-01-01',
          endDate: '2021-01-01',
          current: false,
          description: ['Delivered key features that improved conversion by 10%.'],
        },
      ],
      education: [
        {
          id: '1',
          institution: 'University',
          degree: 'Bachelor',
          field: 'CS',
          location: 'Location',
          startDate: '2016-01-01',
          endDate: '2020-01-01',
          current: false,
        },
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'Programming' },
        { id: '2', name: 'TypeScript', category: 'Programming' },
        { id: '3', name: 'React', category: 'Framework' },
        { id: '4', name: 'Node.js', category: 'Framework' },
        { id: '5', name: 'Python', category: 'Programming' },
      ],
    };

    const result = validateResume(resume);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
