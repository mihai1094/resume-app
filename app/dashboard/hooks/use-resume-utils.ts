import { ResumeData } from "@/lib/types/resume";

interface User {
    name?: string | null;
    email?: string | null;
    photoURL?: string | null;
}

// Get user initials for avatar
export const getUserInitials = (user: User | null) => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
};

export const canOptimizeResume = (data?: ResumeData) => {
    if (!data?.personalInfo?.firstName || !data?.personalInfo?.lastName)
        return false;
    return (
        (data.workExperience?.length ?? 0) > 0 ||
        (data.education?.length ?? 0) > 0
    );
};
