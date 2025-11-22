export const ACTION_VERBS = [
    "achieved", "acquired", "adapted", "addressed", "administered", "advised", "analyzed", "anticipated",
    "appointed", "appraised", "approved", "arranged", "assessed", "audited", "augmented", "authored",
    "automated", "balanced", "boosted", "briefed", "budgeted", "built", "calculated", "capitalized",
    "captured", "centralized", "championed", "charted", "clarified", "classified", "closed", "coached",
    "collaborated", "collected", "combined", "commercialized", "committed", "communicated", "compared",
    "compiled", "completed", "composed", "computed", "conceived", "conceptualized", "concluded", "conducted",
    "consolidated", "constructed", "consulted", "contracted", "controlled", "converted", "convinced",
    "coordinated", "corrected", "counseled", "counted", "crafted", "created", "critiqued", "cultivated",
    "customized", "cut", "debugged", "decided", "decreased", "defined", "delegated", "delivered",
    "demonstrated", "deployed", "derived", "designed", "detected", "determined", "developed", "devised",
    "diagnosed", "directed", "discovered", "dispatched", "displayed", "distributed", "diversified",
    "documented", "doubled", "drafted", "drove", "earned", "edited", "educated", "effected", "eliminated",
    "enabled", "enacted", "encouraged", "engineered", "enhanced", "enlarged", "enlisted", "ensured",
    "established", "estimated", "evaluated", "examined", "executed", "expanded", "expedited", "explained",
    "explored", "extracted", "facilitated", "finalized", "financed", "focused", "forecasted", "formulated",
    "fostered", "founded", "gained", "gathered", "generated", "governed", "guided", "handled", "headed",
    "hired", "identified", "illustrated", "implemented", "improved", "improvised", "increased", "indexed",
    "influenced", "initiated", "innovated", "inspected", "inspired", "installed", "instituted", "instructed",
    "integrated", "intensified", "interpreted", "interviewed", "introduced", "invented", "investigated",
    "launched", "led", "leveraged", "licensed", "located", "maintained", "managed", "mapped", "marketed",
    "mastered", "maximized", "measured", "mediated", "mentored", "merged", "minimized", "modeled",
    "moderated", "modernized", "modified", "monitored", "motivated", "navigated", "negotiated", "netted",
    "observed", "obtained", "operated", "optimized", "orchestrated", "organized", "originated", "outperformed",
    "overcame", "overhauled", "oversaw", "participated", "partnered", "performed", "persuaded", "piloted",
    "planned", "positioned", "predicted", "prepared", "presented", "prevented", "processed", "produced",
    "programmed", "projected", "promoted", "proposed", "protected", "proved", "provided", "publicized",
    "published", "purchased", "qualified", "quantified", "quoted", "raised", "rated", "reached",
    "rebuilt", "received", "recognized", "recommended", "reconciled", "recorded", "recruited", "redesigned",
    "reduced", "reengineered", "refined", "refocused", "regulated", "rehabilitated", "reinforced",
    "renegotiated", "reorganized", "reported", "represented", "researched", "resolved", "responded",
    "restored", "restructured", "resulted", "retain", "retrieved", "revamped", "revealed", "reviewed",
    "revised", "revitalized", "saved", "scheduled", "screened", "secured", "selected", "separated",
    "served", "shaped", "simplified", "sold", "solved", "spearheaded", "specialized", "specified",
    "staffed", "standardized", "started", "stimulated", "streamlined", "strengthened", "structured",
    "studied", "suggested", "summarized", "supervised", "supplied", "supported", "surpassed", "surveyed",
    "sustained", "synthesized", "systematized", "targeted", "taught", "terminated", "tested", "tightened",
    "tracked", "traded", "trained", "transcribed", "transformed", "translated", "transmitted", "transported",
    "traveled", "treated", "trimmed", "troubleshot", "tutored", "uncovered", "unified", "updated",
    "upgraded", "utilized", "validated", "valued", "verified", "viewed", "visited", "visualized",
    "volunteered", "won", "wrote"
];

export const WEAK_VERBS = [
    "helped", "worked", "responsible for", "assisted", "participated in", "duties included",
    "handled", "tried", "attempted", "looked after"
];

export const SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving", "time management",
    "adaptability", "creativity", "work ethic", "interpersonal skills", "attention to detail",
    "hard working", "motivated", "dedicated", "passionate", "team player", "self starter"
];

export const STOP_WORDS = [
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their",
    "this", "that", "these", "those", "which", "who", "whom", "whose", "what", "where", "when", "why", "how",
    "can", "could", "will", "would", "shall", "should", "may", "might", "must",
    "as", "if", "than", "then", "so", "such", "very", "too", "not", "no", "nor",
    "about", "above", "across", "after", "against", "along", "among", "around", "before", "behind", "below", "beneath", "beside", "between", "beyond", "during", "except", "from", "inside", "into", "near", "off", "onto", "outside", "over", "past", "since", "through", "throughout", "toward", "under", "underneath", "until", "up", "upon", "within", "without",
    "experience", "work", "job", "role", "position", "company", "team", "project", "responsibility", "duty", "task", "skill", "ability", "knowledge", "qualification", "requirement", "candidate", "applicant", "resume", "cv"
];

export const CLICHES = [
    "go-getter", "go getter",
    "hard worker", "hard-worker",
    "team player", "team-player",
    "synergy",
    "think outside the box", "thinking outside the box",
    "thought leader",
    "rockstar", "rock star",
    "ninja",
    "guru",
    "wizard",
    "detail-oriented", "detail oriented",
    "self-starter", "self starter",
    "motivated",
    "passionate",
    "visionary",
    "dynamic",
    "strategic thinker",
    "results-driven", "results driven",
    "proven track record",
    "best of breed",
    "bottom line",
    "core competency",
    "ecosystem",
    "leverage",
    "paradigm shift",
    "wheelhouse"
];

export const SECTION_HEADERS = [
    "experience",
    "work experience",
    "employment history",
    "professional experience",
    "education",
    "academic background",
    "skills",
    "technical skills",
    "core competencies",
    "projects",
    "languages",
    "certifications",
    "awards",
    "summary",
    "profile",
    "objective"
];

export const STANDARD_SECTIONS = {
    experience: ["experience", "employment", "work history", "professional background"],
    education: ["education", "academic", "university", "college", "school"],
    skills: ["skills", "competencies", "technologies", "stack", "expertise", "abilities"]
};

export const SKILL_CLUSTERS: Record<string, string[]> = {
    // Frontend
    "react": ["javascript", "typescript", "redux", "hooks", "context api", "next.js", "html", "css"],
    "angular": ["typescript", "rxjs", "html", "css", "sass"],
    "vue": ["javascript", "typescript", "vuex", "pinia", "html", "css"],
    "frontend": ["html", "css", "javascript", "responsive design", "accessibility", "git"],

    // Backend
    "node.js": ["javascript", "express", "mongodb", "sql", "rest api", "async/await"],
    "python": ["django", "flask", "sql", "pandas", "numpy", "api"],
    "java": ["spring", "hibernate", "sql", "maven", "gradle", "oop"],
    "backend": ["database", "api", "server", "sql", "nosql", "git"],

    // Data
    "data scientist": ["python", "r", "sql", "machine learning", "statistics", "pandas"],
    "data analyst": ["sql", "excel", "tableau", "power bi", "python", "visualization"],

    // DevOps
    "devops": ["docker", "kubernetes", "aws", "ci/cd", "linux", "jenkins", "terraform"],
    "aws": ["ec2", "s3", "lambda", "cloudwatch", "iam", "vpc"],
};

export const SYNONYMS: Record<string, string[]> = {
    // Soft Skills
    "communication": ["verbal communication", "written communication", "presentation", "public speaking", "interpersonal skills"],
    "leadership": ["management", "team lead", "mentoring", "coaching", "supervision", "strategic planning"],
    "problem solving": ["troubleshooting", "critical thinking", "analytical skills", "solution-oriented"],
    "teamwork": ["collaboration", "cooperation", "team player", "cross-functional"],

    // Roles
    "customer service": ["client relations", "customer support", "client success", "account management"],
    "sales": ["business development", "account executive", "revenue generation", "negotiation"],
    "project management": ["agile", "scrum", "kanban", "product management", "delivery management"],
    "software engineer": ["developer", "programmer", "coder", "software developer", "web developer"]
};
