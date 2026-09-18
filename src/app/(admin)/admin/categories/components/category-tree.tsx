"use client";

import { ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "./types";

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
];

type CategoryRowProps = {
  category: CategoryNode;
  depth: number;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (category: CategoryNode) => void;
  onEdit: (category: CategoryNode) => void;
  onDelete: (category: CategoryNode) => void;
};

export function CategoryRow({
  category,
  depth,
  collapsed,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  const hasChildren = category.children.length > 0;
  const isCollapsed = collapsed.has(category.id);
  const gradient = GRADIENTS[depth % GRADIENTS.length];

  return (
    <li className="group/row">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-3 transition-all hover:border-primary/40 hover:shadow-sm sm:gap-3",
          depth === 0 && "shadow-xs",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            aria-label={isCollapsed ? "Expand category" : "Collapse category"}
            aria-expanded={!isCollapsed}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 hover:bg-muted hover:text-foreground"
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200",
                !isCollapsed && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center">
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          </span>
        )}

        {category.image ? (
          // biome-ignore lint/performance/noImgElement: small remote thumbnail avatar
          <img
            src={category.image}
            alt=""
            className="size-9 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-semibold text-white",
              depth === 0 && "shadow-sm",
              gradient,
            )}
          >
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-medium text-foreground">
              {category.name}
            </p>

            <Badge
              variant={category.isActive ? "default" : "secondary"}
              className="h-4.5 rounded-full px-1.5 text-[10px]"
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>

            {hasChildren && (
              <Badge
                variant="outline"
                className="h-4.5 gap-1 rounded-full px-1.5 text-[10px] font-medium text-muted-foreground"
              >
                <FolderTree className="size-3" />
                {category.children.length}
              </Badge>
            )}
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">/{category.slug}</span>
            {category.description && <span> · {category.description}</span>}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-within/row:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title={`Add sub-category under ${category.name}`}
            onClick={() => onAddChild(category)}
          >
            <Plus />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title="Edit category"
            onClick={() => onEdit(category)}
          >
            <Pencil />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title="Delete category"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <ul className="relative ml-8 mt-2 space-y-2 border-l-2 border-primary/15 pl-3 sm:ml-12 sm:pl-5">
          {category.children.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              depth={depth + 1}
              collapsed={collapsed}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
