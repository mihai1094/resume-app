import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 illustration */}
        <div className="relative">
          <div className="text-[12rem] font-serif font-black text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-40 bg-card border-2 border-border rounded-lg shadow-xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                <div className="h-full flex flex-col p-3 gap-2">
                  <div className="h-2 bg-primary/20 rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-5/6" />
                  <div className="flex-1 flex items-center justify-center">
                    <FileQuestion className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div className="h-2 bg-muted rounded w-2/3" />
                </div>
              </div>
              {/* Floating question marks */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-primary font-bold">?</span>
              </div>
              <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center animate-bounce delay-150">
                <span className="text-primary text-sm font-bold">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like this resume got lost in the shuffle. Don&apos;t worry, your
            career path is still on track!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/editor/new">
              <ArrowLeft className="w-4 h-4" />
              Create Resume
            </Link>
          </Button>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/onboarding"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              Get Started
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/dashboard"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              My Resumes
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/preview"
              className="text-primary hover:underline underline-offset-4 transition-colors"
            >
              Preview Templates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}









