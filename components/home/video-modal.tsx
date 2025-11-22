"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface VideoModalProps {
    trigger?: React.ReactNode;
    videoUrl?: string;
    title?: string;
}

export function VideoModal({
    trigger,
    videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title = "ResumeForge Demo",
}: VideoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsOpen(true)}
                    className="gap-2"
                >
                    <Play className="w-4 h-4" />
                    Watch Demo
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full aspect-video bg-black">
                        {isOpen && (
                            <iframe
                                src={videoUrl}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
