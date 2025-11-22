import { ATSAnalyzer } from "../lib/ats/engine";
import { ResumeData } from "../lib/types/resume";

const mockResume: ResumeData = {
    personalInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe",
    },
    workExperience: [
        {
            id: "1",
            company: "Tech Corp",
            position: "Senior Developer",
            location: "New York, NY",
            current: true,
            startDate: "2020-01",
            endDate: "Present",
            description: [
                "Responsible for leading the team.",
                "Responsible for managing projects.",
                "Responsible for coding features.",
                "Utilized synergy to think outside the box and be a go-getter.",
                "Developed a React application that increased user engagement by 20%."
            ]
        }
    ],
    education: [
        {
            id: "1",
            institution: "University",
            degree: "BS CS",
            field: "Computer Science",
            location: "New York, NY",
            current: false,
            startDate: "2016",
            endDate: "2020"
        }
    ],
    skills: [
        { id: "1", name: "React", category: "Frontend", level: "expert" },
        { id: "2", name: "TypeScript", category: "Languages", level: "expert" },
        { id: "3", name: "Node.js", category: "Backend", level: "advanced" }
    ],
    projects: []
};

const jobDescription = `
We are looking for a Senior Developer with strong React and TypeScript skills.
The ideal candidate should have experience with Node.js and cloud infrastructure.
You will be responsible for leading the team and managing projects.
`;

console.log("--- Verifying Enhanced ATS Analyzer ---");

const analyzer = new ATSAnalyzer(mockResume, jobDescription);
const result = analyzer.analyze();

console.log(`Total Score: ${result.totalScore}`);

// Check Job Match
if (result.breakdown.jobMatch) {
    console.log(`Job Match Score: ${result.breakdown.jobMatch.score}`);
    console.log("Job Match Issues:", result.breakdown.jobMatch.issues.map(i => i.message));
} else {
    console.error("❌ Job Match analysis missing!");
}

// Check Content Analysis (Repetition & Clichés)
const contentIssues = result.breakdown.content.issues;
const repetitionIssue = contentIssues.find(i => i.id === 'cnt-repetition');
const clicheIssue = contentIssues.find(i => i.id === 'cnt-cliche');

if (repetitionIssue) {
    console.log("✅ Repetition detected:", repetitionIssue.message);
} else {
    console.error("❌ Repetition detection failed!");
}

if (clicheIssue) {
    console.log("✅ Cliché detected:", clicheIssue.message);
} else {
    console.error("❌ Cliché detection failed!");
}

// Check Parsing Safety
if (result.breakdown.parsingSafety) {
    console.log(`Parsing Safety Score: ${result.breakdown.parsingSafety.score}`);
    console.log("Parsing Safety Issues:", result.breakdown.parsingSafety.issues.map(i => i.message));
} else {
    console.error("❌ Parsing Safety analysis missing!");
}

// Check Keyword Density
if (result.keywordDensity && result.keywordDensity.length > 0) {
    console.log("✅ Keyword Density Analysis found.");
    console.log("Top Keyword:", result.keywordDensity[0]);
} else {
    console.error("❌ Keyword Density analysis missing!");
}

// Check Semantic Matching (Skill Clusters)
// We expect a suggestion for "React" because "Redux" is missing in the mock resume (only React, TypeScript, Node.js are present)
const semanticIssue = result.issues.find(i => i.id.startsWith('sem-'));
if (semanticIssue) {
    console.log("✅ Semantic Suggestion found:", semanticIssue.message);
    console.log("Suggestion:", semanticIssue.suggestion);
} else {
    console.log("ℹ️ No Semantic Suggestion found (might be due to threshold or complete cluster).");
    // Let's check if we can force it by removing Node.js and TypeScript from skills temporarily in a new test if needed
    // But based on the dictionary, React expects: javascript, typescript, redux, hooks, context api, next.js, html, css
    // The mock has React, TypeScript, Node.js. So it should suggest Redux, Hooks, etc.
}
