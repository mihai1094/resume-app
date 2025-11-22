"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
    formatDate,
    sortWorkExperienceByDate,
    sortEducationByDate,
    cn,
} from "@/lib/utils";
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Github,
} from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { useSmartLayout } from "@/hooks/use-smart-layout";

interface AdaptiveTemplateProps {
    data: ResumeData;
    customization?: TemplateCustomization;
}

export function AdaptiveTemplate({ data, customization }: AdaptiveTemplateProps) {
    const layout = useSmartLayout(data);
    const { personalInfo, workExperience, education, skills } = data;
    const sortedExperience = sortWorkExperienceByDate(workExperience);
    const sortedEducation = sortEducationByDate(education);

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

    const fontFamilyClass =
        customization?.fontFamily === "serif"
            ? "font-serif"
            : customization?.fontFamily === "mono"
                ? "font-mono"
                : "font-sans";

    const primaryColor = customization?.primaryColor || "#3b82f6";
    const secondaryColor = customization?.secondaryColor || "#60a5fa";

    // We override some customization if needed for "Smart" layout, 
    // but generally we respect user choice while enforcing layout structure.
    const baseTextStyle: CSSProperties = {
        lineHeight: layout.mode === 'sparse' ? '2' : layout.mode === 'dense' ? '1.25' : '1.5',
    };

    const bulletStyle: CSSProperties = { color: secondaryColor };

    const topSkillCategories = Object.entries(skillsByCategory);

    return (
        <div
            className={cn(
                "w-full bg-white text-black min-h-[297mm] shadow-2xl transition-all duration-500",
                fontFamilyClass,
                layout.margins,
                layout.fontSize
            )}
        >
            {/* Header Section - Adapts to layout */}
            <div className={cn(
                "mb-8 border-b pb-6",
                layout.mode === 'sparse' ? "text-center" : "flex justify-between items-end"
            )} style={{ borderColor: primaryColor }}>
                <div>
                    <h1 className={cn(
                        "font-bold text-black mb-2",
                        layout.mode === 'sparse' ? "text-5xl" : layout.mode === 'dense' ? "text-3xl" : "text-4xl"
                    )}>{fullName || "Your Name"}</h1>
                    <p className={cn(
                        "text-gray-600 max-w-2xl",
                        layout.mode === 'sparse' ? "mx-auto text-lg" : "text-sm"
                    )}>{personalInfo.summary}</p>
                </div>

                {/* Contact Info - Inline for Dense/Balanced, Block for Sparse */}
                <div className={cn(
                    "text-gray-600 text-sm",
                    layout.mode === 'sparse' ? "mt-6 flex flex-wrap justify-center gap-4" : "text-right space-y-1"
                )}>
                    {personalInfo.email && (
                        <div className="flex items-center gap-2 justify-end">
                            <Mail className="w-4 h-4" /> <span>{personalInfo.email}</span>
                        </div>
                    )}
                    {personalInfo.phone && (
                        <div className="flex items-center gap-2 justify-end">
                            <Phone className="w-4 h-4" /> <span>{personalInfo.phone}</span>
                        </div>
                    )}
                    {personalInfo.location && (
                        <div className="flex items-center gap-2 justify-end">
                            <MapPin className="w-4 h-4" /> <span>{personalInfo.location}</span>
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center gap-2 justify-end">
                            <Linkedin className="w-4 h-4" /> <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn("grid grid-cols-12", layout.columnGap)}>
                {/* Main Content Column */}
                <main className={cn(
                    "space-y-8",
                    layout.mode === 'sparse' ? "col-span-12" : "col-span-8"
                )} style={baseTextStyle}>

                    {/* Experience */}
                    {sortedExperience.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                Experience
                            </h2>
                            <div className={cn("space-y-6", layout.mode === 'dense' && "space-y-4")}>
                                {sortedExperience.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-lg">{exp.position}</h3>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                                            </span>
                                        </div>
                                        <div className="text-primary font-medium mb-2">{exp.company}</div>
                                        <ul className="space-y-1 text-gray-700">
                                            {exp.description.map((item, idx) => (
                                                item.trim() && (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="text-primary mt-1.5 text-[10px]">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects (if main column) */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                Projects
                            </h2>
                            <div className="space-y-4">
                                {data.projects.map((project) => (
                                    <div key={project.id}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{project.name}</h3>
                                            {project.url && (
                                                <a href={project.url} className="text-sm text-blue-600 hover:underline">
                                                    View Project
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mt-1">{project.description}</p>
                                        {project.technologies && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* Sidebar Column (or bottom for sparse) */}
                <aside className={cn(
                    "space-y-8",
                    layout.mode === 'sparse' ? "col-span-12 grid grid-cols-2 gap-8" : layout.sidebarWidth
                )}>

                    {/* Skills */}
                    {topSkillCategories.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-2">
                                Skills
                            </h2>
                            <div className="space-y-4">
                                {topSkillCategories.map(([category, categorySkills]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold text-primary mb-1 text-sm">{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categorySkills.map((skill) => (
                                                <span key={skill.id} className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-xs">
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {sortedEducation.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-2">
                                Education
                            </h2>
                            <div className="space-y-4">
                                {sortedEducation.map((edu) => (
                                    <div key={edu.id}>
                                        <div className="font-bold">{edu.institution}</div>
                                        <div className="text-sm">{edu.degree} in {edu.field}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-2">
                                Languages
                            </h2>
                            <div className="space-y-2">
                                {data.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-sm">
                                        <span>{lang.name}</span>
                                        <span className="text-gray-500">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>

            {/* Debug Info (Hidden in print) */}
            <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs print:hidden pointer-events-none opacity-50">
                Mode: {layout.mode}
            </div>
        </div>
    );
}
