"use client";

import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { cn } from "@/lib/utils";

interface SkillCategoryOrdererProps {
  /** Categories in their current display order. */
  order: string[];
  /** Count of skills per category (used for the pill number). */
  counts: Record<string, number>;
  /** Called with the full new category order after a drag or button move. */
  onReorder: (nextOrder: string[]) => void;
}

/**
 * Draggable chips that control how skill categories appear in the rendered
 * resume. The flat skills array is reshuffled so `Object.keys` on the grouped
 * map — which every template iterates — reflects this order.
 *
 * Also exposes keyboard Up/Down buttons on each chip so users who can't drag
 * (touch devices, assistive tech) can still reorder.
 */
export function SkillCategoryOrderer({
  order,
  counts,
  onReorder,
}: SkillCategoryOrdererProps) {
  const reorderByIndex = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    if (startIndex < 0 || endIndex < 0) return;
    if (startIndex >= order.length || endIndex >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(startIndex, 1);
    next.splice(endIndex, 0, moved);
    onReorder(next);
  };

  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(order, reorderByIndex);

  if (order.length < 2) return null;

  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Category order
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          Drag to reorder on resume
        </p>
      </div>

      <ol className="flex flex-wrap gap-1.5">
        {order.map((category, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;
          const count = counts[category] ?? 0;
          const canMoveUp = index > 0;
          const canMoveDown = index < order.length - 1;

          return (
            <li
              key={category}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group inline-flex items-center gap-1 rounded-full border bg-card pl-1.5 pr-1 py-1",
                "cursor-grab active:cursor-grabbing select-none",
                "transition-all",
                isDragging && "opacity-40",
                isDragOver &&
                  "ring-2 ring-primary/40 border-primary/40 -translate-y-0.5",
                !isDragging &&
                  !isDragOver &&
                  "hover:border-primary/30 hover:bg-primary/5"
              )}
              aria-label={`${category} — position ${index + 1} of ${order.length}`}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground/50 shrink-0" />
              <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                {category}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums px-1">
                {count}
              </span>

              {/* Keyboard fallback for non-drag contexts */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => reorderByIndex(index, index - 1)}
                  disabled={!canMoveUp}
                  aria-label={`Move ${category} up`}
                  className={cn(
                    "p-0.5 rounded-md text-muted-foreground/70",
                    "hover:text-foreground hover:bg-muted/60",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  )}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => reorderByIndex(index, index + 1)}
                  disabled={!canMoveDown}
                  aria-label={`Move ${category} down`}
                  className={cn(
                    "p-0.5 rounded-md text-muted-foreground/70",
                    "hover:text-foreground hover:bg-muted/60",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  )}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
