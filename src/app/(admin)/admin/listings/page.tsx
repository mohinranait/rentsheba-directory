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

type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";

type Listing = {
  id: string;
  title: string;
  category: string;
  location: string;
  owner: string;
  status: ListingStatus;
  isFeatured: boolean;
  isClaimed: boolean;
  views: number;
  rating: number;
  reviews: number;
  createdAt: string;
};

const listings: Listing[] = [
  {
    id: "1",
    title: "Shikder Ambulance Service",
    category: "Ambulance Service",
    location: "Dhaka, Bangladesh",
    owner: "Md. Rahman",
    status: "APPROVED",
    isFeatured: true,
    isClaimed: true,
    views: 12450,
    rating: 4.8,
    reviews: 126,
    createdAt: "Sep 18, 2026",
  },
  {
    id: "2",
    title: "Patuakhali Ambulance Care",
    category: "Ambulance Service",
    location: "Patuakhali, Barishal",
    owner: "Abdul Karim",
    status: "PENDING",
    isFeatured: false,
    isClaimed: false,
    views: 850,
    rating: 4.5,
    reviews: 18,
    createdAt: "Sep 17, 2026",
  },
  {
    id: "3",
    title: "Barishal Medical Center",
    category: "Medical Service",
    location: "Barishal Sadar, Barishal",
    owner: "Dr. Hasan",
    status: "APPROVED",
    isFeatured: true,
    isClaimed: true,
    views: 5680,
    rating: 4.7,
    reviews: 74,
    createdAt: "Sep 16, 2026",
  },
  {
    id: "4",
    title: "Green Life Diagnostic",
    category: "Diagnostic Center",
    location: "Mirpur, Dhaka",
    owner: "Green Life Ltd.",
    status: "REJECTED",
    isFeatured: false,
    isClaimed: false,
    views: 420,
    rating: 3.9,
    reviews: 9,
    createdAt: "Sep 15, 2026",
  },
  {
    id: "5",
    title: "City Car Rental",
    category: "Car Rental",
    location: "Dhanmondi, Dhaka",
    owner: "Mohammad Ali",
    status: "APPROVED",
    isFeatured: false,
    isClaimed: true,
    views: 3210,
    rating: 4.4,
    reviews: 42,
    createdAt: "Sep 14, 2026",
  },
  {
    id: "6",
    title: "Maa Ambulance Service",
    category: "Ambulance Service",
    location: "Jhalokathi, Barishal",
    owner: "Rasel Ahmed",
    status: "PENDING",
    isFeatured: false,
    isClaimed: false,
    views: 640,
    rating: 4.2,
    reviews: 11,
    createdAt: "Sep 13, 2026",
  },
  {
    id: "7",
    title: "Popular Diagnostic Center",
    category: "Diagnostic Center",
    location: "Uttara, Dhaka",
    owner: "Popular Group",
    status: "APPROVED",
    isFeatured: true,
    isClaimed: true,
    views: 9870,
    rating: 4.9,
    reviews: 218,
    createdAt: "Sep 12, 2026",
  },
];

const statusConfig: Record<
  ListingStatus,
  {
    label: string;
    className: string;
  }
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
};

export default function AllListingsPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [category, setCategory] = React.useState<string>("all");
  const [location, setLocation] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<string[]>([]);

  const filteredListings = React.useMemo(() => {
    return listings.filter((listing) => {
      const searchMatch =
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.owner.toLowerCase().includes(search.toLowerCase());

      const statusMatch =
        status === "all" || listing.status === status;

      const categoryMatch =
        category === "all" || listing.category === category;

      const locationMatch =
        location === "all" || listing.location.includes(location);

      return (
        searchMatch &&
        statusMatch &&
        categoryMatch &&
        locationMatch
      );
    });
  }, [search, status, category, location]);

  const allSelected =
    filteredListings.length > 0 &&
    filteredListings.every((listing) =>
      selected.includes(listing.id)
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelected((current) =>
        current.filter(
          (id) =>
            !filteredListings.some(
              (listing) => listing.id === id
            )
        )
      );
      return;
    }

    setSelected((current) => [
      ...new Set([
        ...current,
        ...filteredListings.map((listing) => listing.id),
      ]),
    ]);
  };

  const toggleListing = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const hasFilters =
    search || status !== "all" || category !== "all" || location !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setLocation("all");
  };

  return (
    <div className="flex flex-1 flex-col gap-6 ">
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

        <Button>
          <Plus className="mr-2 size-4" />
          Add Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Listings"
          value="1,248"
          description="+12.5% from last month"
        />

        <StatCard
          title="Approved"
          value="1,086"
          description="87.0% of total listings"
        />

        <StatCard
          title="Pending Review"
          value="94"
          description="Needs admin review"
        />

        <StatCard
          title="Rejected"
          value="68"
          description="5.4% of total listings"
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
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[145px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Ambulance Service">
                    Ambulance Service
                  </SelectItem>
                  <SelectItem value="Medical Service">
                    Medical Service
                  </SelectItem>
                  <SelectItem value="Diagnostic Center">
                    Diagnostic Center
                  </SelectItem>
                  <SelectItem value="Car Rental">
                    Car Rental
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Dhaka">Dhaka</SelectItem>
                  <SelectItem value="Barishal">Barishal</SelectItem>
                  <SelectItem value="Patuakhali">
                    Patuakhali
                  </SelectItem>
                  <SelectItem value="Jhalokathi">
                    Jhalokathi
                  </SelectItem>
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
              {filteredListings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="mb-2 size-5 text-muted-foreground" />
                      <p className="font-medium">
                        No listings found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredListings.map((listing) => (
                  <TableRow
                    key={listing.id}
                    className="group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(listing.id)}
                        onCheckedChange={() =>
                          toggleListing(listing.id)
                        }
                        aria-label={`Select ${listing.title}`}
                      />
                    </TableCell>

                    {/* Listing */}
                    <TableCell>
                      <div className="flex min-w-[250px] items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
                          {listing.title.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">
                              {listing.title}
                            </p>

                            {listing.isFeatured && (
                              <Badge
                                variant="secondary"
                                className="hidden shrink-0 sm:inline-flex"
                              >
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {listing.owner}
                            </span>

                            {listing.isClaimed && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600">
                                  Claimed
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="whitespace-nowrap text-sm">
                        {listing.category}
                      </span>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {listing.location}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusConfig[listing.status].className
                        }
                      >
                        <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                        {statusConfig[listing.status].label}
                      </Badge>
                    </TableCell>

                    {/* Stats */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span>
                          {listing.views.toLocaleString()} views
                        </span>

                        <span className="text-muted-foreground">
                          ★ {listing.rating} ({listing.reviews})
                        </span>
                      </div>
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {listing.createdAt}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">
                              Open menu
                            </span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 size-4" />
                            View listing
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Pencil className="mr-2 size-4" />
                            Edit listing
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
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
              1–7
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              1,248
            </span>{" "}
            listings
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>

              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-[70px]">
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
                disabled
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="size-8 p-0"
              >
                1
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
              >
                2
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
              >
                3
              </Button>

              <span className="px-1 text-sm text-muted-foreground">
                ...
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
              >
                125
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-8"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}