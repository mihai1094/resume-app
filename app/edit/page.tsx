import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Edit Resume - ResumeForge",
    description: "Edit your resume with our powerful editor.",
};

interface EditPageProps {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function EditPage({ searchParams }: EditPageProps) {
    const params = await searchParams;
    const id = typeof params.id === "string" ? params.id : undefined;

    if (!id) {
        redirect("/dashboard");
    }

    redirect(`/editor/${id}`);
}
