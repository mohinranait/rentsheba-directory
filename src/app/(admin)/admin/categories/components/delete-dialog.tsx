"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CategoryNode } from "./types";

type DeleteCategoryDialogProps = {
  category: CategoryNode | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (category: CategoryNode) => void;
};

export function DeleteCategoryDialog({
  category,
  onOpenChange,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !!category;
  const childCount = category?._count.children ?? 0;

  async function handleDelete() {
    if (!category) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Something went wrong");
        return;
      }

      onDeleted(category);
      onOpenChange(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!submitting) {
          onOpenChange(value);
        }
      }}
    >
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/20 text-destructive">
              <Trash2 className="size-4" />
            </span>

            <div className="text-sm">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  “{category?.name}”
                </span>
                ?
              </p>

              <p className="mt-1 text-muted-foreground">
                {childCount > 0
                  ? `Its ${childCount} sub-categor${
                      childCount === 1 ? "y" : "ies"
                    } will be moved to the next level up.`
                  : "This action cannot be undone."}
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={handleDelete}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete category
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
