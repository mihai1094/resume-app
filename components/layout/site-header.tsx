"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Menu,
  X,
  LogOut,
  FileText,
  FolderOpen,
  Plus,
  Settings,
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";

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
  const { resumes, isLoading: resumesLoading } = useSavedResumes(user?.id ?? null);
  const { coverLetters } = useSavedCoverLetters(user?.id ?? null);

  const resumeCount = resumes.length;
  const coverLetterCount = coverLetters.length;
  const formatCount = (count: number) => (count > 99 ? "99+" : `${count}`);

  const plan = user?.plan ?? "free";
  const resumeLimit = plan === "free" ? 3 : plan === "ai" ? 50 : 999;
  const isResumeLimitReached = user ? resumes.length >= resumeLimit : false;

  const requireAuthNavigation = (path: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleCreateResume = () => {
    const targetPath = resumeCount > 0 ? "/editor/new" : "/onboarding";

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (!resumesLoading && isResumeLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }

    router.push(targetPath);
  };
  const handleCreateCoverLetter = () => requireAuthNavigation("/cover-letter");
  const handleOpenMyResumes = () => requireAuthNavigation("/dashboard");
  const handleOpenMyCoverLetters = () =>
    requireAuthNavigation("/dashboard?tab=cover-letters");
  const handleOpenSettings = () => requireAuthNavigation("/settings");

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
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
                <span>Create Resume</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleCreateCoverLetter}
              >
                <FileText className="w-4 h-4" />
                <span>Create Cover Letter</span>
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
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resumeCount > 0
                            ? `${resumeCount} saved resume${resumeCount === 1 ? "" : "s"
                            }`
                            : "No resumes saved yet"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wide">
                        Workspace
                      </DropdownMenuLabel>
                      <DropdownMenuItem onSelect={handleOpenMyResumes}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span className="flex-1">My Resumes</span>
                        <Badge variant="secondary">
                          {formatCount(resumeCount)}
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleOpenMyCoverLetters}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="flex-1">My Cover Letters</span>
                        <Badge variant="secondary">
                          {formatCount(coverLetterCount)}
                        </Badge>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wide">
                        Create
                      </DropdownMenuLabel>
                      <DropdownMenuItem onSelect={handleCreateResume}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Resume</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleCreateCoverLetter}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create new Cover Letter</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wide">
                        Account
                      </DropdownMenuLabel>
                      <DropdownMenuItem onSelect={handleOpenSettings}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={handleLogout}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
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
                Create
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
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground mb-3 font-semibold">
                            Workspace
                          </p>
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between h-10 px-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleOpenMyResumes();
                              }}
                            >
                              <span className="inline-flex items-center gap-3">
                                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                My Resumes
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {formatCount(resumeCount)}
                              </Badge>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between h-10 px-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleOpenMyCoverLetters();
                              }}
                            >
                              <span className="inline-flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                My Cover Letters
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {formatCount(coverLetterCount)}
                              </Badge>
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase text-muted-foreground mb-3 font-semibold">
                            Create
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
                              <Plus className="w-4 h-4" />
                              New Resume
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full justify-start gap-3"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleCreateCoverLetter();
                              }}
                            >
                              <Plus className="w-4 h-4" />
                              Create new Cover Letter
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
                              className="w-full justify-start gap-3 h-10 px-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/blog");
                              }}
                            >
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              Blog
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
                              Account Settings
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
                          Build professional resumes in minutes with AI. Sign in to save your progress and access advanced features.
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
                          Start Building Now
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
                          Read our Blog
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
        limit={resumeLimit}
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
