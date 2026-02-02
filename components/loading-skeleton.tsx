"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard page skeleton with header, stats, and resume cards
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Dashboard Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-[400px] max-w-full rounded-lg" />
        </div>

        {/* Resume Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ResumeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Template gallery page skeleton
 */
export function TemplateGallerySkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="max-w-2xl">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Template Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Single template card skeleton
 */
export function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[8.5/11] w-full" />
      <div className="p-4">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
}

/**
 * Settings page skeleton
 */
export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Title */}
        <Skeleton className="h-8 w-32 mb-8" />

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>

          {/* Subscription Section */}
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/50">
            <Skeleton className="h-6 w-28 mb-4" />
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-9 w-32" />
          </Card>
        </div>
      </div>
    </div>
  );
}

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
