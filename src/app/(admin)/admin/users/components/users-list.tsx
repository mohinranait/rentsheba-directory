"use client";

import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import type {
  AdminUserListItem,
  AdminUserListResponse,
} from "@/app/api/admin/users/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteUserDialog } from "./delete-user-dialog";

type RoleLabel = "USER" | "MANAGER" | "ADMIN";
type StatusLabel = "ACTIVE" | "BLOCKED" | "DELETED";

const roleConfig: Record<RoleLabel, { label: string; className: string }> = {
  USER: {
    label: "User",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
  MANAGER: {
    label: "Manager",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  },
  ADMIN: {
    label: "Admin",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400",
  },
};

const statusConfig: Record<StatusLabel, { label: string; className: string }> =
  {
    ACTIVE: {
      label: "Active",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
    },
    BLOCKED: {
      label: "Blocked",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
    },
    DELETED: {
      label: "Deleted",
      className:
        "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
    },
  };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

type UsersListProps = {
  title: string;
  description: string;
  /** When set, the role filter is fixed and hidden from the table. */
  fixedRole?: RoleLabel;
};

export function UsersList({ title, description, fixedRole }: UsersListProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [role, setRole] = React.useState<string>(fixedRole ?? "all");
  const [status, setStatus] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [items, setItems] = React.useState<AdminUserListItem[]>([]);
  const [meta, setMeta] = React.useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [stats, setStats] = React.useState({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminUserListItem | null>(null);

  // Debounce the search box so we only hit the API after the user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        role: String(role),
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status !== "all") params.set("status", status);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = (await response.json()) as AdminUserListResponse;

      if (!response.ok || !data.success || !data.data) {
        throw new Error("Failed to load users");
      }

      setItems(data.data.items);
      setMeta(data.data.meta);
      setStats(data.data.stats);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, role, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const resetPage = () => setPage(1);

  const handleRoleChange = (value: string | null) => {
    setRole(value ?? "all");
    resetPage();
  };

  const handleStatusChange = (value: string | null) => {
    setStatus(value ?? "all");
    resetPage();
  };

  const handlePageSizeChange = (value: string | null) => {
    const next = Number(value ?? "10");
    setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
    resetPage();
  };

  const hasFilters = Boolean(debouncedSearch) || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    resetPage();
  };

  const pageNumbers = getPageNumbers(meta.page, meta.totalPages);
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <Button render={<Link href="/admin/users/new" />}>
          <Plus className="mr-2 size-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total.toLocaleString()}
          description="Across all roles"
        />
        <StatCard
          title="Active"
          value={stats.active.toLocaleString()}
          description="Can sign in and post"
        />
        <StatCard
          title="Blocked"
          value={stats.blocked.toLocaleString()}
          description="Prevented from signing in"
        />
        <StatCard
          title="Admins"
          value={stats.admins.toLocaleString()}
          description="Users with admin access"
        />
      </div>

      {/* Main content */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {!fixedRole && (
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                  <SelectItem value="DELETED">Deleted</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear filters"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>
                  <div className="flex items-center gap-1">
                    User
                    <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                  </div>
                </TableHead>

                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <LoadingRows columns={7} />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="mb-2 size-5 text-muted-foreground" />
                      <p className="font-medium">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => void load()}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="mb-2 size-5 text-muted-foreground" />
                      <p className="font-medium">No users found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={() => setDeleteTarget(user)}
                    onChanged={() => void load()}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-4 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd || 0}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {meta.total.toLocaleString()}
            </span>{" "}
            users
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>

              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={meta.page <= 1 || isLoading}
                onClick={() => setPage(meta.page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pageNumbers.map((pageNumber) =>
                pageNumber.value === "..." ? (
                  <span
                    key={pageNumber.key}
                    className="px-1 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNumber.key}
                    variant={
                      pageNumber.value === meta.page ? "outline" : "ghost"
                    }
                    size="sm"
                    className="size-8 p-0"
                    onClick={() => setPage(pageNumber.value)}
                  >
                    {pageNumber.value}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={meta.page >= meta.totalPages || isLoading}
                onClick={() => setPage(meta.page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteUserDialog
        open={deleteTarget !== null}
        userId={deleteTarget?.id ?? ""}
        userName={deleteTarget?.name ?? ""}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={() => void load()}
      />
    </div>
  );
}

function UserRow({
  user,
  onDelete,
  onChanged,
}: {
  user: AdminUserListItem;
  onDelete: () => void;
  onChanged: () => void;
}) {
  const [acting, setActing] = React.useState(false);
  const [actionError, setActionError] = React.useState("");

  const roleInfo = roleConfig[user.role] ?? roleConfig.USER;
  const statusInfo = statusConfig[user.status] ?? statusConfig.ACTIVE;

  async function runQuickUpdate(data: {
    role?: string;
    status?: string;
    isVerified?: boolean;
  }) {
    if (acting) return;

    setActing(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await res.json()) as {
        success: boolean;
        message?: string;
      };

      if (!result.success) {
        setActionError(result.message ?? "Something went wrong");
        return;
      }

      onChanged();
    } catch {
      setActionError("Something went wrong");
    } finally {
      setActing(false);
    }
  }

  const isBlocked = user.status === "BLOCKED";
  const isDeleted = user.status === "DELETED";

  return (
    <TableRow className="group">
      {/* User */}
      <TableCell>
        <div className="flex min-w-60 items-center gap-3">
          <Avatar className="size-10">
            {user.image ? (
              <AvatarImage src={user.image} alt="" />
            ) : (
              <AvatarFallback>
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0">
            <p className="truncate font-medium">{user.name || "—"}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Role */}
      <TableCell>
        <Badge variant="outline" className={roleInfo.className}>
          <Shield className="mr-1.5 size-3" />
          {roleInfo.label}
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={statusInfo.className}>
          <span className="mr-1.5 size-1.5 rounded-full bg-current" />
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Verified */}
      <TableCell>
        {user.isVerified ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <BadgeCheck className="size-4" />
            Verified
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Unverified</span>
        )}
      </TableCell>

      {/* Listings */}
      <TableCell>
        <span className="text-sm">{user._count.listings.toLocaleString()}</span>
      </TableCell>

      {/* Joined */}
      <TableCell>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {dateFormatter.format(new Date(user.createdAt))}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              render={<Link href={`/admin/users/view/${user.id}`} />}
            >
              <Eye className="mr-2 size-4" />
              View profile
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              render={<Link href={`/admin/users/edit/${user.id}`} />}
            >
              <Pencil className="mr-2 size-4" />
              Edit user
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {!isDeleted && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={acting}
                  onClick={() =>
                    runQuickUpdate({
                      status: isBlocked ? "ACTIVE" : "BLOCKED",
                    })
                  }
                >
                  {isBlocked ? (
                    <>
                      <Unlock className="mr-2 size-4" />
                      Unblock user
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 size-4" />
                      Block user
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={acting}
                  onClick={() =>
                    runQuickUpdate({ isVerified: !user.isVerified })
                  }
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  {user.isVerified ? "Mark unverified" : "Mark verified"}
                </DropdownMenuItem>
              </>
            )}

            {actionError && (
              <p className="px-3 py-1.5 text-xs text-destructive">
                {actionError}
              </p>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              disabled={acting}
              onClick={onDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  const cellKeys = Array.from(
    { length: columns },
    (_, index) => `cell-${index}`,
  );

  return (
    <>
      {["row-0", "row-1", "row-2", "row-3", "row-4"].map((rowKey) => (
        <TableRow key={rowKey}>
          {cellKeys.map((cellKey) => (
            <TableCell key={cellKey}>
              <div className="h-4 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type PageNumberElement =
  | { key: string; value: number }
  | { key: string; value: "..." };

function getPageNumbers(
  current: number,
  totalPages: number,
): PageNumberElement[] {
  const pages: PageNumberElement[] = [];

  const pushPage = (pageNumber: number) => {
    pages.push({ key: `page-${pageNumber}`, value: pageNumber });
  };

  const pushGap = (key: string) => {
    pages.push({ key, value: "..." });
  };

  if (totalPages <= 7) {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      pushPage(pageNumber);
    }
    return pages;
  }

  pushPage(1);

  if (current > 4) pushGap("gap-start");

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pushPage(pageNumber);
  }

  if (current < totalPages - 3) pushGap("gap-end");

  pushPage(totalPages);

  return pages;
}
