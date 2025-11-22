import { ATSAnalyzer } from "../lib/ats/engine";
import { ResumeData } from "../lib/types/resume";

// Helper to create base resume
const createResume = (overrides: Partial<ResumeData> = {}): ResumeData => ({
    personalInfo: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "1234567890",
        location: "City, ST",
        linkedin: "linkedin.com/in/test",
        summary: "Summary"
    },
    workExperience: [],
    education: [],
    skills: [],
    ...overrides
});

const scenarios = [
    {
        name: "Perfect Resume",
        data: createResume({
            workExperience: [{
                id: "1", company: "Co", position: "Pos", location: "Loc", startDate: "2020", current: true,
                description: [
                    "Spearheaded a project that increased revenue by 20%.", // Verb + Metric
                    "Developed a new feature used by 10k+ users.", // Verb + Metric
                    "Optimized database queries reducing latency by 50%." // Verb + Metric
                ]
            }],
            education: [{ id: "1", institution: "Uni", degree: "BS", field: "CS", location: "Loc", startDate: "2016", current: false }],
            skills: [{ id: "1", name: "React", category: "Tech" }, { id: "2", name: "Node", category: "Tech" }]
        })
    },
    {
        name: "Weak Verbs & No Metrics",
        data: createResume({
            workExperience: [{
                id: "1", company: "Co", position: "Pos", location: "Loc", startDate: "2020", current: true,
                description: [
                    "Worked on the frontend team.", // Weak verb
                    "Responsible for maintaining code.", // Weak phrase
                    "Helped with database migration." // Weak verb
                ]
            }],
            education: [{ id: "1", institution: "Uni", degree: "BS", field: "CS", location: "Loc", startDate: "2016", current: false }],
            skills: [{ id: "1", name: "React", category: "Tech" }]
        })
    },
    {
        name: "Keyword Stuffing",
        data: createResume({
            workExperience: [{
                id: "1", company: "Co", position: "Pos", location: "Loc", startDate: "2020", current: true,
                description: ["Did work."]
            }],
            education: [{ id: "1", institution: "Uni", degree: "BS", field: "CS", location: "Loc", startDate: "2016", current: false }],
            skills: [
                { id: "1", name: "React", category: "Tech" },
                { id: "2", name: "React", category: "Tech" }, // Duplicate
                { id: "3", name: "react", category: "Tech" }, // Duplicate lowercase
                { id: "4", name: "Communication", category: "Soft" },
                { id: "5", name: "Teamwork", category: "Soft" },
                { id: "6", name: "Leadership", category: "Soft" } // Too many soft skills
            ]
        })
    },
    {
        name: "Empty / Minimal",
        data: createResume({
            personalInfo: { firstName: "", lastName: "", email: "", phone: "", location: "" }, // Missing info
            workExperience: [],
            education: [],
            skills: []
        })
    }
];

console.log("--- ATS Stress Test Results ---\n");

scenarios.forEach(scenario => {
    const analyzer = new ATSAnalyzer(scenario.data);
    const result = analyzer.analyze();

    console.log(`Scenario: ${scenario.name}`);
    console.log(`Score: ${result.totalScore}/100`);
    console.log(`Critical Issues: ${result.issues.filter(i => i.type === 'critical').length}`);
    console.log(`Warnings: ${result.issues.filter(i => i.type === 'warning').length}`);
    console.log("-----------------------------------");
});
