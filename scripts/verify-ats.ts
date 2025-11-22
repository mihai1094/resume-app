import { ATSAnalyzer } from "../lib/ats/engine";
import { ResumeData } from "../lib/types/resume";

const mockResume: ResumeData = {
    personalInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@gmail.com",
        phone: "1234567890",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe",
        summary: "Experienced developer."
    },
    workExperience: [
        {
            id: "1",
            company: "Tech Corp",
            position: "Senior Developer",
            location: "Remote",
            startDate: "2020-01",
            current: true,
            description: [
                "Led a team of 5 developers to build a new SaaS platform.",
                "Developed a scalable API using Node.js and TypeScript.",
                "Optimized database queries, reducing load times by 40%."
            ]
        }
    ],
    education: [
        {
            id: "1",
            institution: "University of Tech",
            degree: "Bachelor",
            field: "Computer Science",
            location: "NY",
            startDate: "2016",
            endDate: "2020",
            current: false
        }
    ],
    skills: [
        { id: "1", name: "React", category: "Frontend" },
        { id: "2", name: "TypeScript", category: "Frontend" },
        { id: "3", name: "Node.js", category: "Backend" },
        { id: "4", name: "Communication", category: "Soft" }
    ]
};

const analyzer = new ATSAnalyzer(mockResume);
const result = analyzer.analyze();

console.log("Total Score:", result.totalScore);
console.log("Breakdown:", JSON.stringify(result.breakdown, null, 2));
console.log("Issues:", JSON.stringify(result.issues, null, 2));
