import * as React from "react";
import { Reorder, AnimatePresence, useDragControls, DragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragContext {
  controls: DragControls | null;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const DragControlsContext = React.createContext<DragContext>({
  controls: null,
  index: 0,
  totalItems: 0,
  onMoveUp: () => {},
  onMoveDown: () => {},
});

interface SortableListProps<T> {
    items: T[];
    onReorder: (newOrder: T[]) => void;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
    itemClassName?: string;
}

export function SortableList<T>({
    items,
    onReorder,
    renderItem,
    keyExtractor,
    className,
    itemClassName,
}: SortableListProps<T>) {
    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className={cn("space-y-4 relative", className)}
        >
            <AnimatePresence initial={false}>
                {items.map((item, index) => (
                    <SortableItem
                        key={keyExtractor(item)}
                        item={item}
                        index={index}
                        items={items}
                        onReorder={onReorder}
                        renderItem={renderItem}
                        itemClassName={itemClassName}
                        id={keyExtractor(item)}
                    />
                ))}
            </AnimatePresence>
        </Reorder.Group>
    );
}

interface SortableItemProps<T> {
    item: T;
    index: number;
    items: T[];
    onReorder: (newOrder: T[]) => void;
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    itemClassName?: string;
    id: string;
}

function SortableItem<T>({
    item,
    index,
    items,
    onReorder,
    renderItem,
    itemClassName,
    id,
}: SortableItemProps<T>) {
    const dragControls = useDragControls();
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMoveUp = React.useCallback(() => {
        if (index === 0) return;
        const next = [...items];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        onReorder(next);
    }, [index, items, onReorder]);

    const handleMoveDown = React.useCallback(() => {
        if (index === items.length - 1) return;
        const next = [...items];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        onReorder(next);
    }, [index, items, onReorder]);

    return (
        <Reorder.Item
            value={item}
            id={id}
            dragListener={false}
            dragControls={dragControls}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, scale: isDragging ? 1.02 : 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
            className={cn("relative", itemClassName)}
            style={{ position: "relative" }}
        >
            <DragControlsContext.Provider value={{
                controls: dragControls,
                index,
                totalItems: items.length,
                onMoveUp: handleMoveUp,
                onMoveDown: handleMoveDown,
            }}>
                <div
                    className={cn(
                        "transition-shadow duration-200",
                        isDragging && "shadow-xl ring-2 ring-primary/20 rounded-xl z-50"
                    )}
                >
                    {renderItem(item, index, isDragging)}
                </div>
            </DragControlsContext.Provider>
        </Reorder.Item>
    );
}

interface DragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function DragHandle({ className, ...props }: DragHandleProps) {
    const { controls, index, totalItems, onMoveUp, onMoveDown } = React.useContext(DragControlsContext);

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Drag to reorder. Use Up and Down arrow keys to move. Position ${index + 1} of ${totalItems}.`}
            className={cn(
                "cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-md transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className
            )}
            onPointerDown={(e) => controls?.start(e)}
            onKeyDown={(e) => {
                if (e.key === "ArrowUp") { e.preventDefault(); onMoveUp(); }
                if (e.key === "ArrowDown") { e.preventDefault(); onMoveDown(); }
            }}
            {...props}
        >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
    );
}
