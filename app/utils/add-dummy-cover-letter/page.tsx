"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { CoverLetterData } from "@/lib/types/cover-letter";
import { firestoreService } from "@/lib/services/firestore";
import { AuthGuard } from "@/components/auth/auth-guard";

function createDummyCoverLetter(): CoverLetterData {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return {
    id: `cover-letter-${Date.now()}`,
    jobTitle: "Senior Software Engineer",
    jobReference: "REF-2024-001",
    date: dateStr,
    recipient: {
      name: "Sarah Johnson",
      title: "Hiring Manager",
      company: "Tech Innovations Inc.",
      department: "Engineering",
      address: "123 Innovation Drive, San Francisco, CA 94105",
    },
    senderName: "Alexandra Johnson",
    senderEmail: "alexandra.johnson@email.com",
    senderPhone: "+1 (555) 123-4567",
    senderLocation: "San Francisco, CA",
    senderLinkedin: "linkedin.com/in/alexandrajohnson",
    senderWebsite: "https://alexandrajohnson.dev",
    salutation: "Dear Ms. Johnson,",
    openingParagraph:
      "I am writing to express my strong interest in the Senior Software Engineer position at Tech Innovations Inc. With over 5 years of experience building scalable web applications and a proven track record of leading cross-functional teams, I am excited about the opportunity to contribute to your innovative engineering team.",
    bodyParagraphs: [
      "In my current role as Senior Full Stack Developer at Tech Innovations Inc., I have led the development of a microservices-based e-commerce platform serving 100K+ daily active users. I architected and implemented RESTful APIs using Node.js, Express, and PostgreSQL, which reduced application load time by 40% through code optimization and implementing caching strategies.",
      "My expertise extends to modern frontend technologies including React, Next.js, and TypeScript. I have successfully mentored 5 junior developers and conducted weekly code reviews, resulting in a 45% reduction in bug reports through comprehensive testing suites. Additionally, I increased system performance by 60% through database optimization.",
      "I am particularly drawn to Tech Innovations Inc. because of your commitment to cutting-edge technology and innovative solutions. Your recent work on AI-powered features aligns perfectly with my passion for leveraging technology to solve complex problems and create exceptional user experiences.",
    ],
    closingParagraph:
      "I am eager to bring my technical expertise, leadership skills, and passion for innovation to your team. I would welcome the opportunity to discuss how my experience and skills align with your needs. Thank you for considering my application.",
    signOff: "Sincerely,",
    templateId: "modern",
    tone: "professional",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function AddDummyCoverLetterContent() {
  const router = useRouter();
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Block access in production
  const isProduction = process.env.NODE_ENV === "production";

  const handleAddDummyCoverLetter = async () => {
    if (!user) {
      setStatus("error");
      setMessage("No user found. Please log in first.");
      return;
    }

    try {
      // Create the dummy cover letter data
      const dummyData = createDummyCoverLetter();
      const letterId = `cover-letter-${Date.now()}`;
      const letterName = `${dummyData.jobTitle} - ${dummyData.recipient.company}`;

      // Save directly to Firestore
      const success = await firestoreService.saveCoverLetter(
        user.id,
        letterId,
        letterName,
        dummyData
      );

      if (success) {
        setStatus("success");
        setMessage("Dummy cover letter added successfully! Redirecting to dashboard...");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStatus("error");
        setMessage("Failed to save cover letter to Firestore");
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Failed to add cover letter: ${error}`);
    }
  };

  // Show blocked message in production
  if (isProduction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This development utility is not available in production.
            </p>
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Add Dummy Cover Letter (Dev Only)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              ⚠️ This is a development utility. It will be blocked in production.
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-4">
                This utility will add a complete sample cover letter to your saved cover letters
                for testing purposes. The cover letter includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Complete recipient information</li>
                <li>Professional sender details</li>
                <li>Well-structured opening paragraph</li>
                <li>Three body paragraphs with achievements</li>
                <li>Professional closing paragraph</li>
                <li>Modern template format</li>
              </ul>
            </div>

            {status === "idle" && (
              <Button onClick={handleAddDummyCoverLetter} className="w-full" size="lg">
                Add Dummy Cover Letter
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

export default function AddDummyCoverLetterPage() {
  return (
    <AuthGuard>
      <AddDummyCoverLetterContent />
    </AuthGuard>
  );
}


