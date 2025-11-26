import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CreateResumeCardProps {
    hasResumes: boolean;
    onClick: () => void;
}

export function CreateResumeCard({ hasResumes, onClick }: CreateResumeCardProps) {
    return (
        <Card
            className="border-dashed border-2 hover:border-primary hover:bg-accent/50 transition-all cursor-pointer group min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] flex items-center justify-center"
            onClick={onClick}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Create New Resume</h3>
                <p className="text-sm text-muted-foreground">
                    {hasResumes
                        ? "Start from scratch or choose a template"
                        : "Get started with our guided resume builder"}
                </p>
            </CardContent>
        </Card>
    );
}
