"use client";

import { useState, useMemo } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { filterBullets, getCategories, BulletPoint } from "@/lib/data/bullet-library";
import { cn } from "@/lib/utils";

interface BulletSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectBullet: (bullet: string) => void;
    jobTitle?: string;
}

export function BulletSelector({
    open,
    onOpenChange,
    onSelectBullet,
    jobTitle,
}: BulletSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = useMemo(() => getCategories(), []);

    const filteredBullets = useMemo(() => {
        let bullets = filterBullets(searchQuery, jobTitle);

        if (selectedCategory) {
            bullets = bullets.filter((b) => b.category === selectedCategory);
        }

        // If no search query and no category, show bullets for job title
        if (!searchQuery && !selectedCategory && jobTitle) {
            bullets = filterBullets("", jobTitle);
        }

        return bullets;
    }, [searchQuery, selectedCategory, jobTitle]);

    const handleSelectBullet = (bullet: BulletPoint) => {
        onSelectBullet(bullet.text);
        onOpenChange(false);
        setSearchQuery("");
        setSelectedCategory(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Browse Example Bullet Points</DialogTitle>
                    <DialogDescription>
                        Click on any bullet point to add it to your resume. You can customize it after adding.
                        {jobTitle && (
                            <span className="block mt-1 text-primary font-medium">
                                Showing bullets for: {jobTitle}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by keyword (e.g., 'leadership', 'analytics', 'revenue')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>

                    {/* Results */}
                    <ScrollArea className="h-[400px] pr-4">
                        {filteredBullets.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No matching bullet points found.</p>
                                <p className="text-sm mt-2">Try a different search term or category.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredBullets.map((bullet) => (
                                    <button
                                        key={bullet.id}
                                        onClick={() => handleSelectBullet(bullet)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-lg border-2 transition-all",
                                            "hover:border-primary hover:bg-primary/5",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Plus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm leading-relaxed">{bullet.text}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {bullet.category}
                                                    </Badge>
                                                    {bullet.keywords.slice(0, 3).map((keyword) => (
                                                        <Badge key={keyword} variant="outline" className="text-xs">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            {filteredBullets.length} bullet{filteredBullets.length !== 1 ? "s" : ""} available
                        </p>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
