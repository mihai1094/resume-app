"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    items: initialItems,
    onAdd,
    onUpdate,
    onRemove,
    onReorder,
    isItemComplete,
    autoExpandIncomplete = true,
    confirmRemove = true,
  } = options;

  const [items, setItems] = useState(initialItems);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const {
    confirmationState,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
  } = useConfirmationDialog();

  // Track pending updates to prevent them from being overwritten
  const pendingUpdatesRef = useRef<Map<string, Partial<T>>>(new Map());
  const lastInitialItemsRef = useRef(initialItems);

  // Sync internal items when external items change, preserving pending updates
  useEffect(() => {
    // If initialItems changed and we have pending updates, merge them
    if (initialItems !== lastInitialItemsRef.current) {
      lastInitialItemsRef.current = initialItems;

      if (pendingUpdatesRef.current.size > 0) {
        // Apply pending updates to the new initialItems
        const mergedItems = initialItems.map((item) => {
          const pendingUpdate = pendingUpdatesRef.current.get(item.id);
          if (pendingUpdate) {
            return { ...item, ...pendingUpdate };
          }
          return item;
        });
        setItems(mergedItems);
        // Clear pending updates after merging
        pendingUpdatesRef.current.clear();
      } else {
        setItems(initialItems);
      }
    }
  }, [initialItems]);

  // Flush any pending updates when unmounting to ensure data isn't lost
  useEffect(() => {
    // Capture ref value to use in cleanup (satisfies react-hooks/exhaustive-deps)
    const pendingUpdates = pendingUpdatesRef.current;
    return () => {
      // On unmount, ensure any pending updates are applied
      pendingUpdates.forEach((updates, id) => {
        onUpdate(id, updates);
      });
      pendingUpdates.clear();
    };
  }, [onUpdate]);

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
  }, [items, expandedIds.size]);

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
            setItems((prev) => prev.filter((item) => item.id !== id));
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
      setItems((prev) => prev.filter((item) => item.id !== id));
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
      // Track the update as pending until parent state reflects it
      const existingPending = pendingUpdatesRef.current.get(id) || {};
      pendingUpdatesRef.current.set(id, { ...existingPending, ...updates });

      // Update local state optimistically
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      // Call parent update - this should eventually update initialItems
      onUpdate(id, updates);

      // Clear pending after a short delay to allow parent state to update
      // This prevents the pending update from being applied twice
      setTimeout(() => {
        pendingUpdatesRef.current.delete(id);
      }, 100);
    },
    [onUpdate]
  );

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  // Drag and drop integration (call hook unconditionally to satisfy rules-of-hooks)
  const dragAndDropHook = useDragAndDrop(items, onReorder ?? (() => {}));
  const dragAndDrop = onReorder ? dragAndDropHook : undefined;

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
