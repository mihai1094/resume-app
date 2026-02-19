"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings,
  Plus,
  FileText,
  ScrollText,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTierLimits } from "@/lib/config/credits";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { getUserInitials } from "@/app/dashboard/hooks/use-resume-utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Used to close sheet on item click
  const router = useRouter();
  const { user, logout } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(
    user?.id ?? null,
  );
  const { coverLetters } = useSavedCoverLetters(user?.id ?? null);

  const resumeCount = resumes.length;
  const coverLetterCount = coverLetters.length;
  const formatCount = (count: number) => (count > 99 ? "99+" : `${count}`);

  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const isResumeLimitReached = user
    ? resumes.length >= limits.maxResumes
    : false;

  const requireAuthNavigation = (path: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleCreateResume = () => {
    // Always go to templates page for template selection
    router.push("/templates");
  };
  const handleOpenDashboard = () => requireAuthNavigation("/dashboard");
  const handleOpenSettings = () => requireAuthNavigation("/settings");
  const handleCreateCoverLetter = () => requireAuthNavigation("/cover-letter");

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Flame className="w-6 h-6 text-primary" />
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              ResumeForge
            </span>
          </Link>

          {/* Right: Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">Blog</Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-2" onClick={handleCreateResume}>
                <Plus className="w-4 h-4" />
                <span>Build Resume</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleCreateCoverLetter}
              >
                <ScrollText className="w-4 h-4" />
                <span>Build Cover Letter</span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.name || "User"}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleOpenDashboard}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span className="flex-1">Dashboard</span>
                      {(resumeCount > 0 || coverLetterCount > 0) && (
                        <Badge variant="secondary" className="ml-auto">
                          {formatCount(resumeCount + coverLetterCount)}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleOpenSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile: Hamburger Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {!user && (
              <Button size="sm" onClick={handleCreateResume} className="gap-2">
                <Plus className="w-4 h-4" />
                Build
              </Button>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  aria-label="Toggle navigation"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-[380px] pr-0">
                <SheetHeader className="text-left px-1">
                  <SheetTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    ResumeForge
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col h-full overflow-y-auto pb-8 pr-6 pl-1 scrollbar-none">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="pb-4 mb-4 border-b flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.photoURL || undefined}
                            alt={user.name || "User"}
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground mb-3 font-semibold">
                            Quick Actions
                          </p>
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              className="w-full justify-start gap-3"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleCreateResume();
                              }}
                            >
                              <Flame className="w-4 h-4" />
                              New Resume
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase text-muted-foreground mb-3 font-semibold">
                            Menu
                          </p>
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between h-10 px-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleOpenDashboard();
                              }}
                            >
                              <span className="inline-flex items-center gap-3">
                                <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                                Dashboard
                              </span>
                              {(resumeCount > 0 || coverLetterCount > 0) && (
                                <Badge variant="secondary" className="text-xs">
                                  {formatCount(resumeCount + coverLetterCount)}
                                </Badge>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-3 h-10 px-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleOpenSettings();
                              }}
                            >
                              <Settings className="w-4 h-4 text-muted-foreground" />
                              Settings
                            </Button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">ResumeForge</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Build an ATS-friendly resume in minutes with AI help.
                          Sign in to save versions and unlock advanced tools.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full justify-center gap-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleCreateResume();
                          }}
                        >
                          <Plus className="w-4 h-4" />
                          Start Building Free
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full justify-center"
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/login">Log in</Link>
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-3"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/blog");
                          }}
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          Read the Blog
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
      <PlanLimitDialog
        open={showPlanLimitModal}
        onOpenChange={setShowPlanLimitModal}
        limit={limits.maxResumes}
        onManage={() => {
          setShowPlanLimitModal(false);
          router.push("/dashboard");
        }}
        onUpgrade={() => {
          setShowPlanLimitModal(false);
          router.push("/pricing#pro");
        }}
      />
    </>
  );
}
