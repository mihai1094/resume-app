import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generateSummary } from '../summary';
import { flashModel } from '../shared';

// Mock the flash model to avoid actual API calls during unit testing
vi.mock('../shared', () => ({
    flashModel: vi.fn(),
    safety: [],
}));

describe('Professional Summary Refinement', () => {
    const mockGenerateContent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (flashModel as any).mockReturnValue({
            generateContent: mockGenerateContent,
        });
    });

    const baseInput = {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        keySkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        recentPosition: 'Senior Developer',
        recentCompany: 'Tech Corp',
        yearsOfExperience: 5,
    };

    test('calls generateSummary with industry context', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'John Doe is a tech expert with AWS skills.',
            },
        });

        await generateSummary({
            ...baseInput,
            industry: 'technology',
            seniorityLevel: 'mid',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('INDUSTRY: Technology');
        expect(prompt).toContain('SENIORITY: Mid-Level Professional');
        expect(prompt).toContain('John Doe');
    });

    test('calls generateSummary with executive seniority guidance', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Visionary CTO with enterprise impact.',
            },
        });

        await generateSummary({
            ...baseInput,
            seniorityLevel: 'executive',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('SENIORITY: Executive');
        expect(prompt).toContain('First sentence: Executive leadership scope');
    });

    test('calls generateSummary with entry level guidance', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Motivated graduate eager to contribute.',
            },
        });

        await generateSummary({
            ...baseInput,
            seniorityLevel: 'entry',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('SENIORITY: Entry-Level');
        expect(prompt).toContain('First sentence: Education/background and career aspiration');
    });
});
