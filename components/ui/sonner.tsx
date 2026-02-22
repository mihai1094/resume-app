"use client";

import { useEffect } from "react";
import { toast, Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  // Dismiss any toast on click/tap (mobile-friendly)
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const toastEl = target.closest("[data-sonner-toast]");
      if (!toastEl) return;
      const id = toastEl.getAttribute("data-id");
      if (id) toast.dismiss(id);
      else toast.dismiss();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <Sonner
      theme="system"
      position="top-center"
      duration={3000}
      offset={16}
      closeButton
      className="toaster group"
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg cursor-pointer select-none",
          description: "group-[.toast]:text-foreground/70",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
