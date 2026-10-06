"use client";

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FolderTree,

  MessageSquare,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar, AvatarFallback, } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import  {
 type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  AdminDashboardData,
  AdminDashboardResponse,
} from "@/types/dashboard-admin.type";

const formatCurrency = (val: number) =>
  `৳${new Intl.NumberFormat("en-US").format(val)}`;

const formatDate = (isoString?: string | null) => {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const trendChartConfig = {
  listings: {
    label: "Listings Created",
    color: "#2563eb",
  },
  revenue: {
    label: "Revenue (BDT)",
    color: "#10b981",
  },
  users: {
    label: "User Signups",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  count: {
    label: "Listings",
  },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTrendMetric, setActiveTrendMetric] = React.useState<
    "listings" | "revenue" | "users"
  >("listings");

  const fetchDashboard = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = (await res.json()) as AdminDashboardResponse;
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || "Failed to load dashboard data");
      }
      setData(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <Skeleton className="h-80 w-full lg:col-span-4" />
          <Skeleton className="h-80 w-full lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load Dashboard</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => void fetchDashboard()} variant="outline">
          <RefreshCcw className="mr-2 size-4" /> Try Again
        </Button>
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {data.adminName}
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="size-3.5 text-muted-foreground" />
            Here&apos;s an overview of RentSheba Directory platform performance today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchDashboard()}
            className="gap-1.5"
          >
            <RefreshCcw className="size-3.5" />
            Refresh
          </Button>

          {kpis.pendingListings > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 gap-1.5"
              render={<Link href="/admin/listings/pending" />}
            >
              <Clock className="size-3.5" />
              {kpis.pendingListings} Pending Reviews
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            render={<Link href="/admin/listings/add" />}
          >
            <Plus className="size-4" />
            Add New Listing
          </Button>
        </div>
      </div>

      {/* Top 4 Primary KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Listings */}
        <Card className="shadow-xs border hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Building2 className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
              >
                <CheckCircle2 className="size-3" />
                {kpis.approvedListings} Active
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Listings
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {kpis.totalListings.toLocaleString()}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-amber-600 font-medium">
                  {kpis.pendingListings} pending approval
                </span>
                <Link
                  href="/admin/listings"
                  className="hover:text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Platform Revenue */}
        <Card className="shadow-xs border hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
              >
                <TrendingUp className="size-3" />
                bKash Gateway
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">
                {formatCurrency(kpis.totalRevenue)}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatCurrency(kpis.monthlyRevenue)} this month
                </span>
                <Link
                  href="/admin/subscriptions"
                  className="hover:text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Payments <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscribers */}
        <Card className="shadow-xs border hover:border-violet-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <CreditCard className="size-5" />
              </div>
              {kpis.expiringSoonSubscriptions > 0 ? (
                <Badge
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-orange-700"
                >
                  {kpis.expiringSoonSubscriptions} Expiring ≤30d
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Stable
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Subscriptions
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {kpis.activeSubscriptions.toLocaleString()}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-amber-600 font-medium">
                  {kpis.pendingSubscriptions} pending activation
                </span>
                <Link
                  href="/admin/subscriptions"
                  className="hover:text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Subscribers <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Users */}
        <Card className="shadow-xs border hover:border-amber-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Users className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-blue-200 bg-blue-50 text-blue-700 font-medium"
              >
                <UserCheck className="size-3" />
                {kpis.totalSellers} Sellers
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {kpis.totalUsers.toLocaleString()}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{kpis.activeUsers} active accounts</span>
                <Link
                  href="/admin/users"
                  className="hover:text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Users <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Eye className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total Directory Views</p>
            <p className="text-lg font-bold truncate">
              {kpis.totalViews.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Star className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Featured / Hero Listings</p>
            <p className="text-lg font-bold truncate">
              {kpis.featuredListings}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
            <MessageSquare className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Customer Reviews</p>
            <p className="text-lg font-bold truncate">
              {kpis.totalReviews}
              {kpis.pendingReviews > 0 && (
                <span className="ml-1 text-xs font-normal text-amber-600">
                  ({kpis.pendingReviews} pending)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
            <ShieldAlert className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Rejected / Inactive</p>
            <p className="text-lg font-bold truncate">
              {kpis.rejectedListings}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Monthly Activity Trend (4 cols) */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Platform Growth & Trends
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Performance trajectory over the last 6 months.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTrendMetric("listings")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors",
                  activeTrendMetric === "listings"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Listings
              </button>
              <button
                type="button"
                onClick={() => setActiveTrendMetric("revenue")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors",
                  activeTrendMetric === "revenue"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setActiveTrendMetric("users")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors",
                  activeTrendMetric === "users"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Users
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ChartContainer config={trendChartConfig} className="h-full w-full">
                {activeTrendMetric === "revenue" ? (
                  <AreaChart
                    data={data.monthlyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `৳${val}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(val) => `৳${Number(val).toLocaleString()}`}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                ) : activeTrendMetric === "users" ? (
                  <BarChart
                    data={data.monthlyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="users"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={data.monthlyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="listingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="listings"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#listingsGrad)"
                    />
                  </AreaChart>
                )}
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories Distribution (3 cols) */}
        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Top Categories
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution of listings across main directory categories.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {data.categoryDistribution.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No categories available yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="h-48 w-full">
                  <ChartContainer
                    config={categoryChartConfig}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <Tooltip
                        formatter={(value) => [`${value} listings`, "Count"]}
                      />
                      <Pie
                        data={data.categoryDistribution}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {data.categoryDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {data.categoryDistribution.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.fill }}
                        />
                        <span className="truncate font-medium">{cat.name}</span>
                      </div>
                      <span className="text-muted-foreground font-semibold ml-1">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Feeds Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Listings Requiring Approval */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-amber-600" />
                Listings Awaiting Moderation
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Review and approve recently submitted business listings.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              render={<Link href="/admin/listings/pending" />}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {data.pendingListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
                <CheckCircle2 className="size-8 text-emerald-600" />
                <p className="mt-2 text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">
                  No listings currently waiting for moderation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                        {listing.thumbnailUrl ? (
                          <Image
                            src={listing.thumbnailUrl}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building2 className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/listings/edit/${listing.slug}`}
                          className="font-medium text-sm text-foreground hover:text-primary hover:underline block truncate"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          by <span className="font-medium">{listing.ownerName}</span> · {listing.categoryName} · {listing.locationName}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                      render={<Link href={`/admin/listings/edit/${listing.slug}`} />}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bKash Payments */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-emerald-600" />
                Recent Payments & Transactions
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Track real-time subscription payments through bKash.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              render={<Link href="/admin/subscriptions" />}
            >
              All Payments
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {data.recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
                <CreditCard className="size-8 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">No recent payments</p>
                <p className="text-xs text-muted-foreground">
                  New subscriber payments will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs bg-emerald-50 text-emerald-700">
                          {getInitials(payment.userName || "Payment")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">
                          {payment.userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {payment.planName} ·{" "}
                          {payment.trxID ? (
                            <span className="font-mono text-emerald-600 font-semibold">
                              TrxID: {payment.trxID}
                            </span>
                          ) : (
                            formatDate(payment.createdAt)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 mt-0.5",
                          payment.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewal Watchlist & Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Renewals Due Soon (4 cols) */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-orange-600" />
                Upcoming Subscription Renewals
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Subscribers approaching expiry in the next 30 days.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              render={<Link href="/admin/subscriptions?status=ACTIVE" />}
            >
              View Subscribers
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {data.expiringSubscriptions.length === 0 ? (
              <div className="p-6 text-center border rounded-lg bg-muted/20 text-xs text-muted-foreground">
                No active subscriptions expiring within the next 30 days.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {data.expiringSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/users/view/${sub.userId}`}
                        className="font-medium hover:underline text-sm truncate block"
                      >
                        {sub.userName}
                      </Link>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {sub.userEmail} · {sub.planName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold",
                          sub.daysRemaining <= 7
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-orange-300 bg-orange-50 text-orange-700",
                        )}
                      >
                        Due in {sub.daysRemaining} days
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(sub.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Administration Hub (3 cols) */}
        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Directory Hub Shortcuts
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Direct access to essential platform management modules.
            </p>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-2">
            <Link
              href="/admin/listings"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                    Manage All Listings
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {kpis.totalListings} total businesses
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/subscriptions"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                    Subscriptions & bKash
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {kpis.activeSubscriptions} subscribers · {formatCurrency(kpis.totalRevenue)}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <FolderTree className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                    Category Tree
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Manage business sectors & icons
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                    Users & Merchants
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {kpis.totalUsers} registered users
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}