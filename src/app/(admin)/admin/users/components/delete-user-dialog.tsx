"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteUserDialogProps = {
  open: boolean;
  userId: string;
  userName: string;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteUserDialog({
  open,
  userId,
  userName,
  onOpenChange,
  onDeleted,
}: DeleteUserDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
        },
      );

      const data = (await res.json()) as { success: boolean; message?: string };

      if (!data.success) {
        setError(data.message ?? "Something went wrong");
        return;
      }

      onOpenChange(false);
      onDeleted?.();
      router.refresh();
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
          <DialogTitle>Delete user</DialogTitle>
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
                  “{userName}”
                </span>
                ?
              </p>

              <p className="mt-1 text-muted-foreground">
                Their account and every listing they own will be permanently
                removed. This cannot be undone.
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
            Delete user
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
