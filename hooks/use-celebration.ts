"use client";

import { useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface CelebrationOptions {
  sectionName?: string;
  message?: string;
  type?: "section-complete" | "resume-complete" | "milestone";
}

const CELEBRATION_MESSAGES = {
  personal: "Personal info complete!",
  experience: "Work experience added!",
  education: "Education section done!",
  skills: "Skills showcased!",
  projects: "Projects highlighted!",
  certifications: "Certifications added!",
  languages: "Languages listed!",
  courses: "Courses documented!",
  hobbies: "Interests shared!",
  "extra-curricular": "Activities recorded!",
  custom: "Custom section complete!",
};

const ENCOURAGING_MESSAGES = [
  "You're on fire!",
  "Keep it up!",
  "Looking great!",
  "Nice progress!",
  "Almost there!",
  "Fantastic work!",
];

export function useCelebration() {
  const lastCelebratedRef = useRef<string | null>(null);

  const celebrate = useCallback((options: CelebrationOptions = {}) => {
    const { sectionName, message, type = "section-complete" } = options;

    // Prevent duplicate celebrations for same section within 5 seconds
    const celebrationKey = `${type}-${sectionName}`;
    if (lastCelebratedRef.current === celebrationKey) {
      return;
    }
    lastCelebratedRef.current = celebrationKey;
    setTimeout(() => {
      if (lastCelebratedRef.current === celebrationKey) {
        lastCelebratedRef.current = null;
      }
    }, 5000);

    // Determine celebration intensity based on type
    if (type === "resume-complete") {
      // Big celebration for completing entire resume
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 50,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
          colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"],
        });
      }, 250);

      toast.success(message || "Resume complete! You're ready to apply!", {
        duration: 5000,
        icon: "🎉",
      });
    } else if (type === "milestone") {
      // Medium celebration for milestones (e.g., 50% complete)
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.7 },
        colors: ["#FF6B6B", "#FFE66D"],
      });

      toast.success(message || "Milestone reached!", {
        duration: 3000,
        icon: "⭐",
      });
    } else {
      // Section complete celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
      });

      const sectionMessage =
        message ||
        (sectionName &&
          CELEBRATION_MESSAGES[
            sectionName as keyof typeof CELEBRATION_MESSAGES
          ]) ||
        "Section complete!";

      const encouragement =
        ENCOURAGING_MESSAGES[
          Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)
        ];

      toast.success(sectionMessage, {
        description: encouragement,
        duration: 3000,
        icon: "✓",
      });
    }
  }, []);

  const celebrateSectionComplete = useCallback(
    (sectionName: string) => {
      celebrate({ sectionName, type: "section-complete" });
    },
    [celebrate]
  );

  const celebrateResumeComplete = useCallback(() => {
    celebrate({ type: "resume-complete" });
  }, [celebrate]);

  const celebrateMilestone = useCallback(
    (message: string) => {
      celebrate({ message, type: "milestone" });
    },
    [celebrate]
  );

  return {
    celebrate,
    celebrateSectionComplete,
    celebrateResumeComplete,
    celebrateMilestone,
  };
}
