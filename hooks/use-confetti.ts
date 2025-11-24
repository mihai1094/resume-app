"use client";

import { useCallback, useEffect, useRef } from "react";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  intensity?: "low" | "medium" | "high" | "explosive";
}

type ParticleShape = "circle" | "square" | "star" | "ribbon" | "sparkle";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  wobble: number;
  wobbleSpeed: number;
  gravity: number;
  drag: number;
  ribbonLength?: number;
  trail?: Array<{ x: number; y: number }>;
  glow?: boolean;
  scale: number;
  scaleDirection: number;
}

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

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

    const updateSize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      window.removeEventListener("resize", updateSize);
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number
  ) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawSparkle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw 4-pointed sparkle
    ctx.beginPath();
    const points = 4;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? size : size * 0.15;
      const angle = (i * Math.PI) / points;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawRibbon = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (!particle.trail || particle.trail.length < 2) return;

    ctx.save();
    ctx.globalAlpha = particle.life / particle.maxLife;

    // Draw ribbon as a curved path
    ctx.beginPath();
    ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

    for (let i = 1; i < particle.trail.length - 1; i++) {
      const xc = (particle.trail[i].x + particle.trail[i + 1].x) / 2;
      const yc = (particle.trail[i].y + particle.trail[i + 1].y) / 2;
      ctx.quadraticCurveTo(particle.trail[i].x, particle.trail[i].y, xc, yc);
    }

    ctx.strokeStyle = particle.color;
    ctx.lineWidth = particle.size * (particle.life / particle.maxLife);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  };

  const createParticle = (
    x: number,
    y: number,
    colors: string[],
    intensity: number
  ): Particle => {
    const shapes: ParticleShape[] = [
      "circle",
      "square",
      "star",
      "ribbon",
      "sparkle",
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const angle = Math.random() * Math.PI * 2;
    const velocity = (Math.random() * 8 + 4) * intensity;
    const isGlowing = Math.random() > 0.7;

    const particle: Particle = {
      x,
      y,
      vx: Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.75),
      vy:
        Math.sin(angle) * velocity * (Math.random() * 0.5 + 0.75) -
        Math.random() * 4 * intensity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: shape === "ribbon" ? Math.random() * 3 + 2 : Math.random() * 8 + 4,
      life: 1,
      maxLife: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      shape,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      gravity: 0.12 + Math.random() * 0.08,
      drag: 0.98 + Math.random() * 0.01,
      glow: isGlowing,
      scale: 1,
      scaleDirection: Math.random() > 0.5 ? 1 : -1,
    };

    if (shape === "ribbon") {
      particle.trail = [{ x, y }];
      particle.ribbonLength = Math.floor(Math.random() * 10) + 8;
      particle.gravity = 0.08;
    }

    return particle;
  };

  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      particleCount = 80,
      spread = 360,
      origin = { x: 0.5, y: 0.5 },
      colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E9",
        "#F8B500",
        "#FF6F61",
        "#6B5B95",
        "#88B04B",
        "#F7CAC9",
      ],
      intensity = "high",
    } = options;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const intensityMultiplier = {
      low: 0.5,
      medium: 0.8,
      high: 1.2,
      explosive: 2,
    }[intensity];

    const originX = (canvas.width / window.devicePixelRatio) * origin.x;
    const originY = (canvas.height / window.devicePixelRatio) * origin.y;

    // Create initial burst of particles
    const count = Math.floor(particleCount * intensityMultiplier);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(
        createParticle(originX, originY, colors, intensityMultiplier)
      );
    }

    // Create secondary bursts for explosive effect
    if (intensity === "explosive" || intensity === "high") {
      setTimeout(() => {
        for (let i = 0; i < count * 0.3; i++) {
          particlesRef.current.push(
            createParticle(
              originX + (Math.random() - 0.5) * 100,
              originY + (Math.random() - 0.5) * 50,
              colors,
              intensityMultiplier * 0.8
            )
          );
        }
      }, 100);

      setTimeout(() => {
        for (let i = 0; i < count * 0.2; i++) {
          particlesRef.current.push(
            createParticle(
              originX + (Math.random() - 0.5) * 150,
              originY + (Math.random() - 0.5) * 80,
              colors,
              intensityMultiplier * 0.6
            )
          );
        }
      }, 200);
    }

    // Start animation if not already running
    if (!animationRef.current) {
      const animate = () => {
        ctx.clearRect(
          0,
          0,
          canvas.width / window.devicePixelRatio,
          canvas.height / window.devicePixelRatio
        );

        particlesRef.current = particlesRef.current.filter((particle) => {
          if (particle.life <= 0) return false;

          // Update physics
          particle.wobble += particle.wobbleSpeed;
          particle.vx *= particle.drag;
          particle.vy *= particle.drag;
          particle.vy += particle.gravity;
          particle.x += particle.vx + Math.sin(particle.wobble) * 0.5;
          particle.y += particle.vy;
          particle.rotation += particle.rotationSpeed;
          particle.life -= 0.008;

          // Pulsing scale for sparkles
          if (particle.shape === "sparkle") {
            particle.scale += particle.scaleDirection * 0.02;
            if (particle.scale > 1.3 || particle.scale < 0.7) {
              particle.scaleDirection *= -1;
            }
          }

          // Update ribbon trail
          if (particle.shape === "ribbon" && particle.trail) {
            particle.trail.unshift({ x: particle.x, y: particle.y });
            if (particle.trail.length > (particle.ribbonLength || 10)) {
              particle.trail.pop();
            }
          }

          // Draw particle
          const alpha = Math.pow(particle.life / particle.maxLife, 0.5);
          ctx.save();
          ctx.globalAlpha = alpha;

          // Add glow effect for glowing particles
          if (particle.glow && particle.life > 0.3) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
          }

          ctx.fillStyle = particle.color;

          const size = particle.size * particle.scale;

          switch (particle.shape) {
            case "circle":
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
              ctx.fill();
              break;

            case "square":
              ctx.save();
              ctx.translate(particle.x, particle.y);
              ctx.rotate(particle.rotation);
              ctx.fillRect(-size / 2, -size / 2, size, size);
              ctx.restore();
              break;

            case "star":
              drawStar(
                ctx,
                particle.x,
                particle.y,
                size / 2,
                particle.rotation
              );
              break;

            case "sparkle":
              drawSparkle(
                ctx,
                particle.x,
                particle.y,
                size / 2,
                particle.rotation
              );
              break;

            case "ribbon":
              drawRibbon(ctx, particle);
              break;
          }

          ctx.restore();
          return true;
        });

        if (particlesRef.current.length > 0) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // Celebration burst - multiple sequential explosions
  const celebrate = useCallback(
    (options: Omit<ConfettiOptions, "intensity"> = {}) => {
      const { origin = { x: 0.5, y: 0.5 } } = options;

      // Center burst
      fire({ ...options, intensity: "explosive", origin });

      // Side bursts
      setTimeout(() => {
        fire({
          ...options,
          intensity: "high",
          origin: { x: 0.2, y: 0.6 },
          particleCount: 40,
        });
        fire({
          ...options,
          intensity: "high",
          origin: { x: 0.8, y: 0.6 },
          particleCount: 40,
        });
      }, 150);

      // Top corners
      setTimeout(() => {
        fire({
          ...options,
          intensity: "medium",
          origin: { x: 0.1, y: 0.3 },
          particleCount: 25,
        });
        fire({
          ...options,
          intensity: "medium",
          origin: { x: 0.9, y: 0.3 },
          particleCount: 25,
        });
      }, 300);
    },
    [fire]
  );

  // Cannon effect - shoots from bottom corners
  const cannon = useCallback(
    (
      side: "left" | "right" | "both" = "both",
      options: Omit<ConfettiOptions, "origin"> = {}
    ) => {
      const fireFromSide = (x: number) => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            fire({
              ...options,
              intensity: "high",
              origin: { x, y: 1 },
              particleCount: 30,
            });
          }, i * 100);
        }
      };

      if (side === "left" || side === "both") fireFromSide(0.1);
      if (side === "right" || side === "both") fireFromSide(0.9);
    },
    [fire]
  );

  return { fire, celebrate, cannon };
}
