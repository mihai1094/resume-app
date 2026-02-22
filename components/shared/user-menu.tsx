"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { User } from "@/hooks/use-user";
import { getUserInitials } from "@/app/dashboard/hooks/use-resume-utils";

interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
  onImport?: () => void;
  trigger?: React.ReactNode;
}

export function UserMenu({ user, onLogout, trigger }: UserMenuProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname?.startsWith("/settings") ?? false;

  const avatarButton = trigger || (
    <Button
      variant="ghost"
      className="relative h-9 w-9 rounded-full p-0"
      title={user?.name || "Account"}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage
          src={user?.photoURL || undefined}
          alt={user?.name || "User"}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getUserInitials(user)}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  const handleNavigate = (path: string) => {
    setSheetOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* ── Mobile: Sheet side-menu ── */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>{avatarButton}</SheetTrigger>

          <SheetContent side="right" className="w-[85%] sm:w-[380px] pr-0">
            <SheetHeader className="text-left px-1">
              <SheetTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                ResumeZeus
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 flex flex-col h-full overflow-y-auto pb-8 pr-6 pl-1 scrollbar-none">
              {/* User info */}
              <div className="pb-4 mb-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.name || "User"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Navigation */}
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-3 font-semibold">
                    Menu
                  </p>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 h-10 px-2"
                      onClick={() => handleNavigate("/dashboard")}
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      Dashboard
                    </Button>
                    <Button
                      variant={isSettingsPage ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-3 h-10 px-2"
                      onClick={() => handleNavigate("/settings")}
                      disabled={isSettingsPage}
                      aria-current={isSettingsPage ? "page" : undefined}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Account
                    </Button>
                  </div>
                </div>

                {/* Log out */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => {
                      setSheetOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Desktop: Dropdown ── */}
      <div className="hidden lg:block">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            {isSettingsPage ? (
              <DropdownMenuItem
                disabled
                aria-current="page"
                className="opacity-100 text-foreground/70"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
