"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Admin listing reviews — moderate the review queue, approve, remove or
// restore reviews, and filter everything down to a single listing.
// ---------------------------------------------------------------------------

type ReviewStatus = "PENDING" | "ACTIVE" | "DELETED";

type ReviewItem = {
  id: string;
  rating: number;
  text: string;
  name: string | null;
  status: ReviewStatus;
  createdAt: string;
  listing: { id: string; title: string; slug: string } | null;
};

type ReviewsResponse = {
  success: boolean;
  data?: {
    items: ReviewItem[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
    stats: {
      total: number;
      pending: number;
      approved: number;
      deleted: number;
    };
  };
};

type ListingOption = {
  id: string;
  title: string;
  slug: string;
  reviewCount: number | null;
};

const statusConfig: Record<ReviewStatus, { label: string; className: string }> =
  {
    ACTIVE: {
      label: "Approved",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
    },
    PENDING: {
      label: "Pending",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
    },
    DELETED: {
      label: "Deleted",
      className:
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
    },
  };

const AVATAR_TONES = [
  "bg-[#e7f0eb] text-[#2e6c57]",
  "bg-[#f1e9dc] text-[#8a5a2b]",
  "bg-[#e3eaf3] text-[#335b7a]",
  "bg-[#f6e7e2] text-[#9c4a35]",
  "bg-[#e7ecf0] text-[#4a5b68]",
];

const getTone = (value: string) => {
  const hash = value
    .split("")
    .reduce((sum, char) => sum + (char.charCodeAt(0) ?? 0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const displayName = (name: string | null) =>
  name?.trim() ? name : "Anonymous";

const getInitial = (name: string | null) =>
  displayName(name).charAt(0).toUpperCase();

const STAR_VALUES = [1, 2, 3, 4, 5];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

function ReviewStars({ value }: { value: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value}/5 stars`}
    >
      {STAR_VALUES.map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= value
              ? "fill-[#e5b34f] text-[#e5b34f]"
              : "fill-muted text-muted",
          )}
        />
      ))}
    </span>
  );
}

export default function ListingReviewsPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [listingId, setListingId] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [items, setItems] = React.useState<ReviewItem[]>([]);
  const [meta, setMeta] = React.useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    deleted: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [listingOptions, setListingOptions] = React.useState<ListingOption[]>(
    [],
  );
  const [listingOptionsLoading, setListingOptionsLoading] =
    React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<ReviewItem | null>(
    null,
  );
  const [toast, setToast] = React.useState<string | null>(null);

  // Debounce the search box so we only hit the API after the user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load the listings used by the "single post" filter
  React.useEffect(() => {
    let cancelled = false;
    setListingOptionsLoading(true);

    void fetch("/api/admin/listing?page=1&pageSize=100&sortBy=title")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.success && data.data) {
          setListingOptions(data.data.items as ListingOption[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setListingOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = React.useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const load = React.useCallback(
    async (keepPage = false) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(keepPage ? page : 1),
          pageSize: String(pageSize),
        });

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status !== "all") params.set("status", status);
        if (listingId !== "all") params.set("listingId", listingId);

        const response = await fetch(
          `/api/admin/listing-reviews?${params.toString()}`,
        );
        const data = (await response.json()) as ReviewsResponse;

        if (!response.ok || !data.success || !data.data) {
          throw new Error("Failed to load reviews");
        }

        setItems(data.data.items);
        setMeta(data.data.meta);
        setStats(data.data.stats);
      } catch {
        setError("Failed to load reviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, debouncedSearch, status, listingId],
  );

  React.useEffect(() => {
    void load(true);
  }, [load]);

  // Approve / reject / restore a review
  const patchStatus = async (review: ReviewItem, nextStatus: ReviewStatus) => {
    try {
      const response = await fetch(`/api/admin/listing-reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.message ?? "Update failed");
        return;
      }

      showToast(data.message ?? "Review updated");
      void load(true);
    } catch {
      showToast("Something went wrong");
    }
  };

  const permanentDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(
        `/api/admin/listing-reviews/${deleteTarget.id}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(data.message ?? "Delete failed");
        return;
      }

      showToast("Review deleted permanently");
      setDeleteTarget(null);
      void load(true);
    } catch {
      showToast("Something went wrong");
    }
  };

  const resetPage = () => setPage(1);

  const handleStatusChange = (value: string | null) => {
    setStatus(value ?? "all");
    resetPage();
  };

  const handleListingChange = (value: string | null) => {
    setListingId(value ?? "all");
    resetPage();
  };

  const handlePageSizeChange = (value: string | null) => {
    const next = Number(value ?? "10");
    setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
    resetPage();
  };

  const hasFilters =
    Boolean(debouncedSearch) || status !== "all" || listingId !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setListingId("all");
    resetPage();
  };

  const pageNumbers = getPageNumbers(meta.page, meta.totalPages);
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);

  const selectedListing = listingOptions.find(
    (option) => option.id === listingId,
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg animate-in slide-in-from-bottom-4 fade-in-0 dark:bg-emerald-950/80 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquareText className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Listing Reviews
              </h1>
              <p className="text-sm text-muted-foreground">
                Approve, remove or restore customer reviews submitted by
                visitors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={stats.total.toLocaleString()}
          description="Across all statuses"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending.toLocaleString()}
          description="Waiting for your decision"
        />
        <StatCard
          title="Approved"
          value={stats.approved.toLocaleString()}
          description="Published on the site"
        />
        <StatCard
          title="Deleted"
          value={stats.deleted.toLocaleString()}
          description="Hidden from the site"
        />
      </div>

      {/* Main content */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, review or listing…"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Approved</SelectItem>
                  <SelectItem value="DELETED">Deleted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={listingId} onValueChange={handleListingChange}>
                <SelectTrigger className="w-full sm:max-w-xs lg:w-72">
                  <SelectValue placeholder="All listings">
                    {listingId === "all"
                      ? "All Listings"
                      : (selectedListing?.title ?? "All Listings")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  {listingOptionsLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Loading listings…
                    </div>
                  ) : (
                    listingOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.title}
                      </SelectItem>
                    ))
                  )}
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
                <TableHead>Reviewer</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
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
                        onClick={() => void load(true)}
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
                      <p className="font-medium">No reviews found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onFilterListing={() => {
                      if (review.listing) {
                        setListingId(review.listing.id);
                        resetPage();
                      }
                    }}
                    onApprove={() => void patchStatus(review, "ACTIVE")}
                    onPending={() => void patchStatus(review, "PENDING")}
                    onDelete={() => void patchStatus(review, "DELETED")}
                    onDeletePermanent={() => setDeleteTarget(review)}
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
            reviews
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

      {/* Permanent delete confirm */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete review permanently</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/20 text-destructive">
                <Trash2 className="size-4" />
              </span>
              <div className="text-sm">
                <p>
                  Are you sure you want to permanently delete the review from{" "}
                  <span className="font-semibold text-foreground">
                    {deleteTarget ? displayName(deleteTarget.name) : ""}
                  </span>
                  ?
                </p>
                <p className="mt-1 text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void permanentDelete()}
            >
              <Trash2 className="size-4" />
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

function ReviewRow({
  review,
  onFilterListing,
  onApprove,
  onPending,
  onDelete,
  onDeletePermanent,
}: {
  review: ReviewItem;
  onFilterListing: () => void;
  onApprove: () => void;
  onPending: () => void;
  onDelete: () => void;
  onDeletePermanent: () => void;
}) {
  const statusInfo = statusConfig[review.status] ?? statusConfig.PENDING;

  return (
    <TableRow className="group align-top">
      {/* Reviewer */}
      <TableCell>
        <div className="flex min-w-44 items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold shadow-sm",
              getTone(review.name ?? "Anonymous"),
            )}
            aria-hidden
          >
            {getInitial(review.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{displayName(review.name)}</p>
            {!review.name && (
              <p className="text-xs text-muted-foreground">Anonymous</p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Listing */}
      <TableCell>
        <div className="min-w-40">
          <button
            type="button"
            onClick={onFilterListing}
            disabled={!review.listing}
            className="block max-w-48 truncate text-left text-sm font-medium underline-offset-4 hover:underline disabled:cursor-default disabled:no-underline"
            title={
              review.listing
                ? `Show all reviews for “${review.listing.title}”`
                : undefined
            }
          >
            {review.listing?.title ?? "-"}
          </button>
          {review.listing && (
            <Link
              href={`/listing/${review.listing.slug}`}
              target="_blank"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              <Eye className="size-3" /> View on site
            </Link>
          )}
        </div>
      </TableCell>

      {/* Rating */}
      <TableCell>
        <ReviewStars value={review.rating} />
      </TableCell>

      {/* Review text */}
      <TableCell>
        <p className="max-w-sm line-clamp-2 text-sm text-muted-foreground">
          {review.text}
        </p>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={statusInfo.className}>
          <span className="mr-1.5 size-1.5 rounded-full bg-current" />
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Submitted */}
      <TableCell>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {dateFormatter.format(new Date(review.createdAt))}
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

          <DropdownMenuContent align="end" className="w-44">
            {review.status !== "ACTIVE" && (
              <DropdownMenuItem className="cursor-pointer" onClick={onApprove}>
                <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                Approve
              </DropdownMenuItem>
            )}

            {review.status !== "PENDING" && (
              <DropdownMenuItem className="cursor-pointer" onClick={onPending}>
                <Loader2 className="mr-2 size-4" />
                Move to pending
              </DropdownMenuItem>
            )}

            {review.status !== "DELETED" && (
              <DropdownMenuItem className="cursor-pointer" onClick={onDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            )}

            {review.status === "DELETED" && <DropdownMenuSeparator />}

            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={onDeletePermanent}
            >
              <Trash2 className="mr-2 size-4" />
              Delete permanently
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
