"use client";

import { Card } from "@/components/ui/card";

export function ResumeEditorSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-20 bg-muted rounded" />
              <div className="h-6 w-6 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-full" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-muted rounded-full" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-3">
            <Card className="p-4">
              <div className="h-6 w-32 bg-muted rounded mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded" />
                ))}
              </div>
            </Card>
          </div>

          {/* Form Skeleton */}
          <div className="lg:col-span-9">
            <Card className="p-6">
              <div className="h-8 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-64 bg-muted rounded mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumeCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="p-6">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-4 w-24 bg-muted rounded mb-2" />
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="space-y-2">
          <div className="h-9 w-full bg-muted rounded" />
          <div className="h-9 w-full bg-muted rounded" />
        </div>
      </div>
    </Card>
  );
}

