import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generateCoverLetter } from '../cover-letter';
import { flashModel } from '../shared';

// Mock the flash model to avoid actual API calls
vi.mock('../shared', () => ({
    flashModel: vi.fn(),
    safety: [],
    extractJson: <T>(text: string) => JSON.parse(text) as T,
    serializeResume: () => 'Mock Resume Content',
    fallbackCoverLetterFromText: (text: string) => ({ salutation: 'Dear Reader', introduction: text, bodyParagraphs: [], closing: '', signature: '' }),
}));

describe('Cover Letter Context Refinement Verification', () => {
    const mockGenerateContent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (flashModel as any).mockReturnValue({
            generateContent: mockGenerateContent,
        });
    });

    test('includes industry guidance in cover letter prompt', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify({
                    salutation: 'Dear Manager',
                    introduction: 'Intro',
                    bodyParagraphs: ['Body'],
                    closing: 'Close',
                    signature: 'Sign'
                }),
            },
        });

        await generateCoverLetter({
            resumeData: { personalInfo: { firstName: 'John', lastName: 'Doe' } } as any,
            jobDescription: 'Need a tech lead',
            companyName: 'TechCorp',
            positionTitle: 'Tech Lead',
            industry: 'technology',
            seniorityLevel: 'senior',
        });

        const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
        expect(prompt).toContain('INDUSTRY CONTEXT (technology)');
        expect(prompt).toContain('Focus on scalability and performance impact');
        expect(prompt).toContain('SENIORITY LEVEL GUIDANCE (senior)');
        expect(prompt).toContain('leadership and strategic impact');
    });
});
