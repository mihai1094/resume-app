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
  /** If false, a small notice is shown under the Photo label. */
  templateSupportsPhoto?: boolean;
}

export function PhotoUpload({
  photo,
  onChange,
  firstName,
  lastName,
  templateSupportsPhoto = true,
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
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl border transition-colors duration-200",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-muted/30"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* Photo circle */}
      <button
        type="button"
        onClick={isProcessing ? undefined : openFileDialog}
        className={cn(
          "relative w-14 h-14 rounded-full shrink-0 overflow-hidden transition-all duration-200 group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isProcessing && "opacity-60 cursor-wait",
          !photo && !isProcessing && "cursor-pointer"
        )}
        aria-label={photo ? "Change profile photo" : "Upload profile photo"}
      >
        {photo ? (
          <>
            <Image
              src={photo}
              alt={altText}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </>
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center transition-colors",
            "bg-gradient-to-br from-muted to-muted/60 group-hover:from-primary/15 group-hover:to-primary/5",
          )}>
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : initials ? (
              <>
                <span className="text-base font-semibold text-muted-foreground/40 group-hover:opacity-0 transition-opacity select-none">
                  {initials}
                </span>
                <Camera className="w-4 h-4 text-primary/60 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            ) : (
              <Camera className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
            )}
          </div>
        )}
      </button>

      {/* Info + actions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground/80">Photo</span>
          <span className="text-xs text-muted-foreground/60">(optional)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/40 cursor-help" />
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

        {!templateSupportsPhoto && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 leading-tight">
            Current template doesn&apos;t display a photo.
          </p>
        )}

        {photo ? (
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={isProcessing}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Change
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={isProcessing ? undefined : openFileDialog}
            disabled={isProcessing}
            className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>{isDragging ? "Drop image here" : "Upload or drag image"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
