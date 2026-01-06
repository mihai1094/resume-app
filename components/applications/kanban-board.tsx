"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  JobApplication,
  ApplicationStatus,
  KANBAN_COLUMNS,
  KanbanColumn,
} from "@/lib/types/application";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ApplicationCard,
  SortableApplicationCard,
} from "./application-card";

interface KanbanBoardProps {
  applicationsByStatus: Record<ApplicationStatus, JobApplication[]>;
  onMoveApplication: (id: string, newStatus: ApplicationStatus) => Promise<boolean>;
  onCardClick: (application: JobApplication) => void;
  onAddApplication: () => void;
}

interface KanbanColumnProps {
  column: KanbanColumn;
  applications: JobApplication[];
  onCardClick: (application: JobApplication) => void;
  onAddApplication: () => void;
  isOver?: boolean;
}

function KanbanColumnComponent({
  column,
  applications,
  onCardClick,
  onAddApplication,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const applicationIds = useMemo(
    () => applications.map((app) => app.id),
    [applications]
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-muted/30 rounded-lg min-w-[280px] w-[280px] lg:min-w-0 lg:w-auto lg:flex-1",
        "border border-transparent transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.color)} />
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
            {applications.length}
          </span>
        </div>
        {column.id === "wishlist" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onAddApplication}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Add application</span>
          </Button>
        )}
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 p-2">
        <SortableContext
          items={applicationIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[200px]">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p className="text-xs">{column.description}</p>
                {column.id === "wishlist" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={onAddApplication}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add job
                  </Button>
                )}
              </div>
            ) : (
              applications.map((app) => (
                <SortableApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => onCardClick(app)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

export function KanbanBoard({
  applicationsByStatus,
  onMoveApplication,
  onCardClick,
  onAddApplication,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeApplication = useMemo(() => {
    if (!activeId) return null;
    for (const apps of Object.values(applicationsByStatus)) {
      const found = apps.find((app) => app.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, applicationsByStatus]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeApp = active.data.current?.application as JobApplication | undefined;
    if (!activeApp) return;

    // Determine the target status
    let targetStatus: ApplicationStatus | null = null;

    // If dropped on a column
    if (over.data.current?.type === "column") {
      targetStatus = over.data.current.column.id as ApplicationStatus;
    }
    // If dropped on another card, get that card's status
    else if (over.data.current?.type === "application") {
      targetStatus = over.data.current.application.status as ApplicationStatus;
    }
    // If dropped on a column ID directly
    else if (KANBAN_COLUMNS.some((col) => col.id === over.id)) {
      targetStatus = over.id as ApplicationStatus;
    }

    if (targetStatus && targetStatus !== activeApp.status) {
      await onMoveApplication(activeApp.id, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                applications={applicationsByStatus[column.id]}
                onCardClick={onCardClick}
                onAddApplication={onAddApplication}
                isOver={overId === column.id}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            applications={applicationsByStatus[column.id]}
            onCardClick={onCardClick}
            onAddApplication={onAddApplication}
            isOver={overId === column.id}
          />
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeApplication && (
          <ApplicationCard application={activeApplication} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}
