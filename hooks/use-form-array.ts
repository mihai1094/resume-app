"use client";

import { useState, useEffect, useCallback } from "react";
import { useDragAndDrop } from "./use-drag-and-drop";
import { useConfirmationDialog } from "./use-confirmation-dialog";

interface UseFormArrayOptions<T> {
  items: T[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<T>) => void;
  onRemove: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  isItemComplete?: (item: T) => boolean;
  autoExpandIncomplete?: boolean;
  confirmRemove?: boolean;
}

/**
 * Reusable hook for managing form arrays with accordion/collapsible behavior
 *
 * @template T - Type of items in the array (must have an 'id' property)
 *
 * @example
 * const {
 *   items,
 *   expandedIds,
 *   isExpanded,
 *   handleAdd,
 *   handleUpdate,
 *   handleRemove,
 *   handleToggle,
 *   dragAndDrop,
 * } = useFormArray({
 *   items: experiences,
 *   onAdd: () => addExperience(),
 *   onUpdate: (id, updates) => updateExperience(id, updates),
 *   onRemove: (id) => removeExperience(id),
 *   onReorder: (start, end) => reorderExperiences(start, end),
 *   isItemComplete: (exp) => !!(exp.position && exp.company && exp.startDate),
 * });
 */
export function useFormArray<T extends { id: string }>(
  options: UseFormArrayOptions<T>
) {
  const {
    items,
    onAdd,
    onUpdate,
    onRemove,
    onReorder,
    isItemComplete,
    autoExpandIncomplete = true,
    confirmRemove = true,
  } = options;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { confirmationState, openConfirmation, closeConfirmation, handleConfirm } =
    useConfirmationDialog();

  // Auto-expand incomplete entries
  useEffect(() => {
    if (!autoExpandIncomplete || !isItemComplete) return;

    items.forEach((item) => {
      const isComplete = isItemComplete(item);
      if (!isComplete) {
        // Entry is incomplete - ensure it's expanded
        setExpandedIds((prev) => {
          if (prev.has(item.id)) return prev;
          const newSet = new Set(prev);
          newSet.add(item.id);
          return newSet;
        });
      }
    });
  }, [items, autoExpandIncomplete, isItemComplete]);

  // Auto-expand first item if none are expanded
  useEffect(() => {
    if (items.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([items[0].id]));
    }
  }, [items.length, expandedIds.size]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleAdd = useCallback(() => {
    // Collapse all complete entries when adding a new one
    if (isItemComplete) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        items.forEach((item) => {
          if (isItemComplete(item)) {
            newSet.delete(item.id);
          }
        });
        return newSet;
      });
    }
    onAdd();
  }, [onAdd, items, isItemComplete]);

  const handleRemove = useCallback(
    (id: string) => {
      if (confirmRemove) {
        openConfirmation(
          "Delete item?",
          "Are you sure you want to delete this item? This action cannot be undone.",
          () => {
            onRemove(id);
            setExpandedIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          },
          true
        );
        return;
      }
      onRemove(id);
      // Remove from expanded set if it was expanded
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
    [onRemove, confirmRemove, openConfirmation]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<T>) => {
      onUpdate(id, updates);
    },
    [onUpdate]
  );

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  // Drag and drop integration
  const dragAndDrop = onReorder
    ? useDragAndDrop(items, onReorder)
    : undefined;

  return {
    items,
    expandedIds,
    isExpanded,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleToggle,
    setExpandedIds,
    dragAndDrop,
    confirmationState,
    closeConfirmation,
    handleConfirm,
  };
}

