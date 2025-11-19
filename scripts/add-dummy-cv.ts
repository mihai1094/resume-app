import { ResumeData } from "@/lib/types/resume";
import { SavedResume } from "@/hooks/use-saved-resumes";

// This script adds a dummy completed CV to localStorage
// Run it in the browser console or as a node script with DOM access

export function createDummyCV(): ResumeData {
  return {
    personalInfo: {
      firstName: "Alexandra",
      lastName: "Johnson",
      email: "alexandra.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "https://alexandrajohnson.dev",
      linkedin: "linkedin.com/in/alexandrajohnson",
      github: "github.com/alexjohnson",
      summary:
        "Innovative Full Stack Developer with 5+ years of experience building scalable web applications. Passionate about creating user-centric solutions using modern technologies. Proven track record of leading cross-functional teams and delivering high-impact projects on time.",
    },
    workExperience: [
      {
        id: "work-1",
        company: "Tech Innovations Inc.",
        position: "Senior Full Stack Developer",
        location: "San Francisco, CA",
        startDate: "2021-06",
        endDate: "",
        current: true,
        description: [
          "Led development of a microservices-based e-commerce platform serving 100K+ daily active users",
          "Architected and implemented RESTful APIs using Node.js, Express, and PostgreSQL",
          "Reduced application load time by 40% through code optimization and implementing caching strategies",
          "Mentored 5 junior developers and conducted weekly code reviews",
        ],
        achievements: [
          "Increased system performance by 60% through database optimization",
          "Reduced bug reports by 45% by implementing comprehensive testing suite",
        ],
      },
      {
        id: "work-2",
        company: "Digital Solutions Co.",
        position: "Full Stack Developer",
        location: "San Francisco, CA",
        startDate: "2019-03",
        endDate: "2021-05",
        current: false,
        description: [
          "Developed and maintained React-based web applications for 10+ enterprise clients",
          "Built real-time data visualization dashboards using D3.js and WebSockets",
          "Collaborated with UX designers to implement responsive, mobile-first designs",
          "Integrated third-party APIs including Stripe, SendGrid, and AWS services",
        ],
        achievements: [
          "Delivered 15+ projects on time and within budget",
          "Received 'Outstanding Performance' award in 2020",
        ],
      },
      {
        id: "work-3",
        company: "StartupLab",
        position: "Junior Web Developer",
        location: "Berkeley, CA",
        startDate: "2018-01",
        endDate: "2019-02",
        current: false,
        description: [
          "Contributed to front-end development using React and Redux",
          "Implemented automated testing using Jest and React Testing Library",
          "Participated in agile development process with 2-week sprint cycles",
          "Fixed bugs and improved application performance based on user feedback",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2014-09",
        endDate: "2018-05",
        current: false,
        gpa: "3.8",
        description: [
          "Dean's List all semesters",
          "President of Computer Science Club",
          "Teaching Assistant for Data Structures course",
        ],
      },
    ],
    skills: [
      { id: "skill-1", name: "JavaScript", category: "Programming Languages", level: "expert" },
      { id: "skill-2", name: "TypeScript", category: "Programming Languages", level: "expert" },
      { id: "skill-3", name: "Python", category: "Programming Languages", level: "advanced" },
      { id: "skill-4", name: "Java", category: "Programming Languages", level: "intermediate" },
      { id: "skill-5", name: "React", category: "Frontend", level: "expert" },
      { id: "skill-6", name: "Next.js", category: "Frontend", level: "expert" },
      { id: "skill-7", name: "Vue.js", category: "Frontend", level: "advanced" },
      { id: "skill-8", name: "HTML5/CSS3", category: "Frontend", level: "expert" },
      { id: "skill-9", name: "Tailwind CSS", category: "Frontend", level: "expert" },
      { id: "skill-10", name: "Node.js", category: "Backend", level: "expert" },
      { id: "skill-11", name: "Express", category: "Backend", level: "expert" },
      { id: "skill-12", name: "PostgreSQL", category: "Database", level: "advanced" },
      { id: "skill-13", name: "MongoDB", category: "Database", level: "advanced" },
      { id: "skill-14", name: "Redis", category: "Database", level: "intermediate" },
      { id: "skill-15", name: "AWS", category: "Cloud & DevOps", level: "advanced" },
      { id: "skill-16", name: "Docker", category: "Cloud & DevOps", level: "advanced" },
      { id: "skill-17", name: "CI/CD", category: "Cloud & DevOps", level: "advanced" },
      { id: "skill-18", name: "Git", category: "Tools", level: "expert" },
      { id: "skill-19", name: "Jest", category: "Testing", level: "advanced" },
      { id: "skill-20", name: "Cypress", category: "Testing", level: "intermediate" },
    ],
    languages: [
      { id: "lang-1", name: "English", level: "native" },
      { id: "lang-2", name: "Spanish", level: "conversational" },
      { id: "lang-3", name: "French", level: "basic" },
    ],
    courses: [
      {
        id: "course-1",
        name: "AWS Certified Solutions Architect",
        institution: "Amazon Web Services",
        date: "2023-03",
        credentialId: "AWS-SA-2023-12345",
        url: "https://aws.amazon.com/certification/",
      },
      {
        id: "course-2",
        name: "Advanced React Patterns",
        institution: "Frontend Masters",
        date: "2022-11",
        url: "https://frontendmasters.com",
      },
      {
        id: "course-3",
        name: "Node.js Microservices",
        institution: "Udemy",
        date: "2022-06",
      },
    ],
    hobbies: [
      {
        id: "hobby-1",
        name: "Open Source Contribution",
        description: "Active contributor to React ecosystem projects on GitHub",
      },
      {
        id: "hobby-2",
        name: "Tech Blogging",
        description: "Writing technical articles on Medium about web development",
      },
      {
        id: "hobby-3",
        name: "Photography",
        description: "Landscape and portrait photography enthusiast",
      },
      {
        id: "hobby-4",
        name: "Hiking",
        description: "Weekend hiker exploring California trails",
      },
    ],
    extraCurricular: [
      {
        id: "extra-1",
        title: "Tech Conference Speaker",
        organization: "ReactConf 2023",
        role: "Speaker",
        startDate: "2023-05",
        description: [
          "Presented talk on 'Optimizing React Performance at Scale'",
          "Attended by 500+ developers",
        ],
      },
      {
        id: "extra-2",
        title: "Volunteer Developer",
        organization: "Code for Good",
        role: "Full Stack Developer",
        startDate: "2020-01",
        current: true,
        description: [
          "Building web applications for non-profit organizations",
          "Mentoring aspiring developers from underrepresented communities",
        ],
      },
    ],
  };
}

export function addDummyCVToLocalStorage() {
  if (typeof window === "undefined") {
    console.error("This script must be run in a browser environment");
    return;
  }

  // Get the user ID from localStorage
  const userDataKey = Object.keys(localStorage).find((key) =>
    key.startsWith("user-")
  );

  if (!userDataKey) {
    console.error("No user found. Please create a user account first.");
    return;
  }

  const userData = localStorage.getItem(userDataKey);
  if (!userData) {
    console.error("User data not found");
    return;
  }

  let userId: string;
  try {
    const user = JSON.parse(userData);
    userId = user.id;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return;
  }

  // Create the dummy CV
  const dummyCV: SavedResume = {
    id: `resume-${Date.now()}`,
    name: "Senior Full Stack Developer - Alexandra Johnson",
    templateId: "modern",
    data: createDummyCV(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Get existing resumes
  const storageKey = `resume-saved-${userId}`;
  let existingResumes: SavedResume[] = [];

  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      existingResumes = JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse existing resumes:", error);
    }
  }

  // Add the dummy CV
  existingResumes.push(dummyCV);

  // Save to localStorage
  try {
    localStorage.setItem(storageKey, JSON.stringify(existingResumes));
    console.log("✅ Dummy CV added successfully!");
    console.log("Resume name:", dummyCV.name);
    console.log("Resume ID:", dummyCV.id);
    return dummyCV;
  } catch (error) {
    console.error("Failed to save dummy CV:", error);
    return null;
  }
}

// Auto-run if in browser
if (typeof window !== "undefined") {
  console.log("Run addDummyCVToLocalStorage() to add a dummy CV");
}
