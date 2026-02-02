"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, X, Upload, Info } from "lucide-react";
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
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted">
            <Image
              src={photo}
              alt={altText}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
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
            "w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
            isProcessing && "opacity-50 cursor-wait"
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
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Upload</span>
            </>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        JPG, PNG, or WebP. Max 2MB.
      </p>
    </div>
  );
}
