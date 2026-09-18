"use client";

import {
  CheckCircle2,
  FolderPlus,
  FolderTree,
  Layers,
  Loader2,
  Plus,
  Search,
  Slash,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CategoryDialog } from "./components/category-dialog";
import { CategoryRow } from "./components/category-tree";
import { DeleteCategoryDialog } from "./components/delete-dialog";
import {
  type CategoryNode,
  collectCategoryIds,
  countActive,
  countCategories,
  filterCategories,
  flattenCategories,
} from "./components/types";

const loadingRows = [
  { id: "skeleton-1", width: 72 },
  { id: "skeleton-2", width: 48 },
  { id: "skeleton-3", width: 40 },
  { id: "skeleton-4", width: 52 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<{
    open: boolean;
    editing: CategoryNode | null;
    defaultParentId: string;
  }>({ open: false, editing: null, defaultParentId: "" });
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message ?? "Failed to load categories");
      }
    } catch {
      setError("Failed to load categories");
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

  const visibleCategories = useMemo(
    () => filterCategories(categories, query),
    [categories, query],
  );

  const totalCount = useMemo(() => countCategories(categories), [categories]);
  const activeCount = useMemo(() => countActive(categories), [categories]);
  const rootCount = categories.length;

  const options = useMemo(() => {
    const excluded = new Set<string>();

    if (formState.editing) {
      const collect = (nodes: CategoryNode[]) => {
        for (const node of nodes) {
          excluded.add(node.id);
          collect(node.children);
        }
      };

      collect([formState.editing]);
    }

    return flattenCategories(categories).filter(
      (option) => !excluded.has(option.id),
    );
  }, [categories, formState.editing]);

  function toggleCollapsed(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseAll() {
    setCollapsed(new Set(collectCategoryIds(categories)));
  }

  function openCreateRoot() {
    setFormState({ open: true, editing: null, defaultParentId: "" });
  }

  function openCreateChild(category: CategoryNode) {
    setFormState({
      open: true,
      editing: null,
      defaultParentId: category.id,
    });
  }

  function openEdit(category: CategoryNode) {
    setFormState({
      open: true,
      editing: category,
      defaultParentId: category.parentId ?? "",
    });
  }

  function handleSaved(message: string) {
    void refresh();
    showToast(message);
  }

  function handleDeleted(category: CategoryNode) {
    void refresh();
    showToast(`“${category.name}” deleted successfully`);
  }

  const stats = [
    {
      label: "Total categories",
      value: totalCount,
      icon: Layers,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Top level",
      value: rootCount,
      icon: FolderTree,
      accent: "bg-sky-500/10 text-sky-600",
    },
    {
      label: "Active",
      value: activeCount,
      icon: CheckCircle2,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Inactive",
      value: totalCount - activeCount,
      icon: XCircle,
      accent: "bg-muted text-muted-foreground",
    },
  ];

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
              <FolderTree className="size-5" />
            </span>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Categories
              </h1>

              <p className="text-sm text-muted-foreground">
                Organize listings into an infinite nested hierarchy.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={openCreateRoot}
          className="bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus />
          Add New Category
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
                placeholder="Search categories…"
                className="h-9 rounded-lg pl-8"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Expand all
              </button>

              <Slash className="size-3.5 rotate-12 text-border" />

              <button
                type="button"
                onClick={collapseAll}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Collapse all
              </button>

              <Badge
                variant="secondary"
                className="ml-1 rounded-full font-medium"
              >
                {countCategories(visibleCategories)} shown
              </Badge>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="space-y-2">
                {loadingRows.map(({ id, width }) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center">
                      <div className="size-1.5 rounded-full bg-muted-foreground/20" />
                    </div>
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
            ) : visibleCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FolderPlus className="size-6" />
                </span>

                <div>
                  <p className="font-medium">
                    {query
                      ? "No categories match your search"
                      : "No categories yet"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {query
                      ? "Try a different keyword."
                      : "Create your first category to get started."}
                  </p>
                </div>

                {!query && (
                  <Button
                    size="sm"
                    onClick={openCreateRoot}
                    className="bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus />
                    Add New Category
                  </Button>
                )}
              </div>
            ) : (
              <ul className="space-y-2">
                {visibleCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    depth={0}
                    collapsed={collapsed}
                    onToggle={toggleCollapsed}
                    onAddChild={openCreateChild}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        editing={formState.editing}
        defaultParentId={formState.defaultParentId}
        options={options}
        onSaved={handleSaved}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
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
