"use client";

import {
  CheckCircle2,
  CreditCard,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  PlanType,
  SubscriptionPlanAdminItem,
  SubscriptionPlanListResponse,
  SubscriptionPlanStats,
} from "@/types/subscription-plan.type";
import { DeletePlanDialog } from "./components/delete-dialog";
import { PlanDialog } from "./components/plan-dialog";

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "YEARLY", label: "Yearly" },
];

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  FREE: "Free",
  YEARLY: "Yearly",
};

function formatPrice(price: string): string {
  const amount = Number(price);
  return amount === 0
    ? "৳0"
    : `৳${new Intl.NumberFormat("en-US").format(amount)}`;
}

function formatDuration(days: number, price: string): string {
  if (Number(price) === 0 || days === 0) {
    return "Forever";
  }

  if (days % 365 === 0) {
    const years = days / 365;
    return years === 1 ? "1 year" : `${years} years`;
  }

  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }

  return `${days} days`;
}

const loadingRows = [
  { id: "skeleton-1", width: 72 },
  { id: "skeleton-2", width: 48 },
  { id: "skeleton-3", width: 40 },
];

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlanAdminItem[]>([]);
  const [stats, setStats] = useState<SubscriptionPlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | PlanType>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    open: boolean;
    editing: SubscriptionPlanAdminItem | null;
  }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] =
    useState<SubscriptionPlanAdminItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscription-plan");
      const data = (await res.json()) as SubscriptionPlanListResponse;

      if (data.success && data.data) {
        setPlans(data.data.items);
        setStats(data.data.stats);
      } else {
        setError(data.message ?? "Failed to load subscription plans");
      }
    } catch {
      setError("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const visiblePlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plans.filter((plan) => {
      if (typeFilter !== "ALL" && plan.type !== typeFilter) {
        return false;
      }
      if (statusFilter === "ACTIVE" && !plan.isActive) {
        return false;
      }
      if (statusFilter === "INACTIVE" && plan.isActive) {
        return false;
      }
      if (
        normalizedQuery &&
        !plan.name.toLowerCase().includes(normalizedQuery) &&
        !plan.slug.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [plans, query, typeFilter, statusFilter]);

  const takenTypes = useMemo(
    () => new Set<PlanType>(plans.map((plan) => plan.type)),
    [plans],
  );

  const availableTypes = useMemo(
    () => PLAN_TYPE_OPTIONS.filter((option) => !takenTypes.has(option.value)),
    [takenTypes],
  );

  function openCreate() {
    setFormState({
      open: true,
      editing: null,
    });
  }

  function openEdit(plan: SubscriptionPlanAdminItem) {
    setFormState({
      open: true,
      editing: plan,
    });
  }

  function handleSaved(message: string) {
    void refresh();
    showToast(message);
  }

  function handleDeleted(plan: SubscriptionPlanAdminItem) {
    void refresh();
    showToast(`“${plan.name}” deleted successfully`);
  }

  async function toggleActive(plan: SubscriptionPlanAdminItem) {
    if (togglingId) {
      return;
    }

    setTogglingId(plan.id);

    try {
      const res = await fetch(`/api/admin/subscription-plan/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message ?? "Failed to update plan");
        return;
      }

      void refresh();
    } catch {
      showToast("Failed to update plan");
    } finally {
      setTogglingId(null);
    }
  }

  const statCards = [
    {
      label: "Total plans",
      value: stats?.total ?? 0,
      icon: Layers,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Active",
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Inactive",
      value: stats?.inactive ?? 0,
      icon: XCircle,
      accent: "bg-muted text-muted-foreground",
    },
    {
      label: "Subscriptions",
      value: stats?.subscriptions ?? 0,
      icon: Users,
      accent: "bg-sky-500/10 text-sky-600",
    },
  ];

  const canCreate = availableTypes.length > 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg animate-in slide-in-from-bottom-4 fade-in-0 dark:bg-emerald-950/80 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Subscription Plans
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage the pricing plans visitors can subscribe to.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={openCreate}
          disabled={!canCreate}
          title={
            canCreate ? undefined : "Both Free and Yearly plans already exist"
          }
          className="bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus />
          Add New Plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    stat.accent,
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>

                  <p className="text-xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plans…"
                className="h-9 rounded-lg pl-8"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "ALL" | PlanType)
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-40">
                  <SelectValue>
                    {typeFilter === "ALL"
                      ? "All types"
                      : PLAN_TYPE_LABELS[typeFilter]}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  {PLAN_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE")
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-40">
                  <SelectValue>
                    {statusFilter === "ALL"
                      ? "All statuses"
                      : statusFilter === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="rounded-full font-medium">
                {visiblePlans.length} shown
              </Badge>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="space-y-2">
                {loadingRows.map(({ id, width }) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 p-3.5"
                  >
                    <div
                      className="h-9 shrink-0 animate-pulse rounded-lg bg-muted/60"
                      style={{ width: `${width}%` }}
                    />
                    <div className="flex-1">
                      <div className="h-3.5 w-1/4 animate-pulse rounded bg-muted/60" />
                      <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-muted/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <XCircle className="size-6" />
                </span>

                <div>
                  <p className="font-medium">{error}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please try again in a moment.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refresh()}
                >
                  <Loader2 className="size-3.5" />
                  Retry
                </Button>
              </div>
            ) : visiblePlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="size-6" />
                </span>

                <div>
                  <p className="font-medium">
                    {query || typeFilter !== "ALL" || statusFilter !== "ALL"
                      ? "No plans match your filters"
                      : "No subscription plans yet"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {query || typeFilter !== "ALL" || statusFilter !== "ALL"
                      ? "Try a different keyword or filter."
                      : "Create your first plan to get started."}
                  </p>
                </div>

                {!query &&
                  typeFilter === "ALL" &&
                  statusFilter === "ALL" &&
                  canCreate && (
                    <Button
                      size="sm"
                      onClick={openCreate}
                      className="bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus />
                      Add New Plan
                    </Button>
                  )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Max listings</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visiblePlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CreditCard className="size-4" />
                          </span>

                          <div>
                            <p className="flex items-center gap-2 font-medium">
                              {plan.name}
                              {plan.badge && (
                                <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-600">
                                  {plan.badge}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              /{plan.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            plan.type === "FREE" ? "secondary" : "default"
                          }
                          className="rounded-full font-medium"
                        >
                          {PLAN_TYPE_LABELS[plan.type]}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatPrice(plan.price)}
                      </TableCell>

                      <TableCell>{plan.maxListings}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDuration(plan.durationInDays, plan.price)}
                      </TableCell>

                      <TableCell>{plan._count.subscriptions}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.isActive}
                            disabled={togglingId === plan.id}
                            onCheckedChange={() => void toggleActive(plan)}
                          />
                          <span
                            className={cn(
                              "text-xs font-medium",
                              plan.isActive
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {plan.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${plan.name}`}
                            onClick={() => openEdit(plan)}
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Delete ${plan.name}`}
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(plan)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <PlanDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        editing={formState.editing}
        defaultType={availableTypes[0]?.value ?? "FREE"}
        takenTypes={plans.map((plan) => plan.type)}
        onSaved={handleSaved}
      />

      <DeletePlanDialog
        plan={deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
