import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Edit Resume - ResumeForge",
    description: "Edit your resume with our powerful editor.",
};

interface EditPageProps {
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
}

export default function EditPage({ searchParams }: EditPageProps) {
    const id = typeof searchParams.id === "string" ? searchParams.id : undefined;

    if (!id) {
        redirect("/dashboard");
    }

    redirect(`/editor/${id}`);
}
