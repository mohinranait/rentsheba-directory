"use client";

import {
  Bell,
  ChevronsUpDown,
  Command,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MeUser } from "@/components/common/UserMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

const AUTH_STATUS_COOKIE = "auth_status";

const isAuthenticated = () =>
  typeof document !== "undefined" &&
  document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${AUTH_STATUS_COOKIE}=`));

export const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

export const formatRole = (role: string) =>
  role.charAt(0) + role.slice(1).toLowerCase();

export function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated()) {
      router.replace("/login?redirect=/admin/dashboard");
      return;
    }

    fetch("/api/me", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (response.status === 401) return null;
        return response.json().catch(() => null);
      })
      .then((json) => {
        if (cancelled) return;

        if (!json?.success || !json.user) {
          router.replace("/login?redirect=/admin/dashboard");
          return;
        }

        setUser(json.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoggingOut(false);
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }

  const displayName = user?.name || user?.email || "Admin";
  const initials = user ? getInitials(user.name || user.email) : "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-1 h-16" />

      <div className="relative hidden max-w-md flex-1 md:flex">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search listings, users, categories..."
          className="h-9 border-muted bg-muted/40 pl-9 pr-12 shadow-none focus-visible:bg-background"
        />

        <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <Command className="size-3" />
          <span>K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4.5" />

          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />

          <span className="sr-only">Notifications</span>
        </Button>

        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <Sun className="size-4.5 dark:hidden" />
          <Moon className="hidden size-4.5 dark:block" />
          <span className="sr-only">Toggle theme</span>
        </Button>


        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button variant="ghost" className="ml-1 gap-2 px-2">
              <Avatar className="size-8">
                <AvatarImage src={user?.image ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-xs font-semibold">{displayName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {user ? formatRole(user.role) : "Loading..."}
                </span>
              </div>

              <ChevronsUpDown className="hidden size-3.5 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {user?.email ?? displayName}
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href={`/admin/users/view/${user?.id}`} className="flex gap-1 items-center w-full">
                  <UserIcon />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
              <Link href="/admin/settings" className="flex gap-1 items-center w-full">
                <Settings />
                Settings
              </Link>
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                <LogOut />
                {loggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
