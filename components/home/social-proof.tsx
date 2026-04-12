"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicTestimonial } from "@/lib/types/testimonial";

export function SocialProof() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadTestimonials() {
            try {
                const response = await fetch("/api/testimonials", {
                    cache: "no-store",
                });

                if (!response.ok) return;

                const data = (await response.json()) as {
                    testimonials?: PublicTestimonial[];
                };

                if (!cancelled) {
                    setTestimonials(data.testimonials ?? []);
                }
            } catch {
                if (!cancelled) {
                    setTestimonials([]);
                }
            }
        }

        void loadTestimonials();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (testimonials.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (testimonials.length === 0) return null;

    return (
        <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                    Real stories from <span className="text-primary italic">real users</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    These quotes come from authenticated ResumeZeus users and appear only after review.
                </p>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                                <Card className="p-6 md:p-8 relative">
                                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                        ))}
                                    </div>

                                    <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage alt={testimonial.name} />
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

                <div className="flex justify-center gap-1 mt-6">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className="flex items-center justify-center min-h-[44px] min-w-[44px]"
                            aria-label={`Go to testimonial ${index + 1}`}
                        >
                            <span className={cn(
                                "h-2 rounded-full transition-all",
                                activeIndex === index
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
        </section>
    );
}
