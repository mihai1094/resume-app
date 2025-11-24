/**
 * Pre-written bullet points for common job roles
 * Organized by category and role
 */

export interface BulletPoint {
    id: string;
    text: string;
    category: string;
    roles: string[];
    keywords: string[];
}

export const BULLET_LIBRARY: BulletPoint[] = [
    // Software Engineering
    {
        id: "se-1",
        text: "Developed and maintained scalable web applications using React, Node.js, and PostgreSQL, serving 100K+ daily active users",
        category: "Software Engineering",
        roles: ["Software Engineer", "Full Stack Developer", "Frontend Developer"],
        keywords: ["react", "node", "web", "scalable", "development"],
    },
    {
        id: "se-2",
        text: "Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time by 60% and improving code quality",
        category: "Software Engineering",
        roles: ["Software Engineer", "DevOps Engineer", "Backend Developer"],
        keywords: ["ci/cd", "jenkins", "docker", "devops", "deployment"],
    },
    {
        id: "se-3",
        text: "Optimized database queries and API endpoints, improving application response time by 40% and reducing server costs by $50K annually",
        category: "Software Engineering",
        roles: ["Software Engineer", "Backend Developer", "Full Stack Developer"],
        keywords: ["optimization", "database", "api", "performance"],
    },
    {
        id: "se-4",
        text: "Led code reviews and mentored 5 junior developers, establishing best practices and improving team code quality by 35%",
        category: "Software Engineering",
        roles: ["Senior Software Engineer", "Tech Lead", "Software Engineer"],
        keywords: ["leadership", "mentoring", "code review", "best practices"],
    },
    {
        id: "se-5",
        text: "Architected and implemented microservices architecture, improving system reliability and enabling independent service scaling",
        category: "Software Engineering",
        roles: ["Software Engineer", "Solutions Architect", "Backend Developer"],
        keywords: ["microservices", "architecture", "scalability", "reliability"],
    },

    // Product Management
    {
        id: "pm-1",
        text: "Defined product roadmap and prioritized features based on user research and business goals, increasing user engagement by 45%",
        category: "Product Management",
        roles: ["Product Manager", "Senior Product Manager", "Product Owner"],
        keywords: ["roadmap", "strategy", "user research", "engagement"],
    },
    {
        id: "pm-2",
        text: "Collaborated with engineering, design, and marketing teams to launch 3 major features, resulting in 25% revenue growth",
        category: "Product Management",
        roles: ["Product Manager", "Product Owner", "Technical Product Manager"],
        keywords: ["collaboration", "cross-functional", "launch", "revenue"],
    },
    {
        id: "pm-3",
        text: "Conducted user interviews and A/B tests to validate product hypotheses, improving feature adoption rate by 60%",
        category: "Product Management",
        roles: ["Product Manager", "UX Researcher", "Product Owner"],
        keywords: ["user research", "a/b testing", "validation", "adoption"],
    },
    {
        id: "pm-4",
        text: "Analyzed product metrics and user feedback to identify opportunities, leading to 30% increase in customer retention",
        category: "Product Management",
        roles: ["Product Manager", "Product Analyst", "Growth Product Manager"],
        keywords: ["analytics", "metrics", "feedback", "retention"],
    },

    // Data Science
    {
        id: "ds-1",
        text: "Built machine learning models to predict customer churn, achieving 85% accuracy and reducing churn by 20%",
        category: "Data Science",
        roles: ["Data Scientist", "Machine Learning Engineer", "AI Engineer"],
        keywords: ["machine learning", "prediction", "churn", "modeling"],
    },
    {
        id: "ds-2",
        text: "Developed data pipelines using Python and Apache Spark to process 10TB+ of data daily, enabling real-time analytics",
        category: "Data Science",
        roles: ["Data Scientist", "Data Engineer", "Analytics Engineer"],
        keywords: ["data pipeline", "python", "spark", "big data"],
    },
    {
        id: "ds-3",
        text: "Created interactive dashboards using Tableau and SQL, providing actionable insights to executive leadership",
        category: "Data Science",
        roles: ["Data Scientist", "Business Intelligence Analyst", "Data Analyst"],
        keywords: ["dashboards", "tableau", "sql", "visualization"],
    },
    {
        id: "ds-4",
        text: "Implemented A/B testing framework and statistical analysis, optimizing conversion rates by 35%",
        category: "Data Science",
        roles: ["Data Scientist", "Growth Analyst", "Experimentation Scientist"],
        keywords: ["a/b testing", "statistics", "experimentation", "conversion"],
    },

    // Marketing
    {
        id: "mk-1",
        text: "Developed and executed digital marketing campaigns across social media, email, and paid ads, generating $2M in revenue",
        category: "Marketing",
        roles: ["Marketing Manager", "Digital Marketing Manager", "Growth Marketer"],
        keywords: ["campaigns", "digital marketing", "social media", "revenue"],
    },
    {
        id: "mk-2",
        text: "Managed SEO strategy and content marketing, increasing organic traffic by 150% and improving search rankings",
        category: "Marketing",
        roles: ["Marketing Manager", "SEO Specialist", "Content Marketing Manager"],
        keywords: ["seo", "content marketing", "organic traffic", "search"],
    },
    {
        id: "mk-3",
        text: "Analyzed marketing metrics and ROI to optimize campaign performance, reducing customer acquisition cost by 40%",
        category: "Marketing",
        roles: ["Marketing Manager", "Performance Marketing Manager", "Growth Marketer"],
        keywords: ["analytics", "roi", "optimization", "cac"],
    },
    {
        id: "mk-4",
        text: "Built and nurtured email marketing campaigns with personalized content, achieving 25% open rate and 8% click-through rate",
        category: "Marketing",
        roles: ["Marketing Manager", "Email Marketing Specialist", "CRM Manager"],
        keywords: ["email marketing", "personalization", "engagement"],
    },

    // Sales
    {
        id: "sl-1",
        text: "Exceeded quarterly sales targets by 130%, generating $5M in new business through strategic prospecting and relationship building",
        category: "Sales",
        roles: ["Sales Representative", "Account Executive", "Business Development"],
        keywords: ["sales", "quota", "prospecting", "revenue"],
    },
    {
        id: "sl-2",
        text: "Managed key accounts and built long-term relationships, achieving 95% customer retention and $3M in upsell revenue",
        category: "Sales",
        roles: ["Account Executive", "Account Manager", "Sales Manager"],
        keywords: ["account management", "retention", "upsell", "relationships"],
    },
    {
        id: "sl-3",
        text: "Conducted product demonstrations and presentations to C-level executives, closing 15 enterprise deals worth $8M",
        category: "Sales",
        roles: ["Sales Representative", "Enterprise Account Executive", "Solutions Consultant"],
        keywords: ["demos", "presentations", "enterprise", "closing"],
    },
    {
        id: "sl-4",
        text: "Developed sales playbooks and trained 10 new sales reps, improving team performance and reducing ramp-up time by 50%",
        category: "Sales",
        roles: ["Sales Manager", "Sales Enablement Manager", "Senior Account Executive"],
        keywords: ["training", "enablement", "playbooks", "leadership"],
    },

    // Design
    {
        id: "ux-1",
        text: "Designed user-centered interfaces for web and mobile applications, improving user satisfaction scores by 40%",
        category: "Design",
        roles: ["UX Designer", "UI Designer", "Product Designer"],
        keywords: ["ux", "ui", "design", "user-centered", "satisfaction"],
    },
    {
        id: "ux-2",
        text: "Conducted user research and usability testing with 50+ participants, identifying key pain points and design opportunities",
        category: "Design",
        roles: ["UX Designer", "UX Researcher", "Product Designer"],
        keywords: ["user research", "usability testing", "research"],
    },
    {
        id: "ux-3",
        text: "Created design systems and component libraries, improving design consistency and reducing development time by 30%",
        category: "Design",
        roles: ["UX Designer", "UI Designer", "Design Systems Designer"],
        keywords: ["design systems", "components", "consistency"],
    },
    {
        id: "ux-4",
        text: "Collaborated with product and engineering teams to ship 20+ features, balancing user needs with technical constraints",
        category: "Design",
        roles: ["Product Designer", "UX Designer", "UI Designer"],
        keywords: ["collaboration", "product design", "cross-functional"],
    },

    // Project Management
    {
        id: "pjm-1",
        text: "Led cross-functional teams of 15+ members to deliver complex projects on time and within budget, achieving 98% stakeholder satisfaction",
        category: "Project Management",
        roles: ["Project Manager", "Program Manager", "Scrum Master"],
        keywords: ["project management", "leadership", "cross-functional", "delivery"],
    },
    {
        id: "pjm-2",
        text: "Implemented Agile methodologies and Scrum practices, improving team velocity by 45% and reducing time-to-market",
        category: "Project Management",
        roles: ["Project Manager", "Scrum Master", "Agile Coach"],
        keywords: ["agile", "scrum", "velocity", "methodology"],
    },
    {
        id: "pjm-3",
        text: "Managed project budgets totaling $10M+ and optimized resource allocation, delivering projects 15% under budget",
        category: "Project Management",
        roles: ["Project Manager", "Program Manager", "Portfolio Manager"],
        keywords: ["budget", "resource management", "cost optimization"],
    },
    {
        id: "pjm-4",
        text: "Identified and mitigated project risks, maintaining 100% on-time delivery rate across 12 concurrent projects",
        category: "Project Management",
        roles: ["Project Manager", "Program Manager", "PMO Lead"],
        keywords: ["risk management", "delivery", "mitigation"],
    },

    // General/Universal
    {
        id: "gen-1",
        text: "Collaborated with stakeholders across multiple departments to align on goals and drive successful project outcomes",
        category: "General",
        roles: ["*"],
        keywords: ["collaboration", "stakeholder", "cross-functional"],
    },
    {
        id: "gen-2",
        text: "Presented findings and recommendations to senior leadership, influencing strategic decisions and company direction",
        category: "General",
        roles: ["*"],
        keywords: ["presentations", "leadership", "strategy", "communication"],
    },
    {
        id: "gen-3",
        text: "Streamlined processes and workflows, improving team efficiency by 25% and reducing operational costs",
        category: "General",
        roles: ["*"],
        keywords: ["process improvement", "efficiency", "optimization"],
    },
    {
        id: "gen-4",
        text: "Mentored and coached team members, fostering professional development and improving team performance",
        category: "General",
        roles: ["*"],
        keywords: ["mentoring", "coaching", "leadership", "development"],
    },
];

/**
 * Filter bullets by job title or keywords
 */
export function filterBullets(
    query: string,
    jobTitle?: string
): BulletPoint[] {
    const lowerQuery = query.toLowerCase();

    return BULLET_LIBRARY.filter((bullet) => {
        // Match by job title
        if (jobTitle) {
            const matchesRole =
                bullet.roles.includes("*") ||
                bullet.roles.some((role) =>
                    role.toLowerCase().includes(jobTitle.toLowerCase())
                ) ||
                jobTitle.toLowerCase().includes(bullet.category.toLowerCase());

            if (matchesRole && !query) {
                return true;
            }
        }

        // Match by search query
        if (query) {
            const matchesText = bullet.text.toLowerCase().includes(lowerQuery);
            const matchesKeywords = bullet.keywords.some((keyword) =>
                keyword.includes(lowerQuery)
            );
            const matchesCategory = bullet.category.toLowerCase().includes(lowerQuery);

            return matchesText || matchesKeywords || matchesCategory;
        }

        return false;
    });
}

/**
 * Get bullets for a specific category
 */
export function getBulletsByCategory(category: string): BulletPoint[] {
    return BULLET_LIBRARY.filter((bullet) => bullet.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
    const categories = new Set(BULLET_LIBRARY.map((bullet) => bullet.category));
    return Array.from(categories).sort();
}
