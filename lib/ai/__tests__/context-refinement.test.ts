import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generateBulletPoints } from '../bullets';
import { suggestSkills } from '../skills';
import { flashModel } from '../shared';

// Mock the flash model to avoid actual API calls
vi.mock('../shared', () => ({
    flashModel: vi.fn(),
    safety: [],
    validateAIResponse: (text: string) => text,
    parseAIJsonResponse: <T>(text: string) => JSON.parse(text) as T,
}));

describe('AI Context Refinement Verification', () => {
    const mockGenerateContent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (flashModel as any).mockReturnValue({
            generateContent: mockGenerateContent,
        });
    });

    describe('Bullet Point Generation', () => {
        test('includes seniority guidance and industry examples in bullet prompt', async () => {
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => 'Bullet 1\nBullet 2\nBullet 3\nBullet 4',
                },
            });

            await generateBulletPoints({
                position: 'Software Engineer',
                company: 'Google',
                industry: 'technology',
                seniorityLevel: 'senior',
            });

            const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
            expect(prompt).toContain('SENIORITY: Senior Professional');
            expect(prompt).toContain('INDUSTRY: Technology');
            expect(prompt).toContain('Architected microservices platform');
        });
    });

    describe('Skill Suggestions', () => {
        test('includes industry trending skills in skills prompt', async () => {
            const mockResult = [
                { name: 'TypeScript', category: 'Technical', relevance: 'high', reason: 'Relevant' }
            ];
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockResult),
                },
            });

            await suggestSkills({
                jobTitle: 'Software Engineer',
                industry: 'technology',
                seniorityLevel: 'mid',
            });

            const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
            expect(prompt).toContain('INDUSTRY: Technology (2024-2025 Trends)');
            expect(prompt).toContain('AI/ML: LLMs, prompt engineering');
            expect(prompt).toContain('SENIORITY: Mid-Level Professional');
        });
    });
});
