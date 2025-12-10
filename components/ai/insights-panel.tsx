"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Target, Lightbulb } from "lucide-react";

export function InsightsPanel() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Insights</span>
        <Badge variant="outline" className="text-[11px]">
          AI
        </Badge>
      </div>
      <Separator />
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-foreground font-medium">Run ATS on your JD</p>
            <p>Obține scor, keywords lipsă și sugestii aplicabile.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
          <div>
            <p className="text-foreground font-medium">Tailor & Interview</p>
            <p>
              Generează versiuni pentru job și întrebări de interviu cu
              răspunsuri.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Sfat: Aplică keywords în Skills/Bullets și regenerează cover letter
          pentru același JD.
        </div>
      </div>
    </Card>
  );
}

