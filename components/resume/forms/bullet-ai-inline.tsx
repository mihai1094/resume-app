"use client";

import { useEffect, useState, useCallback } from "react";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { useAiAction } from "@/hooks/use-ai-action";
import { AiActionContract } from "@/lib/ai/action-contract";
import { Sparkles, Gauge } from "lucide-react";
import { authPost } from "@/lib/api/auth-fetch";

interface BulletAiInlineProps {
  bullet: string;
  expId: string;
  bulletIndex: number;
  onApply: (newValue: string) => void;
}

const improveContract: AiActionContract = {
  inputs: ["section"],
  output: "Clearer, impact-focused bullet point",
  notes: ["Keeps role context from this section only"],
};

const quantifyContract: AiActionContract = {
  inputs: ["section"],
  output: "Bullet with measurable metrics added",
  notes: ["Adds numbers based on implied impact"],
};

export function BulletAiInline({
  bullet,
  expId,
  bulletIndex,
  onApply,
}: BulletAiInlineProps) {
  const [improveOpen, setImproveOpen] = useState(false);
  const [quantifyOpen, setQuantifyOpen] = useState(false);

  const improve = useAiAction<string>({
    actionName: "improve-bullet",
    surface: `work-${expId}-bullet-${bulletIndex}`,
    onApply: (value) => onApply(value),
  });

  const quantify = useAiAction<string>({
    actionName: "quantify-bullet",
    surface: `work-${expId}-bullet-${bulletIndex}`,
    onApply: (value) => onApply(value),
  });

  useEffect(() => {
    if (improve.status === "ready") {
      setImproveOpen(true);
    }
  }, [improve.status]);

  useEffect(() => {
    if (quantify.status === "ready") {
      setQuantifyOpen(true);
    }
  }, [quantify.status]);

  const runImprove = useCallback(async () => {
    if (bullet.trim().length < 10) {
      throw new Error("Add more detail before improving (min 10 chars).");
    }
    const response = await authPost("/api/ai/improve-bullet", {
      bulletPoint: bullet,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to improve bullet");
    }

    const data = await response.json();
    return data.result?.improvedVersion || bullet;
  }, [bullet]);

  const runQuantify = useCallback(async () => {
    if (bullet.trim().length < 10) {
      throw new Error("Add more detail before quantifying (min 10 chars).");
    }
    const response = await authPost("/api/ai/quantify-achievement", {
      statement: bullet,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to quantify bullet");
    }

    const data = await response.json();
    const first = data.suggestions?.[0];
    return first?.example || bullet;
  }, [bullet]);

  return (
    <>
      <AiAction
        label="Improve"
        icon={<Sparkles className="h-4 w-4" />}
        status={improve.status}
        contract={improveContract}
        onClick={() => improve.run(runImprove)}
      />
      <AiAction
        label="Quantify"
        icon={<Gauge className="h-4 w-4" />}
        status={quantify.status}
        contract={quantifyContract}
        onClick={() => quantify.run(runQuantify)}
      />

      <AiPreviewSheet
        open={improveOpen}
        onOpenChange={setImproveOpen}
        title="Improve bullet"
        description="Preview the AI-improved bullet before applying."
        contract={improveContract}
        status={improve.status}
        suggestion={improve.suggestion || undefined}
        previousText={bullet}
        onApply={() => {
          improve.apply(bullet);
          setImproveOpen(false);
        }}
        onUndo={improve.undo}
        canUndo={improve.canUndo}
        onDiscard={() => {
          improve.reset();
          setImproveOpen(false);
        }}
      />

      <AiPreviewSheet
        open={quantifyOpen}
        onOpenChange={setQuantifyOpen}
        title="Add metrics"
        description="Preview quantified bullet before replacing."
        contract={quantifyContract}
        status={quantify.status}
        suggestion={quantify.suggestion || undefined}
        previousText={bullet}
        onApply={() => {
          quantify.apply(bullet);
          setQuantifyOpen(false);
        }}
        onUndo={quantify.undo}
        canUndo={quantify.canUndo}
        onDiscard={() => {
          quantify.reset();
          setQuantifyOpen(false);
        }}
      />
    </>
  );
}

