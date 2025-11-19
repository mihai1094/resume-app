import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormArray } from '../use-form-array';

interface TestItem {
  id: string;
  name: string;
  completed: boolean;
}

describe('useFormArray', () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnReorder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  const defaultItems: TestItem[] = [
    { id: '1', name: 'Item 1', completed: true },
    { id: '2', name: 'Item 2', completed: false },
    { id: '3', name: 'Item 3', completed: true },
  ];

  it('should initialize with first item expanded', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    expect(result.current.isExpanded('1')).toBe(true);
  });

  it('should toggle expansion state', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.handleToggle('1');
    });
    expect(result.current.isExpanded('1')).toBe(false);

    act(() => {
      result.current.handleToggle('1');
    });
    expect(result.current.isExpanded('1')).toBe(true);
  });

  it('should call onAdd when adding item', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.handleAdd();
    });

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('should collapse complete items when adding new item', () => {
    const isItemComplete = (item: TestItem) => item.completed;

    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
        isItemComplete,
      })
    );

    // Expand a completed item
    act(() => {
      result.current.handleToggle('1');
    });
    expect(result.current.isExpanded('1')).toBe(false); // Was already expanded, now collapsed

    act(() => {
      result.current.handleToggle('1');
    });
    expect(result.current.isExpanded('1')).toBe(true);

    // Add new item
    act(() => {
      result.current.handleAdd();
    });

    // Completed items should be collapsed
    expect(result.current.isExpanded('1')).toBe(false);
    expect(result.current.isExpanded('3')).toBe(false);
  });

  it('should call onUpdate when updating item', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.handleUpdate('1', { name: 'Updated Name' });
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('1', { name: 'Updated Name' });
  });

  it('should call onRemove when removing item', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.handleRemove('1');
    });

    expect(mockOnRemove).toHaveBeenCalledWith('1');
    expect(result.current.isExpanded('1')).toBe(false);
  });

  it('should not remove item if confirmation is cancelled', () => {
    window.confirm = vi.fn(() => false);

    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.handleRemove('1');
    });

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('should auto-expand incomplete items', () => {
    const isItemComplete = (item: TestItem) => item.completed;
    const incompleteItems: TestItem[] = [
      { id: '1', name: 'Item 1', completed: false },
    ];

    const { result } = renderHook(() =>
      useFormArray({
        items: incompleteItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
        isItemComplete,
        autoExpandIncomplete: true,
      })
    );

    // Incomplete item should be auto-expanded
    expect(result.current.isExpanded('1')).toBe(true);
  });

  it('should provide drag and drop handlers when onReorder is provided', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    expect(result.current.dragAndDrop).toBeDefined();
    expect(result.current.dragAndDrop?.handleDragStart).toBeDefined();
    expect(result.current.dragAndDrop?.handleDrop).toBeDefined();
  });

  it('should not provide drag and drop handlers when onReorder is not provided', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
      })
    );

    expect(result.current.dragAndDrop).toBeUndefined();
  });

  it('should allow manual expansion control via setExpandedIds', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
      })
    );

    act(() => {
      result.current.setExpandedIds(new Set(['2', '3']));
    });

    expect(result.current.isExpanded('1')).toBe(false);
    expect(result.current.isExpanded('2')).toBe(true);
    expect(result.current.isExpanded('3')).toBe(true);
  });

  it('should work without confirmRemove option', () => {
    const { result } = renderHook(() =>
      useFormArray({
        items: defaultItems,
        onAdd: mockOnAdd,
        onUpdate: mockOnUpdate,
        onRemove: mockOnRemove,
        onReorder: mockOnReorder,
        confirmRemove: false,
      })
    );

    act(() => {
      result.current.handleRemove('1');
    });

    expect(mockOnRemove).toHaveBeenCalledWith('1');
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

