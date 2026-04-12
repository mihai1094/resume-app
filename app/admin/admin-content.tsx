"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { authFetch } from "@/lib/api/auth-fetch";
import type { AdminDashboardData } from "@/lib/types/admin";
import type { TestimonialStatus } from "@/lib/types/testimonial";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/shared/loading";
import { MessageSquare, ShieldCheck, Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type LoadState = "loading" | "ready" | "forbidden" | "error";

export function AdminContent() {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setState("loading");
    try {
      const response = await authFetch("/api/admin/overview");
      if (response.status === 403) {
        setState("forbidden");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load admin dashboard.");
      }

      const payload = (await response.json()) as AdminDashboardData;
      setData(payload);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleModerate = useCallback(
    async (testimonialId: string, status: TestimonialStatus) => {
      setUpdatingId(testimonialId);
      try {
        const response = await authFetch("/api/admin/testimonials", {
          method: "POST",
          body: JSON.stringify({ testimonialId, status }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Failed to update testimonial.");
        }

        toast.success(`Testimonial ${status}.`);
        await loadDashboard();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update testimonial."
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [loadDashboard]
  );

  const groupedTestimonials = useMemo(() => {
    const testimonials = data?.testimonials ?? [];
    return {
      pending: testimonials.filter((item) => item.status === "pending"),
      approved: testimonials.filter((item) => item.status === "approved"),
      rejected: testimonials.filter((item) => item.status === "rejected"),
    };
  }, [data]);

  if (state === "loading") {
    return <LoadingPage text="Loading admin dashboard..." />;
  }

  if (state === "forbidden") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto max-w-3xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Admin access required</CardTitle>
              <CardDescription>
                Your account is authenticated, but it is not allowed to open the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto max-w-3xl px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Admin dashboard unavailable</CardTitle>
              <CardDescription>
                We could not load the latest moderation data right now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={() => void loadDashboard()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Badge>
          <h1 className="h-1">Moderation dashboard</h1>
          <p className="text-muted-foreground max-w-2xl">
            Review real-user testimonials before they appear on the homepage and keep an eye on incoming feedback.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="New feedback"
            value={data.stats.newFeedback}
            icon={MessageSquare}
          />
          <StatCard
            title="Pending testimonials"
            value={data.stats.pendingTestimonials}
            icon={Star}
          />
          <StatCard
            title="Approved testimonials"
            value={data.stats.approvedTestimonials}
            icon={ShieldCheck}
          />
          <StatCard
            title="Total testimonials"
            value={data.stats.totalTestimonials}
            icon={Star}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Pending testimonials</CardTitle>
              <CardDescription>
                Only approved testimonials are published publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedTestimonials.pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No testimonials are waiting for review.
                </p>
              ) : (
                groupedTestimonials.pending.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="rounded-xl border p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testimonial.userEmail ?? "No email"} · {new Date(testimonial.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge>{testimonial.rating}/5</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      “{testimonial.content}”
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={updatingId === testimonial.id}
                        onClick={() => void handleModerate(testimonial.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updatingId === testimonial.id}
                        onClick={() => void handleModerate(testimonial.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent feedback</CardTitle>
              <CardDescription>
                Latest user-submitted product feedback from the dashboard widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No feedback submissions yet.
                </p>
              ) : (
                data.feedback.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-xl border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.userEmail ?? "Anonymous"}
                    </p>
                    <p className="text-sm leading-relaxed">{item.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Approved testimonials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedTestimonials.approved.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing approved yet.
                </p>
              ) : (
                groupedTestimonials.approved.slice(0, 6).map((testimonial) => (
                  <div key={testimonial.id} className="rounded-xl border p-4">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rejected testimonials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedTestimonials.rejected.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rejected items.
                </p>
              ) : (
                groupedTestimonials.rejected.slice(0, 6).map((testimonial) => (
                  <div key={testimonial.id} className="rounded-xl border p-4">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof MessageSquare;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
