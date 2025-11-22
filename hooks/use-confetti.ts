"use client";

import { useCallback, useEffect, useRef } from "react";

interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
}

export function useConfetti() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        // Create canvas element
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9999";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.body.appendChild(canvas);
        canvasRef.current = canvas;

        return () => {
            if (canvasRef.current) {
                document.body.removeChild(canvasRef.current);
            }
        };
    }, []);

    const fire = useCallback((options: ConfettiOptions = {}) => {
        const {
            particleCount = 50,
            spread = 70,
            origin = { x: 0.5, y: 0.5 },
            colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
        } = options;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            size: number;
            life: number;
        }> = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
            const velocity = Math.random() * 10 + 5;

            particles.push({
                x: canvas.width * origin.x,
                y: canvas.height * origin.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                life: 1,
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;

            particles.forEach((particle) => {
                if (particle.life <= 0) return;

                activeParticles++;

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.3; // Gravity
                particle.life -= 0.01;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.fillRect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
                ctx.restore();
            });

            if (activeParticles > 0) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        animate();
    }, []);

    return { fire };
}
