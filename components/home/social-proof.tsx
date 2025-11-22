"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    image?: string;
    content: string;
    rating: number;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: "1",
        name: "Sarah Chen",
        role: "Software Engineer",
        company: "Google",
        content: "I landed my dream job at Google thanks to this resume builder. The ATS optimization really works - I got callbacks from 8 out of 10 applications!",
        rating: 5,
    },
    {
        id: "2",
        name: "Michael Rodriguez",
        role: "Product Manager",
        company: "Amazon",
        content: "The templates are clean and professional. I created my resume in under 5 minutes and started getting interview requests within days.",
        rating: 5,
    },
    {
        id: "3",
        name: "Emily Thompson",
        role: "Marketing Director",
        company: "Meta",
        content: "Best resume builder I've used. The AI optimization suggestions helped me highlight my achievements in a way that really resonated with recruiters.",
        rating: 5,
    },
    {
        id: "4",
        name: "David Kim",
        role: "Data Scientist",
        company: "Microsoft",
        content: "Finally, a resume builder that understands ATS systems. My callback rate increased by 60% after switching to this platform.",
        rating: 5,
    },
];

export function SocialProof() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                    Trusted by Job Seekers Worldwide
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of professionals who landed their dream jobs
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
                <div>
                    <div className="text-3xl md:text-4xl font-bold text-primary">10,000+</div>
                    <div className="text-sm text-muted-foreground mt-1">Resumes Created</div>
                </div>
                <div>
                    <div className="text-3xl md:text-4xl font-bold text-primary">4.9/5</div>
                    <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
                </div>
                <div>
                    <div className="text-3xl md:text-4xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
                </div>
                <div>
                    <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground mt-1">Countries</div>
                </div>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {TESTIMONIALS.map((testimonial) => (
                            <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                                <Card className="p-6 md:p-8 relative">
                                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
                                        "{testimonial.content}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {testimonial.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{testimonial.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {testimonial.role} at {testimonial.company}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-2 mt-6">
                    {TESTIMONIALS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                activeIndex === index
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Company Logos */}
            <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground uppercase tracking-wider">
                    Our users work at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
                    {["Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix"].map((company) => (
                        <div
                            key={company}
                            className="text-xl md:text-2xl font-bold text-muted-foreground"
                        >
                            {company}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
