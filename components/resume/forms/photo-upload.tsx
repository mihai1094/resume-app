"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { compressImage, validateImageFile } from "@/lib/utils/image";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PhotoUploadProps {
  photo?: string;
  onChange: (photo: string | undefined) => void;
  firstName?: string;
  lastName?: string;
}

export function PhotoUpload({
  photo,
  onChange,
  firstName,
  lastName,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        onChange(compressed);
        toast.success("Photo uploaded");
      } catch {
        toast.error("Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input value so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(undefined);
    toast.success("Photo removed");
  }, [onChange]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const altText = `${firstName || "User"} ${lastName || ""} profile photo`.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Profile Photo</label>
        <span className="text-xs text-muted-foreground">(optional)</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              <p className="text-xs">
                Photos are common in Germany/France but may affect ATS parsing
                in US/UK. Some templates hide photos for ATS compatibility.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {photo ? (
        // Photo preview
        <div className="relative inline-block group">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background">
            <Image
              src={photo}
              alt={altText}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={openFileDialog}
              disabled={isProcessing}
              aria-label="Change photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleRemove}
              disabled={isProcessing}
              aria-label="Remove profile photo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Upload zone
        <div
          className={cn(
            "relative w-24 h-24 rounded-full cursor-pointer group transition-all duration-200",
            isDragging && "scale-105",
            isProcessing && "opacity-60 cursor-wait"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={isProcessing ? undefined : openFileDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isProcessing) openFileDialog();
            }
          }}
          aria-label="Upload profile photo"
        >
          {/* Gradient background with initials */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-200",
            isDragging
              ? "bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "bg-gradient-to-br from-muted to-muted/60 ring-2 ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/50 group-hover:from-primary/10 group-hover:to-primary/5"
          )}>
            {/* Initials or placeholder */}
            {(firstName || lastName) && !isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold text-muted-foreground/50 select-none">
                  {`${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()}
                </span>
              </div>
            ) : null}
          </div>

          {/* Processing spinner */}
          {isProcessing && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Drag label */}
          {isDragging && !isProcessing && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-medium text-primary/80">Drop</span>
            </div>
          )}

          {/* Dashed border ring (resting state) */}
          <svg
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-200 pointer-events-none",
              isDragging || isProcessing ? "opacity-0" : "opacity-100 group-hover:opacity-0"
            )}
            viewBox="0 0 96 96"
          >
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              className="text-muted-foreground/30"
            />
          </svg>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        JPG, PNG, or WebP. Max 2MB.
      </p>
    </div>
  );
}
