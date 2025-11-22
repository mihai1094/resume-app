import { useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";

export interface ProgressBreakdown {
    personalInfo: number;
    workExperience: number;
    education: number;
    skills: number;
    total: number;
}

export function useProgressTracker(data: ResumeData): ProgressBreakdown {
    return useMemo(() => {
        let personalInfoScore = 0;
        let workExperienceScore = 0;
        let educationScore = 0;
        let skillsScore = 0;

        // Personal Info (30% total)
        // Each field is worth 7.5%
        if (data.personalInfo.firstName) personalInfoScore += 7.5;
        if (data.personalInfo.lastName) personalInfoScore += 7.5;
        if (data.personalInfo.email) personalInfoScore += 7.5;
        if (data.personalInfo.phone) personalInfoScore += 7.5;

        // Work Experience (40% total)
        // Has at least 1 entry: 20%
        // All entries complete: 20%
        if (data.workExperience.length > 0) {
            workExperienceScore += 20;

            // Check if all entries are complete
            const allComplete = data.workExperience.every(
                (exp) => exp.position && exp.company && exp.startDate
            );
            if (allComplete) {
                workExperienceScore += 20;
            }
        }

        // Education (20% total)
        // Has at least 1 entry: 10%
        // All entries complete: 10%
        if (data.education.length > 0) {
            educationScore += 10;

            // Check if all entries are complete
            const allComplete = data.education.every(
                (edu) => edu.institution && edu.degree && edu.startDate
            );
            if (allComplete) {
                educationScore += 10;
            }
        }

        // Skills (10% total)
        // Has at least 3 skills: 10%
        if (data.skills.length >= 3) {
            skillsScore += 10;
        }

        const total = Math.round(
            personalInfoScore + workExperienceScore + educationScore + skillsScore
        );

        return {
            personalInfo: personalInfoScore,
            workExperience: workExperienceScore,
            education: educationScore,
            skills: skillsScore,
            total,
        };
    }, [data]);
}
