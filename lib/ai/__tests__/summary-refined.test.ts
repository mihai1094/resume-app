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

    test('uses polish mode when draft summary is provided', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Software engineer focused on scalable products and reliable delivery.',
            },
        });

        await generateSummary({
            ...baseInput,
            draftSummary: 'Results-driven engineer with great communication skills.',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('TASK MODE: POLISH_EXISTING_SUMMARY');
        expect(prompt).toContain('CURRENT USER DRAFT:');
    });

    test('applies short length guidance when requested', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => 'Engineer building web apps with React and Node.js.',
            },
        });

        await generateSummary({
            ...baseInput,
            length: 'short',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('Length: 2 sentences, 35-50 words');
    });
});
