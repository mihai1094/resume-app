import type { KeyboardEvent as ReactKeyboardEvent } from "react";

function isSkippableField(element: HTMLElement): boolean {
  if ("disabled" in element && (element as HTMLInputElement).disabled) {
    return true;
  }

  if (element.getAttribute("aria-hidden") === "true") {
    return true;
  }

  const style = window.getComputedStyle(element);
  return style.display === "none" || style.visibility === "hidden";
}

function isTextEntryTarget(target: EventTarget | null): target is HTMLElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function advanceFormOnEnter(
  event: ReactKeyboardEvent<HTMLElement> | KeyboardEvent
) {
  if (
    event.key !== "Enter" ||
    event.defaultPrevented ||
    event.shiftKey ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }

  if (!isTextEntryTarget(event.target)) {
    return;
  }

  if (event.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (event.target instanceof HTMLInputElement) {
    const inputType = event.target.type.toLowerCase();
    if (
      ["submit", "button", "checkbox", "radio", "file"].includes(inputType)
    ) {
      return;
    }
  }

  const form = event.target.closest("form");
  if (!form) {
    return;
  }

  const fields = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]), select, textarea, [contenteditable="true"]'
    )
  ).filter((field) => !isSkippableField(field));

  const currentIndex = fields.findIndex(
    (field) => field === event.target || field.contains(event.target as Node)
  );

  if (currentIndex === -1) {
    return;
  }

  const nextField = fields.slice(currentIndex + 1).find((field) => !isSkippableField(field));

  if (!nextField) {
    return;
  }

  event.preventDefault();
  nextField.focus();

  if (
    nextField instanceof HTMLInputElement ||
    nextField instanceof HTMLTextAreaElement
  ) {
    nextField.select?.();
  }
}
