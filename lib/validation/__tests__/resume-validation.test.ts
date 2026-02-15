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
      expect(validators.phone('123')).toBe('Use a valid phone with country/area code');
      expect(validators.phone('abc')).toBe('Use a valid phone with country/area code');
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

    it('should return null for non-empty string', () => {
      expect(validators.required('value')).toBeNull();
    });

    it('should return error for falsy non-string values (0, false)', () => {
      // The current implementation treats all falsy values as missing
      expect(validators.required(0)).toBe('This field is required');
      expect(validators.required(false)).toBe('This field is required');
    });
  });

  describe('url', () => {
    it('should return null for empty/undefined (optional field)', () => {
      expect(validators.url('')).toBeNull();
      expect(validators.url(undefined)).toBeNull();
    });

    it('should return error for unparseable URL', () => {
      // 'http://' is not a valid URL
      expect(validators.url('http://')).toBe('Invalid URL format');
    });

    it('should return null for string that becomes valid with https prefix', () => {
      // 'not-a-url' gets https:// prepended and parses as valid URL
      expect(validators.url('not-a-url')).toBeNull();
    });

    it('should return null for valid URL', () => {
      expect(validators.url('https://example.com')).toBeNull();
      expect(validators.url('http://example.com/path')).toBeNull();
    });
  });
});

describe('validatePersonalInfo', () => {
  it('should return errors for missing required fields (minimal schema)', () => {
    const info: PersonalInfo = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
    };

    const { errors, warnings } = validatePersonalInfo(info);
    // MinimalPersonalInfoSchema requires firstName, lastName, email
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'firstName')).toBe(true);
    expect(errors.some(e => e.field === 'lastName')).toBe(true);
    expect(errors.some(e => e.field === 'email')).toBe(true);
    // phone and location are not in MinimalSchema, so they appear as warnings
    expect(warnings.some(e => e.field === 'location')).toBe(true);
  });

  it('should return error for invalid email', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '1234567890',
      location: 'New York',
    };

    const { errors } = validatePersonalInfo(info);
    expect(errors.some(e => e.field === 'email')).toBe(true);
  });

  it('should return warning for invalid URL in optional fields', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      location: 'New York',
      website: 'http://',
    };

    const { errors, warnings } = validatePersonalInfo(info);
    expect(errors.length).toBe(0);
    expect(warnings.some(e => e.field === 'website')).toBe(true);
  });

  it('should return no errors or warnings for valid personal info', () => {
    const info: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      location: 'New York',
      website: 'https://johndoe.com',
    };

    const { errors, warnings } = validatePersonalInfo(info);
    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
  });
});

describe('validateWorkExperience', () => {
  it('should return warnings for missing required fields', () => {
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

    const { warnings } = validateWorkExperience(experiences);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(e => e.field.includes('company'))).toBe(true);
    expect(warnings.some(e => e.field.includes('position'))).toBe(true);
  });

  it('should return warning for missing description', () => {
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

    const { warnings } = validateWorkExperience(experiences);
    expect(warnings.some(e => e.field.includes('description'))).toBe(true);
  });

  it('should return warning for invalid date range', () => {
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

    const { warnings } = validateWorkExperience(experiences);
    expect(warnings.some(e => e.field.includes('dates'))).toBe(true);
  });

  it('should return no warnings for valid work experience', () => {
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

    const { errors, warnings } = validateWorkExperience(experiences);
    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
  });
});

describe('validateEducation', () => {
  it('should return warnings for missing required fields', () => {
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

    const { warnings } = validateEducation(education);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(e => e.field.includes('institution'))).toBe(true);
    expect(warnings.some(e => e.field.includes('degree'))).toBe(true);
  });

  it('should return no warnings for valid education', () => {
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

    const { errors, warnings } = validateEducation(education);
    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
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
