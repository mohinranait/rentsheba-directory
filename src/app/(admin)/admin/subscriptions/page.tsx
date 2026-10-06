"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  AdminSubscriptionItem,
  AdminSubscriptionListResponse,
  AdminSubscriptionStats,
} from "@/types/subscription-admin.type";
import { ManualActivateDialog } from "./components/manual-activate-dialog";
import { PaymentDetailDialog } from "./components/payment-detail-dialog";
import { VerifyBkashDialog } from "./components/verify-bkash-dialog";

const formatDate = (isoString?: string | null) => {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoString));
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const statusBadges: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  },
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  },
  EXPIRED: {
    label: "Expired",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
};

const paymentStatusBadges: Record<string, { label: string; className: string }> = {
  PAID: {
    label: "Paid",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  },
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  },
  FAILED: {
    label: "Failed",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
  REFUNDED: {
    label: "Refunded",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  },
};

export default function AdminSubscriptionsPage() {
  const [items, setItems] = React.useState<AdminSubscriptionItem[]>([]);
  const [stats, setStats] = React.useState<AdminSubscriptionStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  // Dialog states
  const [selectedForVerify, setSelectedForVerify] = React.useState<AdminSubscriptionItem | null>(null);
  const [selectedForActivate, setSelectedForActivate] = React.useState<AdminSubscriptionItem | null>(null);
  const [selectedForDetail, setSelectedForDetail] = React.useState<AdminSubscriptionItem | null>(null);

  const fetchSubscriptions = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (paymentStatusFilter && paymentStatusFilter !== "ALL")
        params.set("paymentStatus", paymentStatusFilter);
      params.set("page", String(page));
      params.set("pageSize", "10");

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const data = (await res.json()) as AdminSubscriptionListResponse;

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load subscriptions");
      }

      setItems(data.data.items);
      setStats(data.data.stats);
      setTotalPages(data.data.meta.totalPages);
      setTotalCount(data.data.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentStatusFilter, page]);

  React.useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Subscriptions & Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage user subscriptions, track renewal due dates, and verify bKash payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchSubscriptions()}
            disabled={loading}
          >
            <RefreshCcw className={cn("mr-1.5 size-4", loading && "animate-spin")} />
            Refresh
          </Button>

          <Button
            variant="default"
            size="sm"
            render={<Link href="/admin/subscription-plan" />}
          >
            Manage Plans
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Subscriptions</p>
              <h3 className="text-2xl font-bold tracking-tight">
                {stats ? stats.total.toLocaleString() : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Subscribers</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600">
                {stats ? stats.active.toLocaleString() : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600">
                {stats ? stats.pending.toLocaleString() : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Expiring Soon (≤30d)</p>
              <h3 className="text-2xl font-bold tracking-tight text-orange-600">
                {stats ? stats.expiringSoon.toLocaleString() : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold tracking-tight text-teal-600">
                {stats ? `৳${stats.totalRevenue.toLocaleString()}` : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by subscriber name, email, TrxID, or Invoice..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  if (val) setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-37.5">
                  <SelectValue placeholder="Subscription Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subscriptions</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentStatusFilter}
                onValueChange={(val) => {
                  if (val) setPaymentStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payments</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {(search || statusFilter !== "ALL" || paymentStatusFilter !== "ALL") && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="mr-1.5 size-4" /> Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h3 className="mt-2 text-base font-semibold">Error Loading Subscriptions</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void fetchSubscriptions()}
            >
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="mt-3 text-base font-semibold">No subscriptions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || statusFilter !== "ALL" || paymentStatusFilter !== "ALL"
                ? "Try clearing or adjusting your search filters."
                : "No subscriptions have been created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-55">Subscriber</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Sub Status</TableHead>
                  <TableHead>Payment & bKash</TableHead>
                  <TableHead>Started / Due Date</TableHead>
                  <TableHead>Renewal Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((sub) => {
                  const payment = sub.payment;
                  const isPendingPayment =
                    sub.status === "PENDING" ||
                    (payment && payment.status !== "PAID");

                  return (
                    <TableRow key={sub.id} className="hover:bg-muted/40">
                      {/* Subscriber */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            {sub.user.image ? (
                              <AvatarImage src={sub.user.image} alt={sub.user.name} />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {getInitials(sub.user.name || sub.user.email)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/view/${sub.userId}`}
                              className="font-medium text-foreground hover:text-primary hover:underline block truncate text-sm"
                            >
                              {sub.user.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {sub.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Plan */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {sub.plan.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ৳{sub.plan.price} · {sub.plan.maxListings} max listings
                          </p>
                        </div>
                      </TableCell>

                      {/* Sub Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadges[sub.status]?.className}
                        >
                          {statusBadges[sub.status]?.label || sub.status}
                        </Badge>
                      </TableCell>

                      {/* Payment & bKash info */}
                      <TableCell>
                        {payment ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] px-1.5 py-0", paymentStatusBadges[payment.status]?.className)}
                              >
                                {payment.status}
                              </Badge>
                              <span className="font-semibold text-xs">
                                ৳{payment.amount}
                              </span>
                            </div>

                            {payment.trxID ? (
                              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                                  TrxID
                                </span>
                                {payment.trxID}
                              </div>
                            ) : payment.paymentID ? (
                              <div className="text-[11px] font-mono text-muted-foreground truncate max-w-37.5">
                                ID: {payment.paymentID.slice(0, 10)}...
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No bKash ID</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No payment</span>
                        )}
                      </TableCell>

                      {/* Timeline: Started & Renewal Due */}
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div>
                            <span className="text-muted-foreground">Start: </span>
                            <span>{formatDate(sub.startsAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due: </span>
                            <span className="font-medium text-foreground">
                              {formatDate(sub.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Renewal Status Badge */}
                      <TableCell>
                        {sub.expiresAt ? (
                          sub.daysRemaining !== null ? (
                            sub.daysRemaining < 0 ? (
                              <Badge
                                variant="secondary"
                                className="border-red-200 bg-red-50 text-red-700 text-[11px]"
                              >
                                Expired {Math.abs(sub.daysRemaining)}d ago
                              </Badge>
                            ) : sub.daysRemaining <= 30 ? (
                              <Badge
                                variant="secondary"
                                className="border-orange-200 bg-orange-50 text-orange-700 text-[11px]"
                              >
                                Renewal due in {sub.daysRemaining}d
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px]"
                              >
                                {sub.daysRemaining}d remaining
                              </Badge>
                            )
                          ) : null
                        ) : (
                          <span className="text-xs text-muted-foreground">Lifetime</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Verify button for pending */}
                          {isPendingPayment && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs"
                              onClick={() => setSelectedForVerify(sub)}
                              title="Verify bKash transaction and activate"
                            >
                              <ShieldCheck className="size-3.5" />
                              Verify bKash
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => setSelectedForDetail(sub)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 size-4" /> View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => setSelectedForVerify(sub)}
                                className="cursor-pointer"
                              >
                                <ShieldCheck className="mr-2 size-4 text-emerald-600" /> Verify with bKash
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => setSelectedForActivate(sub)}
                                className="cursor-pointer"
                              >
                                <UserCheck className="mr-2 size-4 text-primary" /> Manual Activate
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="cursor-pointer"
                                render={
                                  <Link href={`/admin/users/view/${sub.userId}`} />
                                }
                              >
                                <ExternalLink className="mr-2 size-4" /> View User Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <div>
              Showing {items.length} of {totalCount} subscriptions (Page {page} of {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 size-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <VerifyBkashDialog
        subscription={selectedForVerify}
        open={Boolean(selectedForVerify)}
        onOpenChange={(open) => !open && setSelectedForVerify(null)}
        onSuccess={() => void fetchSubscriptions()}
      />

      <ManualActivateDialog
        subscription={selectedForActivate}
        open={Boolean(selectedForActivate)}
        onOpenChange={(open) => !open && setSelectedForActivate(null)}
        onSuccess={() => void fetchSubscriptions()}
      />

      <PaymentDetailDialog
        subscription={selectedForDetail}
        open={Boolean(selectedForDetail)}
        onOpenChange={(open) => !open && setSelectedForDetail(null)}
      />
    </div>
  );
}
