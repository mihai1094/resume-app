import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ATSResult } from "@/lib/ats/engine";
import { AlertTriangle, CheckCircle2, XCircle, ChevronRight, Trophy, Target, PenTool, ShieldCheck, BarChart3, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ATSScoreCardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: ATSResult | null;
    onAnalyzeWithJD?: (jd: string) => void;
}

export function ATSScoreCard({ open, onOpenChange, result, onAnalyzeWithJD }: ATSScoreCardProps) {
    const [jd, setJd] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const handleAnalyzeJD = () => {
        if (onAnalyzeWithJD && jd.trim()) {
            setIsAnalyzing(true);
            // Simulate small delay for effect
            setTimeout(() => {
                onAnalyzeWithJD(jd);
                setIsAnalyzing(false);
            }, 500);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        ATS Score Analysis
                    </DialogTitle>
                    <DialogDescription>
                        See how well your resume parses against Applicant Tracking Systems.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 p-6 pt-4">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="issues" className="flex items-center gap-2">
                                <ListChecks className="w-4 h-4" /> Issues
                                {result.issues.filter(i => i.type === 'critical').length > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {result.issues.filter(i => i.type === 'critical').length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="keywords" className="flex items-center gap-2">
                                <Target className="w-4 h-4" /> Keywords
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {/* Main Score */}
                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <div className="relative flex items-center justify-center w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-muted/20"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={351.86}
                                            strokeDashoffset={351.86 - (351.86 * result.totalScore) / 100}
                                            className={cn("transition-all duration-1000 ease-out", getScoreColor(result.totalScore))}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className={cn("text-4xl font-bold", getScoreColor(result.totalScore))}>
                                            {result.totalScore}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                            Score
                                        </span>
                                    </div>
                                </div>
                                <p className="text-center text-muted-foreground text-sm max-w-xs">
                                    {result.totalScore >= 80
                                        ? "Excellent! Your resume is highly optimized for ATS."
                                        : result.totalScore >= 60
                                            ? "Good start. Fix the warnings below to improve your ranking."
                                            : "Needs improvement. Critical issues may block your resume."}
                                </p>
                            </div>

                            {/* Category Breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <CategoryCard
                                    title="Contact Info"
                                    score={result.breakdown.contact.score}
                                    max={result.breakdown.contact.maxScore}
                                />
                                <CategoryCard
                                    title="Structure"
                                    score={result.breakdown.structure.score}
                                    max={result.breakdown.structure.maxScore}
                                />
                                <CategoryCard
                                    title="Content"
                                    score={result.breakdown.content.score}
                                    max={result.breakdown.content.maxScore}
                                />
                                <CategoryCard
                                    title="Skills"
                                    score={result.breakdown.skills.score}
                                    max={result.breakdown.skills.maxScore}
                                />
                                <CategoryCard
                                    title="Parsing Safety"
                                    score={result.breakdown.parsingSafety.score}
                                    max={result.breakdown.parsingSafety.maxScore}
                                    icon={<ShieldCheck className="w-3 h-3 mr-1" />}
                                />
                                {result.breakdown.jobMatch && (
                                    <CategoryCard
                                        title="Job Match"
                                        score={result.breakdown.jobMatch.score}
                                        max={result.breakdown.jobMatch.maxScore}
                                        highlight
                                    />
                                )}
                            </div>

                            {/* Job Description Match Input */}
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold text-sm">Target Job Match</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Paste the job description to see how well your resume matches specific keywords.
                                </p>
                                <Textarea
                                    placeholder="Paste job description here..."
                                    className="min-h-[80px] text-xs mb-2 resize-none"
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                />
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={handleAnalyzeJD}
                                    disabled={!jd.trim() || isAnalyzing}
                                >
                                    {isAnalyzing ? "Analyzing..." : "Analyze Match"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="issues" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                    Detailed Analysis
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {result.issues.length} issues found
                                </span>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {result.issues.map((issue, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="py-2 hover:no-underline">
                                            <div className="flex items-start gap-3 text-left">
                                                {issue.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />}
                                                {issue.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />}
                                                {issue.type === 'critical' && <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={cn("text-sm font-medium",
                                                        issue.type === 'critical' ? "text-destructive" : "text-foreground"
                                                    )}>
                                                        {issue.message}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        {issue.suggestion && (
                                            <AccordionContent className="pl-8 text-muted-foreground">
                                                <div className="bg-muted/50 p-3 rounded-md text-sm flex gap-2">
                                                    <PenTool className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                                                    <div>
                                                        <strong className="text-foreground">Suggestion:</strong> {issue.suggestion}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        )}
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </TabsContent>

                        <TabsContent value="keywords" className="space-y-6">
                            {!result.keywordDensity || result.keywordDensity.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p>Paste a Job Description in the Overview tab to see keyword analysis.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                        <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-1">
                                            Keyword Density Analysis
                                        </h4>
                                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                            ATS systems prefer a keyword density between 1-3%. Too low means you might be missed; too high looks like spam.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {result.keywordDensity.map((k, i) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium capitalize">{k.keyword}</span>
                                                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                                                        k.status === 'optimal' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                            k.status === 'low' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {k.density.toFixed(1)}% ({k.status})
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full",
                                                            k.status === 'optimal' ? "bg-green-500" :
                                                                k.status === 'low' ? "bg-yellow-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${Math.min(k.density * 20, 100)}%` }} // Scale for visibility
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Found {k.count} times. {k.status === 'low' ? "Try using it more often." : k.status === 'high' ? "Reduce usage slightly." : "Perfect usage."}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CategoryCard({ title, score, max, highlight = false, icon }: { title: string; score: number; max: number; highlight?: boolean; icon?: React.ReactNode }) {
    const percentage = Math.round((score / max) * 100);

    return (
        <div className={cn("p-3 rounded-lg border bg-card", highlight && "border-primary/50 bg-primary/5")}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    {icon}
                    <span className="text-xs font-medium text-muted-foreground">{title}</span>
                </div>
                <span className={cn("text-xs font-bold",
                    percentage >= 80 ? "text-green-500" :
                        percentage >= 50 ? "text-yellow-500" : "text-red-500"
                )}>
                    {score}/{max}
                </span>
            </div>
            <Progress value={percentage} className="h-1.5" />
        </div>
    );
}
