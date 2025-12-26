import { YouTubeResource, LearnableSkill } from "./content-types";

/**
 * Curated database of high-quality YouTube learning resources
 * These are real, verified resources from popular tech education channels
 *
 * Resources are categorized by skill and include:
 * - Crash courses (quick overview, 30min-2hrs)
 * - Full courses (comprehensive, 3-10hrs)
 * - Tutorials (specific use cases)
 * - Projects (hands-on learning)
 */

interface ResourceEntry {
  keywords: string[]; // Skill names that match this resource
  category: LearnableSkill["category"];
  difficultyToLearn: LearnableSkill["difficultyToLearn"];
  timeToLearn: string;
  interviewTip: string;
  resources: YouTubeResource[];
}

/**
 * Curated learning resources database
 * Keys are normalized skill names (lowercase)
 */
export const LEARNING_RESOURCES: Record<string, ResourceEntry> = {
  // === Frontend Frameworks ===
  react: {
    keywords: ["react", "reactjs", "react.js"],
    category: "framework",
    difficultyToLearn: "medium",
    timeToLearn: "1-2 weeks",
    interviewTip: "Focus on hooks (useState, useEffect), component lifecycle, and state management. Build a small project to demonstrate understanding.",
    resources: [
      {
        title: "React Course - Beginner's Tutorial for React JavaScript Library [2022]",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        thumbnailUrl: "https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg",
        duration: "12 hours",
        type: "full-course",
      },
      {
        title: "React in 100 Seconds",
        channelName: "Fireship",
        url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
        thumbnailUrl: "https://i.ytimg.com/vi/Tn6-PIqc4UM/maxresdefault.jpg",
        duration: "2 min",
        type: "crash-course",
      },
      {
        title: "Learn React With This One Project",
        channelName: "Web Dev Simplified",
        url: "https://www.youtube.com/watch?v=Rh3tobg7hEo",
        thumbnailUrl: "https://i.ytimg.com/vi/Rh3tobg7hEo/maxresdefault.jpg",
        duration: "1 hour",
        type: "project",
      },
    ],
  },

  typescript: {
    keywords: ["typescript", "ts"],
    category: "language",
    difficultyToLearn: "easy",
    timeToLearn: "3-5 days",
    interviewTip: "Understand types, interfaces, generics, and type guards. Be ready to explain why TypeScript improves code quality.",
    resources: [
      {
        title: "TypeScript Tutorial for Beginners",
        channelName: "Programming with Mosh",
        url: "https://www.youtube.com/watch?v=d56mG7DezGs",
        thumbnailUrl: "https://i.ytimg.com/vi/d56mG7DezGs/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
      {
        title: "TypeScript Full Course for Beginners",
        channelName: "Dave Gray",
        url: "https://www.youtube.com/watch?v=gieEQFIfgYc",
        thumbnailUrl: "https://i.ytimg.com/vi/gieEQFIfgYc/maxresdefault.jpg",
        duration: "8 hours",
        type: "full-course",
      },
    ],
  },

  nextjs: {
    keywords: ["next.js", "nextjs", "next"],
    category: "framework",
    difficultyToLearn: "medium",
    timeToLearn: "1-2 weeks",
    interviewTip: "Know the difference between SSR, SSG, and ISR. Understand the App Router, Server Components, and API routes.",
    resources: [
      {
        title: "Next.js 14 Full Course 2024",
        channelName: "JavaScript Mastery",
        url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
        thumbnailUrl: "https://i.ytimg.com/vi/wm5gMKuwSYk/maxresdefault.jpg",
        duration: "5 hours",
        type: "full-course",
      },
      {
        title: "Next.js in 100 Seconds // Plus Full Beginner's Tutorial",
        channelName: "Fireship",
        url: "https://www.youtube.com/watch?v=Sklc_fQBmcs",
        thumbnailUrl: "https://i.ytimg.com/vi/Sklc_fQBmcs/maxresdefault.jpg",
        duration: "12 min",
        type: "crash-course",
      },
    ],
  },

  vue: {
    keywords: ["vue", "vuejs", "vue.js"],
    category: "framework",
    difficultyToLearn: "medium",
    timeToLearn: "1-2 weeks",
    interviewTip: "Understand Vue's reactivity system, Composition API vs Options API, and Vue Router basics.",
    resources: [
      {
        title: "Vue.js Course for Beginners [2021 Tutorial]",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=FXpIoQ_rT_c",
        thumbnailUrl: "https://i.ytimg.com/vi/FXpIoQ_rT_c/maxresdefault.jpg",
        duration: "4 hours",
        type: "full-course",
      },
    ],
  },

  angular: {
    keywords: ["angular", "angularjs"],
    category: "framework",
    difficultyToLearn: "hard",
    timeToLearn: "2-3 weeks",
    interviewTip: "Focus on components, services, dependency injection, and RxJS basics. Angular has a steeper learning curve.",
    resources: [
      {
        title: "Angular Tutorial for Beginners: Learn Angular & TypeScript",
        channelName: "Programming with Mosh",
        url: "https://www.youtube.com/watch?v=k5E2AVpwsko",
        thumbnailUrl: "https://i.ytimg.com/vi/k5E2AVpwsko/maxresdefault.jpg",
        duration: "2 hours",
        type: "crash-course",
      },
    ],
  },

  // === Backend & APIs ===
  nodejs: {
    keywords: ["node.js", "nodejs", "node"],
    category: "technical",
    difficultyToLearn: "medium",
    timeToLearn: "1-2 weeks",
    interviewTip: "Understand event loop, async/await, Express basics, and common middleware patterns.",
    resources: [
      {
        title: "Node.js Full Course for Beginners",
        channelName: "Dave Gray",
        url: "https://www.youtube.com/watch?v=f2EqECiTBL8",
        thumbnailUrl: "https://i.ytimg.com/vi/f2EqECiTBL8/maxresdefault.jpg",
        duration: "7 hours",
        type: "full-course",
      },
      {
        title: "Node.js Crash Course",
        channelName: "Traversy Media",
        url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
        thumbnailUrl: "https://i.ytimg.com/vi/fBNz5xF-Kx4/maxresdefault.jpg",
        duration: "1.5 hours",
        type: "crash-course",
      },
    ],
  },

  python: {
    keywords: ["python", "python3"],
    category: "language",
    difficultyToLearn: "easy",
    timeToLearn: "1-2 weeks",
    interviewTip: "Know list comprehensions, decorators, and common libraries. Be ready for coding challenges.",
    resources: [
      {
        title: "Python for Beginners - Learn Python in 1 Hour",
        channelName: "Programming with Mosh",
        url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        thumbnailUrl: "https://i.ytimg.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
      {
        title: "Learn Python - Full Course for Beginners",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        thumbnailUrl: "https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg",
        duration: "4.5 hours",
        type: "full-course",
      },
    ],
  },

  graphql: {
    keywords: ["graphql", "graph ql"],
    category: "technical",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Understand queries, mutations, subscriptions, and how GraphQL differs from REST. Know about resolvers.",
    resources: [
      {
        title: "GraphQL Crash Course",
        channelName: "Traversy Media",
        url: "https://www.youtube.com/watch?v=BcLNfwF04Kw",
        thumbnailUrl: "https://i.ytimg.com/vi/BcLNfwF04Kw/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
    ],
  },

  restapi: {
    keywords: ["rest api", "rest", "restful", "api design"],
    category: "concept",
    difficultyToLearn: "easy",
    timeToLearn: "2-3 days",
    interviewTip: "Know HTTP methods, status codes, REST principles, and authentication patterns (JWT, OAuth).",
    resources: [
      {
        title: "REST API Tutorial - What is a REST API?",
        channelName: "Programming with Mosh",
        url: "https://www.youtube.com/watch?v=SLwpqD8n3d0",
        thumbnailUrl: "https://i.ytimg.com/vi/SLwpqD8n3d0/maxresdefault.jpg",
        duration: "10 min",
        type: "crash-course",
      },
    ],
  },

  // === DevOps & Infrastructure ===
  docker: {
    keywords: ["docker", "containerization", "containers"],
    category: "tool",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Understand images vs containers, Dockerfiles, docker-compose, and basic networking. Build and deploy a containerized app.",
    resources: [
      {
        title: "Docker Tutorial for Beginners",
        channelName: "TechWorld with Nana",
        url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
        thumbnailUrl: "https://i.ytimg.com/vi/3c-iBn73dDE/maxresdefault.jpg",
        duration: "3 hours",
        type: "full-course",
      },
      {
        title: "Docker in 100 Seconds",
        channelName: "Fireship",
        url: "https://www.youtube.com/watch?v=Gjnup-PuquQ",
        thumbnailUrl: "https://i.ytimg.com/vi/Gjnup-PuquQ/maxresdefault.jpg",
        duration: "2 min",
        type: "crash-course",
      },
    ],
  },

  kubernetes: {
    keywords: ["kubernetes", "k8s"],
    category: "tool",
    difficultyToLearn: "hard",
    timeToLearn: "2-3 weeks",
    interviewTip: "Understand pods, deployments, services, and basic YAML configs. Focus on concepts over memorizing commands.",
    resources: [
      {
        title: "Kubernetes Tutorial for Beginners",
        channelName: "TechWorld with Nana",
        url: "https://www.youtube.com/watch?v=X48VuDVv0do",
        thumbnailUrl: "https://i.ytimg.com/vi/X48VuDVv0do/maxresdefault.jpg",
        duration: "4 hours",
        type: "full-course",
      },
    ],
  },

  aws: {
    keywords: ["aws", "amazon web services", "cloud computing"],
    category: "tool",
    difficultyToLearn: "hard",
    timeToLearn: "2-4 weeks",
    interviewTip: "Focus on core services: EC2, S3, Lambda, RDS. Know the difference between IaaS, PaaS, SaaS.",
    resources: [
      {
        title: "AWS Certified Cloud Practitioner Certification Course",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=SOTamWNgDKc",
        thumbnailUrl: "https://i.ytimg.com/vi/SOTamWNgDKc/maxresdefault.jpg",
        duration: "14 hours",
        type: "full-course",
      },
      {
        title: "AWS In 10 Minutes",
        channelName: "Fireship",
        url: "https://www.youtube.com/watch?v=r4YIdn2eTm4",
        thumbnailUrl: "https://i.ytimg.com/vi/r4YIdn2eTm4/maxresdefault.jpg",
        duration: "10 min",
        type: "crash-course",
      },
    ],
  },

  cicd: {
    keywords: ["ci/cd", "ci cd", "continuous integration", "continuous deployment", "github actions"],
    category: "concept",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Understand the pipeline concept: build, test, deploy. Know common tools (GitHub Actions, Jenkins, GitLab CI).",
    resources: [
      {
        title: "GitHub Actions Tutorial - Basic Concepts and CI/CD Pipeline",
        channelName: "TechWorld with Nana",
        url: "https://www.youtube.com/watch?v=R8_veQiYBjI",
        thumbnailUrl: "https://i.ytimg.com/vi/R8_veQiYBjI/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
    ],
  },

  git: {
    keywords: ["git", "version control", "github"],
    category: "tool",
    difficultyToLearn: "easy",
    timeToLearn: "2-3 days",
    interviewTip: "Know branching, merging, rebasing, and common workflows. Understand pull requests and code reviews.",
    resources: [
      {
        title: "Git and GitHub for Beginners - Crash Course",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
        thumbnailUrl: "https://i.ytimg.com/vi/RGOj5yH7evk/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
    ],
  },

  // === Databases ===
  sql: {
    keywords: ["sql", "mysql", "postgresql", "postgres", "database"],
    category: "language",
    difficultyToLearn: "easy",
    timeToLearn: "1 week",
    interviewTip: "Know JOINs, GROUP BY, indexes, and normalization. Practice writing queries for common scenarios.",
    resources: [
      {
        title: "SQL Tutorial - Full Database Course for Beginners",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        thumbnailUrl: "https://i.ytimg.com/vi/HXV3zeQKqGY/maxresdefault.jpg",
        duration: "4 hours",
        type: "full-course",
      },
    ],
  },

  mongodb: {
    keywords: ["mongodb", "mongo", "nosql"],
    category: "tool",
    difficultyToLearn: "easy",
    timeToLearn: "1 week",
    interviewTip: "Understand documents vs collections, CRUD operations, and when to use NoSQL vs SQL.",
    resources: [
      {
        title: "MongoDB Crash Course",
        channelName: "Traversy Media",
        url: "https://www.youtube.com/watch?v=-56x56UppqQ",
        thumbnailUrl: "https://i.ytimg.com/vi/-56x56UppqQ/maxresdefault.jpg",
        duration: "40 min",
        type: "crash-course",
      },
    ],
  },

  redis: {
    keywords: ["redis", "caching", "cache"],
    category: "tool",
    difficultyToLearn: "easy",
    timeToLearn: "2-3 days",
    interviewTip: "Understand data types, use cases (caching, sessions, queues), and basic commands.",
    resources: [
      {
        title: "Redis Crash Course",
        channelName: "Traversy Media",
        url: "https://www.youtube.com/watch?v=jgpVdJB2sKQ",
        thumbnailUrl: "https://i.ytimg.com/vi/jgpVdJB2sKQ/maxresdefault.jpg",
        duration: "40 min",
        type: "crash-course",
      },
    ],
  },

  // === Testing ===
  testing: {
    keywords: ["testing", "unit testing", "jest", "testing library", "test driven development", "tdd"],
    category: "concept",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Know unit vs integration vs e2e tests. Understand mocking, test coverage, and TDD principles.",
    resources: [
      {
        title: "React Testing Library Tutorial",
        channelName: "Net Ninja",
        url: "https://www.youtube.com/watch?v=7dTTFW7yACQ",
        thumbnailUrl: "https://i.ytimg.com/vi/7dTTFW7yACQ/maxresdefault.jpg",
        duration: "30 min",
        type: "crash-course",
      },
    ],
  },

  playwright: {
    keywords: ["playwright", "e2e testing", "end to end testing"],
    category: "tool",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Understand selectors, page interactions, and test organization. Know the difference between Playwright and other tools.",
    resources: [
      {
        title: "Playwright Tutorial for Beginners",
        channelName: "LambdaTest",
        url: "https://www.youtube.com/watch?v=wawbt1cATsk",
        thumbnailUrl: "https://i.ytimg.com/vi/wawbt1cATsk/maxresdefault.jpg",
        duration: "2 hours",
        type: "full-course",
      },
    ],
  },

  // === Mobile ===
  reactnative: {
    keywords: ["react native", "react-native", "mobile development"],
    category: "framework",
    difficultyToLearn: "medium",
    timeToLearn: "2 weeks",
    interviewTip: "If you know React, focus on mobile-specific concepts: navigation, native modules, and platform differences.",
    resources: [
      {
        title: "React Native Tutorial for Beginners",
        channelName: "Programming with Mosh",
        url: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
        thumbnailUrl: "https://i.ytimg.com/vi/0-S5a0eXPoc/maxresdefault.jpg",
        duration: "2 hours",
        type: "crash-course",
      },
    ],
  },

  // === AI/ML ===
  machinelearning: {
    keywords: ["machine learning", "ml", "artificial intelligence", "ai"],
    category: "concept",
    difficultyToLearn: "hard",
    timeToLearn: "4+ weeks",
    interviewTip: "Focus on fundamentals: supervised vs unsupervised learning, common algorithms, and evaluation metrics.",
    resources: [
      {
        title: "Machine Learning for Everybody – Full Course",
        channelName: "freeCodeCamp.org",
        url: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
        thumbnailUrl: "https://i.ytimg.com/vi/i_LwzRVP7bg/maxresdefault.jpg",
        duration: "4 hours",
        type: "full-course",
      },
    ],
  },

  // === Soft Skills & Methodologies ===
  agile: {
    keywords: ["agile", "scrum", "kanban", "sprint"],
    category: "soft-skill",
    difficultyToLearn: "easy",
    timeToLearn: "2-3 days",
    interviewTip: "Know Scrum ceremonies (standup, sprint planning, retro), roles (PO, SM), and Agile principles.",
    resources: [
      {
        title: "Agile Project Management Tutorial",
        channelName: "Simplilearn",
        url: "https://www.youtube.com/watch?v=thsFsPnUHRA",
        thumbnailUrl: "https://i.ytimg.com/vi/thsFsPnUHRA/maxresdefault.jpg",
        duration: "2 hours",
        type: "full-course",
      },
    ],
  },

  // === State Management ===
  redux: {
    keywords: ["redux", "state management", "redux toolkit"],
    category: "framework",
    difficultyToLearn: "medium",
    timeToLearn: "1 week",
    interviewTip: "Understand actions, reducers, store, and middleware. Know when Redux is overkill vs necessary.",
    resources: [
      {
        title: "Redux Toolkit Tutorial",
        channelName: "Codevolution",
        url: "https://www.youtube.com/watch?v=9zySeP5vH9c",
        thumbnailUrl: "https://i.ytimg.com/vi/9zySeP5vH9c/maxresdefault.jpg",
        duration: "1 hour",
        type: "crash-course",
      },
    ],
  },

  // === CSS & Styling ===
  tailwindcss: {
    keywords: ["tailwind", "tailwindcss", "tailwind css"],
    category: "tool",
    difficultyToLearn: "easy",
    timeToLearn: "2-3 days",
    interviewTip: "Know utility-first approach, responsive design, and customization via config. Build something small.",
    resources: [
      {
        title: "Tailwind CSS Full Course for Beginners",
        channelName: "Dave Gray",
        url: "https://www.youtube.com/watch?v=lCxcTsOHrjo",
        thumbnailUrl: "https://i.ytimg.com/vi/lCxcTsOHrjo/maxresdefault.jpg",
        duration: "4 hours",
        type: "full-course",
      },
      {
        title: "Tailwind in 100 Seconds",
        channelName: "Fireship",
        url: "https://www.youtube.com/watch?v=mr15Xzb1Ook",
        thumbnailUrl: "https://i.ytimg.com/vi/mr15Xzb1Ook/maxresdefault.jpg",
        duration: "2 min",
        type: "crash-course",
      },
    ],
  },
};

/**
 * Normalize a skill name for lookup
 */
function normalizeSkillName(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[.-]/g, "")
    .replace(/\s+/g, "");
}

/**
 * Find learning resources for a given skill
 */
export function findResourcesForSkill(skillName: string): ResourceEntry | null {
  const normalized = normalizeSkillName(skillName);

  // Direct match
  if (LEARNING_RESOURCES[normalized]) {
    return LEARNING_RESOURCES[normalized];
  }

  // Check keywords
  for (const [key, entry] of Object.entries(LEARNING_RESOURCES)) {
    const normalizedKeywords = entry.keywords.map(normalizeSkillName);
    if (normalizedKeywords.some((kw) => normalized.includes(kw) || kw.includes(normalized))) {
      return entry;
    }
  }

  return null;
}

/**
 * Build a LearnableSkill object from AI-identified skill and our curated resources
 */
export function buildLearnableSkill(
  id: string,
  skill: string,
  importance: LearnableSkill["importance"],
  reason: string
): LearnableSkill | null {
  const resourceEntry = findResourcesForSkill(skill);

  if (!resourceEntry) {
    return null; // No resources available for this skill
  }

  return {
    id,
    skill,
    category: resourceEntry.category,
    importance,
    difficultyToLearn: resourceEntry.difficultyToLearn,
    timeToLearn: resourceEntry.timeToLearn,
    reason,
    interviewTip: resourceEntry.interviewTip,
    youtubeResources: resourceEntry.resources,
  };
}

/**
 * Match AI-identified missing skills with curated resources
 */
export function matchSkillsWithResources(
  missingSkills: Array<{ skill: string; importance: LearnableSkill["importance"]; reason: string }>
): LearnableSkill[] {
  const learnableSkills: LearnableSkill[] = [];

  for (let i = 0; i < missingSkills.length; i++) {
    const { skill, importance, reason } = missingSkills[i];
    const learnableSkill = buildLearnableSkill(`skill-${i}`, skill, importance, reason);

    if (learnableSkill) {
      learnableSkills.push(learnableSkill);
    }
  }

  // Sort by importance (critical first) then by difficulty (easy first)
  return learnableSkills.sort((a, b) => {
    const importanceOrder = { critical: 0, important: 1, "nice-to-have": 2 };
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

    const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
    if (importanceDiff !== 0) return importanceDiff;

    return difficultyOrder[a.difficultyToLearn] - difficultyOrder[b.difficultyToLearn];
  });
}
