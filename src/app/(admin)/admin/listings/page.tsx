"use client";

import {
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
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DeleteListingDialog } from "./components/delete-listing-dialog";

type ListingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED"
  | "DRAFT";

type Owner = { id: string; name: string; email: string };
type Category = { id: string; name: string };
type Location = { id: string; nameEn: string; nameLocal: string };
type Thumbnail = { id: string; secure_url: string };

type ListingItem = {
  id: string;
  title: string;
  slug: string;
  verificationStatus: ListingStatus;
  isFeatured: boolean;
  isClaimed: boolean;
  isHeroListing: boolean;
  viewCount: number | null;
  averageRating: number | null;
  reviewCount: number | null;
  createdAt: string;
  owner: Owner | null;
  category: Category | null;
  location: Location | null;
  thumbnail: Thumbnail | null;
};

type ListingResponse = {
  success: boolean;
  data?: {
    items: ListingItem[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
    stats: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

type LocationNode = {
  id: string;
  nameEn: string;
  nameLocal: string;
  type: "DIVISION" | "DISTRICT" | "UPAZILA";
  children: LocationNode[];
};

type LocationOption = { id: string; label: string };

const statusConfig: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  },
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
  EXPIRED: {
    label: "Expired",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400",
  },
  DRAFT: {
    label: "Draft",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export default function AllListingsPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [categoryId, setCategoryId] = React.useState("all");
  const [locationId, setLocationId] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = React.useState<ListingItem | null>(
    null,
  );

  const [items, setItems] = React.useState<ListingItem[]>([]);
  const [meta, setMeta] = React.useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [stats, setStats] = React.useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<
    LocationOption[]
  >([]);

  // Debounce the search box so we only hit the API after the user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load filter options (all categories + a flattened location list)
  React.useEffect(() => {
    let cancelled = false;

    void fetch("/api/public/categories")
      .then((response) => response.json())
      .then((data: { success: boolean; data?: CategoryOption[] }) => {
        if (!cancelled && data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});

    void fetch("/api/locations/tree")
      .then((response) => response.json())
      .then((data: { success: boolean; data?: LocationNode[] }) => {
        if (!cancelled && data.success && data.data) {
          const options: LocationOption[] = [];
          const flatten = (
            nodes: LocationNode[],
            prefix: string,
            depth: number,
          ) => {
            for (const node of nodes) {
              if (node.type !== "UPAZILA") {
                options.push({
                  id: node.id,
                  label: `${prefix}${node.nameLocal || node.nameEn}`,
                });
              }
              flatten(node.children, "  ", depth + 1);
            }
          };
          flatten(data.data, "", 0);
          setLocationOptions(options);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError("");
    setSelected([]);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status !== "all") params.set("status", status);
      if (categoryId !== "all") params.set("categoryId", categoryId);
      if (locationId !== "all") params.set("locationId", locationId);

      const response = await fetch(`/api/admin/listing?${params.toString()}`);
      const data = (await response.json()) as ListingResponse;

      if (!response.ok || !data.success || !data.data) {
        throw new Error("Failed to load listings");
      }

      setItems(data.data.items);
      setMeta(data.data.meta);
      setStats(data.data.stats);
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status, categoryId, locationId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const resetPage = () => setPage(1);

  const handleStatusChange = (value: string | null) => {
    setStatus(value ?? "all");
    resetPage();
  };

  const handleCategoryChange = (value: string | null) => {
    setCategoryId(value ?? "all");
    resetPage();
  };

  const handleLocationChange = (value: string | null) => {
    setLocationId(value ?? "all");
    resetPage();
  };

  const handlePageSizeChange = (value: string | null) => {
    const next = Number(value ?? "10");
    setPageSize(Number.isFinite(next) && next > 0 ? next : 10);
    resetPage();
  };

  const allSelected =
    items.length > 0 && items.every((item) => selected.includes(item.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((current) =>
        current.filter((id) => !items.some((item) => item.id === id)),
      );
      return;
    }
    setSelected((current) => [
      ...new Set([...current, ...items.map((item) => item.id)]),
    ]);
  };

  const toggleListing = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const hasFilters =
    Boolean(debouncedSearch) ||
    status !== "all" ||
    categoryId !== "all" ||
    locationId !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategoryId("all");
    setLocationId("all");
    resetPage();
  };

  const categoryOptions = buildCategoryOptions(categories);
  const pageNumbers = getPageNumbers(meta.page, meta.totalPages);
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total);

  const selectedCategory = categoryOptions.find(
    (option) => option.id === categoryId,
  );

  const selectedLocation = locationOptions.find(
    (option) => option.id === locationId,
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            All Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review all listings submitted to your directory.
          </p>
        </div>

        <Button render={<Link href="/admin/listings/add" />}>
          <Plus className="mr-2 size-4" />
          Add Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Listings"
          value={stats.total.toLocaleString()}
          description="Across all statuses"
        />

        <StatCard
          title="Approved"
          value={stats.approved.toLocaleString()}
          description={
            stats.total > 0
              ? `${Math.round((stats.approved / stats.total) * 100)}% of total listings`
              : "No listings yet"
          }
        />

        <StatCard
          title="Pending Review"
          value={stats.pending.toLocaleString()}
          description="Needs admin review"
        />

        <StatCard
          title="Rejected"
          value={stats.rejected.toLocaleString()}
          description={
            stats.total > 0
              ? `${Math.round((stats.rejected / stats.total) * 100)}% of total listings`
              : "No rejected listings"
          }
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
                placeholder="Search listings or owners..."
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="All Categories">
                    {categoryId === "all"
                      ? "All Categories"
                      : (selectedCategory?.label ?? "All Categories")}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>

                  {categoryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationId} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="All Locations">
                    {locationId === "all"
                      ? "All Locations"
                      : (selectedLocation?.label ?? "All Locations")}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>

                  {locationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
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

          {/* Selected toolbar */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
              <div className="text-sm font-medium">
                {selected.length} listing
                {selected.length > 1 ? "s" : ""} selected
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle2 className="mr-2 size-4" />
                  Approve
                </Button>

                <Button size="sm" variant="outline">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all listings"
                  />
                </TableHead>

                <TableHead>
                  <div className="flex items-center gap-1">
                    Listing
                    <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                  </div>
                </TableHead>

                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <LoadingRows columns={8} />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
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
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="mb-2 size-5 text-muted-foreground" />
                      <p className="font-medium">No listings found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    selected={selected.includes(listing.id)}
                    onToggle={() => toggleListing(listing.id)}
                    onDelete={() => setDeleteTarget(listing)}
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
            listings
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

      <DeleteListingDialog
        open={deleteTarget !== null}
        listingTitle={deleteTarget?.title ?? ""}
        listingSlug={deleteTarget?.slug ?? ""}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={() => void load()}
      />
    </div>
  );
}

function ListingRow({
  listing,
  selected,
  onToggle,
  onDelete,
}: {
  listing: ListingItem;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const statusInfo =
    statusConfig[listing.verificationStatus] ?? statusConfig.DRAFT;

  return (
    <TableRow className="group">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${listing.title}`}
        />
      </TableCell>

      {/* Listing */}
      <TableCell>
        <div className="flex min-w-62.5 items-center gap-3">
          {listing.thumbnail?.secure_url ? (
            <Image
              src={listing.thumbnail.secure_url}
              alt={listing.title}
              width={40}
              height={40}
              className="size-10 rounded-lg border object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
              {listing.title.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{listing.title}</p>

              {listing.isFeatured && (
                <Badge
                  variant="secondary"
                  className="hidden shrink-0 sm:inline-flex"
                >
                  Featured
                </Badge>
              )}

              {listing.isHeroListing && (
                <Badge
                  variant="secondary"
                  className="hidden shrink-0 border-[#d9efb8] bg-[#f4fbdf] text-[#5c7d1f] sm:inline-flex"
                >
                  Home
                </Badge>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{listing.owner?.name ?? "Unknown owner"}</span>

              {listing.isClaimed && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600">Claimed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <span className="whitespace-nowrap text-sm">
          {listing.category?.name ?? "-"}
        </span>
      </TableCell>

      {/* Location */}
      <TableCell>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {listing.location?.nameLocal ?? "-"}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge variant="outline" className={statusInfo.className}>
          <span className="mr-1.5 size-1.5 rounded-full bg-current" />
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Stats */}
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs">
          <span>{(listing.viewCount ?? 0).toLocaleString()} views</span>

          <span className="text-muted-foreground">
            ★ {listing.averageRating ?? 0} ({listing.reviewCount ?? 0})
          </span>
        </div>
      </TableCell>

      {/* Created */}
      <TableCell>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {dateFormatter.format(new Date(listing.createdAt))}
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

          <DropdownMenuContent align="end" className={'w-40'}>
            <DropdownMenuItem
            className={'cursor-pointer'}
              render={
                <Link href={`/admin/listings/edit/${listing.slug}`} target="_blank" />
              }
            >
              <Eye className="mr-2 size-4" />
              View listing
            </DropdownMenuItem>

            <DropdownMenuItem
              className={'cursor-pointer'}
              render={
                <Link href={`/admin/listings/add?slug=${listing.slug}`} />
              }
            >
              <Pencil className="mr-2 size-4" />
              Edit listing
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem   className={'cursor-pointer'} variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 size-4" />
              Delete listing
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

function buildCategoryOptions(
  categories: CategoryOption[],
): { id: string; label: string }[] {
  const childrenByParent = new Map<string | null, CategoryOption[]>();

  for (const category of categories) {
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  const options: { id: string; label: string }[] = [];

  const flatten = (parentId: string | null, depth: number) => {
    for (const category of childrenByParent.get(parentId) ?? []) {
      options.push({
        id: category.id,
        label: `${"  ".repeat(depth)}${category.name}`,
      });
      flatten(category.id, depth + 1);
    }
  };

  flatten(null, 0);

  return options;
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
