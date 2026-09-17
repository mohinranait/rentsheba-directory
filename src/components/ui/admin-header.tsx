"use client";

import {
  Bell,
  ChevronsUpDown,
  Command,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75">
      <SidebarTrigger className="-ml-1" />

      <Separator
        orientation="vertical"
        className="mr-1 h-16"
      />

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
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="size-4.5" />

          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />

          <span className="sr-only">
            Notifications
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
        >
          <Sun className="size-4.5 dark:hidden" />
          <Moon className="hidden size-4.5 dark:block" />
          <span className="sr-only">
            Toggle theme
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="ml-1 gap-2 px-2"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  ME
                </AvatarFallback>
              </Avatar>

              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-xs font-semibold">
                  Md. Ebrahim
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Super Admin
                </span>
              </div>

              <ChevronsUpDown className="hidden size-3.5 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52"
          >
            <DropdownMenuLabel>
              My Account
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Settings />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}