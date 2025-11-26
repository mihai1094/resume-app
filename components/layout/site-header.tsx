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
  ChevronDown,
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

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser();
  const { resumes } = useSavedResumes(user?.id ?? null);
  const { coverLetters } = useSavedCoverLetters(user?.id ?? null);

  const resumeCount = resumes.length;
  const coverLetterCount = coverLetters.length;
  const formatCount = (count: number) => (count > 99 ? "99+" : `${count}`);

  const requireAuthNavigation = (path: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleCreateResume = () => requireAuthNavigation("/create");
  const handleCreateCoverLetter = () => requireAuthNavigation("/cover-letter");
  const handleOpenMyResumes = () => requireAuthNavigation("/my-resumes");
  const handleOpenMyCoverLetters = () =>
    requireAuthNavigation("/my-cover-letters");
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Open create menu"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create</DropdownMenuLabel>
                <DropdownMenuItem onSelect={handleCreateResume}>
                  <FolderOpen className="w-4 h-4" />
                  <span>New Resume</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleCreateCoverLetter}>
                  <FileText className="w-4 h-4" />
                  <span>New Cover Letter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                          ? `${resumeCount} saved resume${
                              resumeCount === 1 ? "" : "s"
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
                      <FileText className="mr-2 h-4 w-4" />
                      <span>New Cover Letter</span>
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
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.photoURL || undefined}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={handleCreateResume} className="gap-2">
                <Plus className="w-4 h-4" />
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 p-0"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden border-t bg-background transition-all duration-200",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          {user ? (
            <>
              {/* User Info */}
              <div className="pb-4 border-b flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.name || "User"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {resumeCount > 0
                      ? `${resumeCount} resume${
                          resumeCount === 1 ? "" : "s"
                        } saved`
                      : "No resumes saved yet"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    Workspace
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenMyResumes();
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        My Resumes
                      </span>
                      <Badge variant="secondary">
                        {formatCount(resumeCount)}
                      </Badge>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenMyCoverLetters();
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        My Cover Letters
                      </span>
                      <Badge variant="secondary">
                        {formatCount(coverLetterCount)}
                      </Badge>
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    Create
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full justify-start gap-2"
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
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleCreateCoverLetter();
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      New Cover Letter
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      We&apos;ll prompt you to sign in if needed.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    Explore
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push("/blog");
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Blog
                  </Button>
                </div>

                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">
                    Account
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenSettings();
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in to save resumes and switch between cover letters.
              </p>
              <Button
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCreateResume();
                }}
              >
                <Plus className="w-4 h-4" />
                Start Building
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="/blog">Blog</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
