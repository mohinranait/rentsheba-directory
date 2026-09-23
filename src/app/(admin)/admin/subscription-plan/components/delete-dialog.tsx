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
import type { SubscriptionPlanAdminItem } from "@/types/subscription-plan.type";

type DeletePlanDialogProps = {
  plan: SubscriptionPlanAdminItem | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (plan: SubscriptionPlanAdminItem) => void;
};

export function DeletePlanDialog({
  plan,
  onOpenChange,
  onDeleted,
}: DeletePlanDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !!plan;
  const subscriptionCount = plan?._count.subscriptions ?? 0;

  async function handleDelete() {
    if (!plan) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/subscription-plan/${plan.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Something went wrong");
        return;
      }

      onDeleted(plan);
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
          <DialogTitle>Delete subscription plan</DialogTitle>
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
                  “{plan?.name}”
                </span>
                ?
              </p>

              <p className="mt-1 text-muted-foreground">
                {subscriptionCount > 0
                  ? `It has ${subscriptionCount} subscription(s) attached and cannot be deleted — deactivate it instead.`
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
            disabled={submitting || subscriptionCount > 0}
            onClick={handleDelete}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete plan
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
