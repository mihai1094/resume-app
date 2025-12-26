"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsCounterProps {
  currentScore: number;
  estimatedNewScore: number;
  recentGain?: number | null;
  className?: string;
}

export function PointsCounter({
  currentScore,
  estimatedNewScore,
  recentGain,
  className,
}: PointsCounterProps) {
  const [showGain, setShowGain] = useState(false);
  const [displayGain, setDisplayGain] = useState<number | null>(null);

  // Trigger animation when recentGain changes
  useEffect(() => {
    if (recentGain && recentGain > 0) {
      setDisplayGain(recentGain);
      setShowGain(true);

      // Hide after animation
      const timer = setTimeout(() => {
        setShowGain(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [recentGain]);

  const improvement = estimatedNewScore - currentScore;

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      {/* Original score */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Score:</span>
        <span className="font-medium text-muted-foreground">{currentScore}%</span>

        {improvement > 0 && (
          <>
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <motion.span
              key={estimatedNewScore}
              initial={{ scale: 1.2, color: "rgb(22, 163, 74)" }}
              animate={{ scale: 1, color: "rgb(22, 163, 74)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-bold"
            >
              {estimatedNewScore}%
            </motion.span>
          </>
        )}
      </div>

      {/* Floating points gain animation */}
      <AnimatePresence>
        {showGain && displayGain && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute -right-8 -top-1 pointer-events-none"
          >
            <span className="text-sm font-bold text-green-600 whitespace-nowrap">
              +{displayGain}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for mobile
export function PointsCounterCompact({
  currentScore,
  estimatedNewScore,
  className,
}: Omit<PointsCounterProps, "recentGain">) {
  const improvement = estimatedNewScore - currentScore;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {improvement > 0 ? (
        <>
          <motion.span
            key={estimatedNewScore}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="font-bold text-green-600"
          >
            {estimatedNewScore}%
          </motion.span>
          <span className="text-xs text-green-600">(+{improvement})</span>
        </>
      ) : (
        <span className="font-medium">{currentScore}%</span>
      )}
    </div>
  );
}
