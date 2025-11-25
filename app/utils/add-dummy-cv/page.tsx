"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ResumeData } from "@/lib/types/resume";
import { SavedResume } from "@/hooks/use-saved-resumes";
import { firestoreService } from "@/lib/services/firestore";

function createDummyCV(): ResumeData {
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

export default function AddDummyCVPage() {
  const router = useRouter();
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAddDummyCV = async () => {
    if (!user) {
      setStatus("error");
      setMessage("No user found. Please log in first.");
      return;
    }

    try {
      // Create the dummy CV data
      const dummyData = createDummyCV();
      const resumeId = `resume-${Date.now()}`;

      // Save directly to Firestore
      const success = await firestoreService.saveResume(
        user.id,
        resumeId,
        "Senior Full Stack Developer - Alexandra Johnson",
        "modern",
        dummyData
      );

      if (success) {
        setStatus("success");
        setMessage("Dummy CV added successfully! Redirecting to My Resumes...");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/my-resumes");
        }, 2000);
      } else {
        setStatus("error");
        setMessage("Failed to save dummy CV to Firestore");
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Failed to add dummy CV: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Add Dummy CV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              <p className="mb-4">
                This utility will add a complete dummy CV to your saved resumes
                for testing purposes. The dummy CV includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Complete personal information</li>
                <li>3 work experiences with detailed descriptions</li>
                <li>Education history</li>
                <li>20 technical skills across multiple categories</li>
                <li>3 languages</li>
                <li>3 courses/certifications</li>
                <li>4 hobbies</li>
                <li>2 extra-curricular activities</li>
              </ul>
            </div>

            {status === "idle" && (
              <Button onClick={handleAddDummyCV} className="w-full" size="lg">
                Add Dummy CV
              </Button>
            )}

            {status === "success" && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">{message}</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">{message}</p>
                </div>
              </div>
            )}

            {user && (
              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>Current user: {user.name}</p>
                <p>Email: {user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
