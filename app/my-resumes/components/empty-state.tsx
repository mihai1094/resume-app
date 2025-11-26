import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Check, Plus } from "lucide-react";

interface EmptyStateProps {
    onCreateResume: () => void;
    onImportJSON: () => void;
}

export function EmptyState({ onCreateResume, onImportJSON }: EmptyStateProps) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                    You&apos;re ready to build
                </h2>
                <p className="text-muted-foreground text-center mb-6 max-w-xl">
                    Kick things off with a fresh template or bring in an existing resume to
                    upgrade it with ResumeForge tools.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        Guided sections with completion tracking
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        Real-time preview across every template
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        Import JSON exports from other builders
                    </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button className="flex-1 sm:flex-none" onClick={onCreateResume}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Resume
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={onImportJSON}
                    >
                        Import JSON
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
