import { ResumeData } from "@/lib/types/resume";

/**
 * Sample resume data for template previews
 * This is used to show what each template looks like without using real user data
 */
export const SAMPLE_RESUME_DATA: ResumeData = {
    personalInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        website: "johndoe.com",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        summary: "Experienced software engineer with a passion for building scalable applications",
    },
    workExperience: [
        {
            id: "1",
            company: "Tech Company Inc.",
            position: "Senior Software Engineer",
            location: "San Francisco, CA",
            startDate: "2020-01",
            endDate: "",
            current: true,
            description: [
                "Led development of microservices architecture serving 1M+ users",
                "Improved application performance by 40% through optimization",
                "Mentored team of 5 junior developers",
            ],
        },
        {
            id: "2",
            company: "Startup Co.",
            position: "Software Engineer",
            location: "Austin, TX",
            startDate: "2018-06",
            endDate: "2019-12",
            current: false,
            description: [
                "Built RESTful APIs using Node.js and Express",
                "Implemented CI/CD pipeline reducing deployment time by 60%",
            ],
        },
    ],
    education: [
        {
            id: "1",
            institution: "University of California",
            degree: "Bachelor of Science",
            field: "Computer Science",
            location: "Berkeley, CA",
            startDate: "2014-09",
            endDate: "2018-05",
            current: false,
            gpa: "3.8",
        },
    ],
    skills: [
        { id: "1", name: "JavaScript", category: "Programming Languages" },
        { id: "2", name: "TypeScript", category: "Programming Languages" },
        { id: "3", name: "React", category: "Frameworks" },
        { id: "4", name: "Node.js", category: "Frameworks" },
        { id: "5", name: "PostgreSQL", category: "Databases" },
    ],
    languages: [
        { id: "1", name: "English", level: "native" },
        { id: "2", name: "Spanish", level: "conversational" },
    ],
    courses: [
        {
            id: "1",
            name: "AWS Solutions Architect",
            institution: "Amazon Web Services",
            date: "2022-03",
        },
    ],
};
