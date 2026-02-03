import { Industry, SeniorityLevel } from "@/lib/ai/content-types";

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

export const INDUSTRY_OPTIONS: SelectOption<Industry>[] = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "engineering", label: "Engineering" },
    { value: "education", label: "Education" },
    { value: "legal", label: "Legal" },
    { value: "consulting", label: "Consulting" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" },
    { value: "hospitality", label: "Hospitality" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "government", label: "Government" },
    { value: "other", label: "Other" },
];

export const SENIORITY_OPTIONS: SelectOption<SeniorityLevel>[] = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "executive", label: "Executive" },
];
