import { z } from "zod";

/**
 * Zod schemas for resume data validation.
 * These schemas provide both structural integrity and semantic validation.
 * 
 * We distinguish between:
 * 1. Minimal Schema: Required for saving/progression (Hard Errors)
 * 2. Full Schema: Recommended for a high-quality resume (Warnings/Suggestions)
 */

// Field-level regex and helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s-]{8,15}$/;

/**
 * MINIMAL SCHEMAS (Hard Errors)
 * These fields must be valid to proceed.
 */

export const MinimalPersonalInfoSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    // phone, location, etc. are NOT required in the minimal schema
});

export const MinimalResumeDataSchema = z.object({
    personalInfo: MinimalPersonalInfoSchema,
    // Other sections can be empty in the minimal schema
});

/**
 * FULL SCHEMAS (Recommendations / Warnings)
 * These fields should be present for a complete resume.
 */

export const FullPersonalInfoSchema = MinimalPersonalInfoSchema.extend({
    phone: z.string().refine((val) => !val || phoneRegex.test(val.replace(/\D/g, "")), {
        message: "Use a valid phone with country/area code",
    }),
    location: z.string().min(1, "Location is recommended"),
    website: z.string().url("Invalid URL format").optional().or(z.literal("")),
    linkedin: z.string().optional().or(z.literal("")),
    github: z.string().optional().or(z.literal("")),
    summary: z.string().min(40, "Consider adding more detail to your summary").optional().or(z.literal("")),
});

export const FullWorkExperienceSchema = z.object({
    id: z.string(),
    company: z.string().min(1, "Add company name for completeness"),
    position: z.string().min(1, "Add position title for completeness"),
    location: z.string().optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    current: z.boolean().default(false),
    description: z.array(z.string()).refine((bullets) => bullets.length > 0 && bullets.some(b => b.trim().length > 0), {
        message: "Consider adding responsibilities",
    }),
}).refine((data) => {
    if (!data.current && !data.endDate) return false;
    if (data.endDate && new Date(data.startDate) > new Date(data.endDate)) return false;
    return true;
}, {
    message: "Start date must be before end date",
    path: ["dates"],
});

export const FullEducationSchema = z.object({
    id: z.string(),
    institution: z.string().min(1, "Add institution name for completeness"),
    degree: z.string().min(1, "Add degree for completeness"),
    field: z.string().min(1, "Add field of study for completeness"),
    location: z.string().optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    current: z.boolean().default(false),
}).refine((data) => {
    if (!data.current && !data.endDate) return false;
    if (data.endDate && new Date(data.startDate) > new Date(data.endDate)) return false;
    return true;
}, {
    message: "Start date must be before end date",
    path: ["dates"],
});

export const FullSkillSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Add skill name"),
    category: z.string().min(1, "Pick a category"),
});

export const FullResumeDataSchema = z.object({
    personalInfo: FullPersonalInfoSchema,
    workExperience: z.array(FullWorkExperienceSchema),
    education: z.array(FullEducationSchema),
    skills: z.array(FullSkillSchema),
    projects: z.array(z.any()).optional(),
    languages: z.array(z.any()).optional(),
    certifications: z.array(z.any()).optional(),
    courses: z.array(z.any()).optional(),
    hobbies: z.array(z.any()).optional(),
    extraCurricular: z.array(z.any()).optional(),
    customSections: z.array(z.any()).optional(),
});
