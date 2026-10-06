"use client";

import { CheckCircle2, Loader2, UserCheck, XCircle } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSubscriptionItem } from "@/types/subscription-admin.type";

type ManualActivateDialogProps = {
  subscription: AdminSubscriptionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ManualActivateDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: ManualActivateDialogProps) {
  const [trxID, setTrxID] = React.useState("");
  const [durationInDays, setDurationInDays] = React.useState(365);
  const [note, setNote] = React.useState("Manually verified and activated by admin");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultMessage, setResultMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (subscription) {
      setTrxID(subscription.payment?.trxID || "");
      setDurationInDays(subscription.plan.durationInDays || 365);
      setNote("Manually verified and activated by admin");
      setError(null);
      setResultMessage(null);
    }
  }, [subscription]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await fetch(
        `/api/admin/subscriptions/${encodeURIComponent(subscription.id)}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trxID: trxID.trim() || undefined,
            durationInDays: Number(durationInDays) || 365,
            note: note.trim() || undefined,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to activate subscription");
      }

      setResultMessage(data.message || "Subscription activated successfully!");
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate subscription");
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleActivate}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              Manual Subscription Activation
            </DialogTitle>
            <DialogDescription>
              Activate this subscription immediately and mark its payment as completed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-sm">
            <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscriber:</span>
                <span className="font-medium text-foreground">{subscription.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium text-foreground">
                  {subscription.plan.name} (৳{subscription.plan.price})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-medium uppercase text-amber-600">{subscription.status}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trxID">bKash Transaction ID (TrxID)</Label>
              <Input
                id="trxID"
                value={trxID}
                onChange={(e) => setTrxID(e.target.value)}
                placeholder="e.g. BKL129845 or manual reference"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Record the bKash TrxID if the user paid directly or via merchant number.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationInDays">Duration (Days)</Label>
              <Input
                id="durationInDays"
                type="number"
                min="1"
                max="3650"
                value={durationInDays}
                onChange={(e) => setDurationInDays(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Subscription validity in days (default: {subscription.plan.durationInDays || 365} days).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Admin Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Customer provided TrxID over WhatsApp/Phone"
                rows={2}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <XCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {resultMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{resultMessage}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate Subscription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
