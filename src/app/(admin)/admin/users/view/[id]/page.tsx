"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Heart,
  Mail,
  Pencil,
  Phone,
  RefreshCcw,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import type {
  AdminUserDetail,
  AdminUserDetailResponse,
} from "@/app/api/admin/users/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteUserDialog } from "../../components/delete-user-dialog";

const roleLabel: Record<string, string> = {
  USER: "User",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

const roleClass: Record<string, string> = {
  USER: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  MANAGER:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  ADMIN:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  DELETED: "Deleted",
};

const statusClass: Record<string, string> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  BLOCKED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  DELETED:
    "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

export default function ViewUserPage() {
  const { id } = useParams<{ id: string }>();

  const [detail, setDetail] = React.useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`);
      const data = (await res.json()) as AdminUserDetailResponse;

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.message ?? "Failed to load user");
      }

      setDetail(data.data);
    } catch {
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || "User not found"}
        </div>
        <Button variant="outline" render={<Link href="/admin/users" />}>
          <ArrowLeft className="mr-2 size-4" /> Back to users
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            render={<Link href="/admin/users" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to users
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <Avatar className="size-14">
              {detail.image ? (
                <AvatarImage src={detail.image} alt="" />
              ) : (
                <AvatarFallback className="text-base">
                  {getInitials(detail.name || detail.email)}
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {detail.name || "Unnamed user"}
                </h1>
                {detail.isVerified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {detail.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/users/edit/${detail.id}`} />}
          >
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStat
          icon={<Building2 className="size-4" />}
          label="Listings"
          value={detail._count.listings}
        />
        <DashboardStat
          icon={<Heart className="size-4" />}
          label="Favorites"
          value={detail._count.favorites}
        />
        <DashboardStat
          icon={<Star className="size-4" />}
          label="Subscriptions"
          value={detail._count.subscriptions}
        />
      </div>

      {/* Account & contact */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Role">
              <Badge variant="outline" className={roleClass[detail.role]}>
                {roleLabel[detail.role] ?? detail.role}
              </Badge>
            </InfoRow>
            <InfoRow label="Status">
              <Badge variant="outline" className={statusClass[detail.status]}>
                {statusLabel[detail.status] ?? detail.status}
              </Badge>
            </InfoRow>
            <InfoRow label="Email verified">
              <span>{detail.isVerified ? "Yes" : "No"}</span>
            </InfoRow>
            <InfoRow label="Joined">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                {dateFormatter.format(new Date(detail.createdAt))}
              </span>
            </InfoRow>
            <InfoRow label="Last updated">
              <span>{dateFormatter.format(new Date(detail.updatedAt))}</span>
            </InfoRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Email">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                {detail.email}
              </span>
            </InfoRow>
            <InfoRow label="Phone">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" />
                {detail.phone ?? "—"}
              </span>
            </InfoRow>
            <InfoRow label="User ID">
              <span className="break-all font-mono text-xs text-muted-foreground">
                {detail.id}
              </span>
            </InfoRow>
          </CardContent>
        </Card>
      </div>

      {/* Recent listings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Recent listings</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {detail.listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This user does not own any listings yet.
            </p>
          ) : (
            <ul className="divide-y">
              {detail.listings.map((listing) => (
                <li
                  key={listing.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <Link
                    href={`/listing/${listing.slug}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <Badge variant="secondary" className="shrink-0">
                    {listing.verificationStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {detail.subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This user has no subscriptions yet.
            </p>
          ) : (
            <ul className="divide-y">
              {detail.subscriptions.map((subscription) => (
                <li
                  key={subscription.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {subscription.plan?.name ?? "Subscription"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Started{" "}
                      {dateFormatter.format(new Date(subscription.startsAt))}
                      {subscription.expiresAt
                        ? ` · Ends ${dateFormatter.format(new Date(subscription.expiresAt))}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {subscription.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DeleteUserDialog
        open={deleteOpen}
        userId={detail.id}
        userName={detail.name || detail.email}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          showToast("User deleted");
          window.setTimeout(() => {
            window.location.href = "/admin/users";
          }, 900);
        }}
      />

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm shadow-lg">
          <RefreshCcw className="size-4 text-emerald-600" />
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
