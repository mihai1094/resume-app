import * as React from "react";
import { Reorder, AnimatePresence, useDragControls, DragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const DragControlsContext = React.createContext<DragControls | null>(null);

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
    renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
    itemClassName?: string;
    id: string;
}

function SortableItem<T>({
    item,
    index,
    renderItem,
    itemClassName,
    id,
}: SortableItemProps<T>) {
    const dragControls = useDragControls();
    const [isDragging, setIsDragging] = React.useState(false);

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
            <DragControlsContext.Provider value={dragControls}>
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
    const controls = React.useContext(DragControlsContext);

    return (
        <div
            className={cn(
                "cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-md transition-colors touch-none",
                className
            )}
            onPointerDown={(e) => controls?.start(e)}
            {...props}
        >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
    );
}
