import { useSmartLayout, LAYOUTS } from "../hooks/use-smart-layout";
import { ResumeData } from "../lib/types/resume";

// Mock Data Factory
const createMockResume = (summaryWords: number, expEntries: number, expWordsPerEntry: number): ResumeData => {
    const summary = "word ".repeat(summaryWords);
    const description = ["word ".repeat(expWordsPerEntry)];

    return {
        personalInfo: {
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            summary: summary
        },
        workExperience: Array(expEntries).fill(null).map((_, i) => ({
            id: String(i),
            company: "Company",
            position: "Position",
            startDate: "2020",
            current: false,
            description: description
        })),
        education: [],
        skills: Array(5).fill({ name: "Skill", category: "Tech" }),
        projects: []
    } as unknown as ResumeData;
};

console.log("--- Verifying Smart Layout Logic ---");

// Test Case 1: Sparse (Junior)
// < 400 score
const sparseResume = createMockResume(50, 1, 50);
// Score approx: 50 (summary) + 50 (base exp) + 50 (exp words) + 25 (skills) = 175
const sparseLayout = useSmartLayout(sparseResume);
console.log(`Sparse Test (Score ~175): Expected 'sparse', Got '${sparseLayout.mode}'`);
if (sparseLayout.mode === 'sparse') console.log("✅ Sparse Logic Passed");
else console.error("❌ Sparse Logic Failed");

// Test Case 2: Balanced (Mid-Level)
// 400 - 800 score
const balancedResume = createMockResume(100, 3, 100);
// Score approx: 100 (summary) + 150 (3 * 50 base) + 300 (3 * 100 words) + 25 = 575
const balancedLayout = useSmartLayout(balancedResume);
console.log(`Balanced Test (Score ~575): Expected 'balanced', Got '${balancedLayout.mode}'`);
if (balancedLayout.mode === 'balanced') console.log("✅ Balanced Logic Passed");
else console.error("❌ Balanced Logic Failed");

// Test Case 3: Dense (Senior)
// > 800 score
const denseResume = createMockResume(200, 5, 150);
// Score approx: 200 (summary) + 250 (5 * 50 base) + 750 (5 * 150 words) + 25 = 1225
const denseLayout = useSmartLayout(denseResume);
console.log(`Dense Test (Score ~1225): Expected 'dense', Got '${denseLayout.mode}'`);
if (denseLayout.mode === 'dense') console.log("✅ Dense Logic Passed");
else console.error("❌ Dense Logic Failed");
