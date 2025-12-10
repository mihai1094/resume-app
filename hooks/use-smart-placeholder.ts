"use client";

import { useState, useEffect, useCallback } from "react";

// Placeholder examples for different field types
const PLACEHOLDER_EXAMPLES: Record<string, string[]> = {
  // Personal Info
  firstName: [
    "John",
    "Sarah",
    "Michael",
    "Emily",
    "David",
  ],
  lastName: [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Davis",
  ],
  jobTitle: [
    "Software Engineer",
    "Product Manager",
    "Marketing Specialist",
    "Data Analyst",
    "UX Designer",
  ],
  email: [
    "john.doe@email.com",
    "professional@example.com",
    "yourname@domain.com",
  ],
  phone: [
    "+1 (555) 123-4567",
    "(555) 987-6543",
    "+44 20 7123 4567",
  ],
  location: [
    "San Francisco, CA",
    "New York, NY",
    "London, UK",
    "Remote",
    "Austin, TX",
  ],
  linkedin: [
    "linkedin.com/in/yourprofile",
    "linkedin.com/in/johndoe",
  ],
  website: [
    "yourportfolio.com",
    "github.com/username",
    "dribbble.com/designer",
  ],

  // Work Experience
  company: [
    "Google",
    "Microsoft",
    "Startup Inc.",
    "Tech Solutions Ltd.",
    "Innovation Corp.",
  ],
  position: [
    "Senior Software Engineer",
    "Product Manager",
    "Team Lead",
    "Marketing Director",
    "Full Stack Developer",
  ],
  workDescription: [
    "Led cross-functional team of 5 engineers to deliver...",
    "Increased user engagement by 40% through...",
    "Architected and deployed microservices handling...",
    "Managed $2M budget for marketing campaigns...",
    "Reduced deployment time by 60% by implementing...",
  ],
  bullet: [
    "Increased revenue by 25% through strategic initiatives",
    "Led team of 8 engineers to deliver product on time",
    "Reduced customer churn by 15% with new features",
    "Automated manual processes saving 20 hours/week",
    "Launched mobile app reaching 100K+ users in first month",
  ],

  // Education
  school: [
    "Stanford University",
    "MIT",
    "University of California, Berkeley",
    "Harvard Business School",
    "Georgia Tech",
  ],
  degree: [
    "Bachelor of Science",
    "Master of Business Administration",
    "Bachelor of Arts",
    "Master of Science",
    "Ph.D.",
  ],
  fieldOfStudy: [
    "Computer Science",
    "Business Administration",
    "Economics",
    "Data Science",
    "Mechanical Engineering",
  ],
  gpa: [
    "3.8/4.0",
    "3.9",
    "First Class Honours",
    "Summa Cum Laude",
  ],

  // Projects
  projectName: [
    "E-commerce Platform Redesign",
    "Mobile App Development",
    "AI Chatbot Integration",
    "Data Analytics Dashboard",
    "Open Source Library",
  ],
  projectDescription: [
    "Built full-stack e-commerce platform using React and Node.js...",
    "Developed iOS/Android app with 50K+ downloads...",
    "Created machine learning model for customer sentiment...",
    "Designed real-time dashboard tracking KPIs...",
  ],
  projectUrl: [
    "github.com/username/project",
    "project-demo.netlify.app",
    "apps.apple.com/app/myapp",
  ],

  // Certifications
  certName: [
    "AWS Solutions Architect",
    "Google Cloud Professional",
    "PMP Certification",
    "Scrum Master (CSM)",
    "CISSP",
  ],
  certIssuer: [
    "Amazon Web Services",
    "Google",
    "Project Management Institute",
    "Scrum Alliance",
    "(ISC)²",
  ],

  // Summary
  summary: [
    "Results-driven software engineer with 5+ years of experience building scalable web applications...",
    "Strategic marketing leader with proven track record of driving 40%+ growth...",
    "Data scientist passionate about turning complex datasets into actionable insights...",
    "Product manager with 7+ years launching products used by millions...",
  ],

  // Skills
  skill: [
    "JavaScript",
    "Python",
    "React",
    "SQL",
    "Project Management",
    "Data Analysis",
    "Leadership",
    "Communication",
  ],

  // Generic
  default: [
    "Enter your information here",
    "Type something...",
  ],
};

// Rotation interval in milliseconds
const ROTATION_INTERVAL = 3000;

interface UseSmartPlaceholderOptions {
  type: keyof typeof PLACEHOLDER_EXAMPLES | string;
  enabled?: boolean;
  rotationInterval?: number;
}

export function useSmartPlaceholder({
  type,
  enabled = true,
  rotationInterval = ROTATION_INTERVAL,
}: UseSmartPlaceholderOptions) {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate through examples
  useEffect(() => {
    if (!enabled || examples.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % examples.length);
        setIsAnimating(false);
      }, 150); // Short fade duration
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [enabled, examples.length, rotationInterval]);

  const getNextExample = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  }, [examples.length]);

  return {
    placeholder: examples[currentIndex],
    isAnimating,
    getNextExample,
    allExamples: examples,
  };
}

// Component version for easier use
export function getPlaceholder(type: keyof typeof PLACEHOLDER_EXAMPLES | string): string {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  return examples[0];
}

// Get random placeholder
export function getRandomPlaceholder(type: keyof typeof PLACEHOLDER_EXAMPLES | string): string {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  return examples[Math.floor(Math.random() * examples.length)];
}

export type PlaceholderType = keyof typeof PLACEHOLDER_EXAMPLES;
