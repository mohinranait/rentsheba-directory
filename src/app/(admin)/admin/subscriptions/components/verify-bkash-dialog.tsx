"use client";

import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
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
import type { AdminSubscriptionItem } from "@/types/subscription-admin.type";

type VerifyBkashDialogProps = {
  subscription: AdminSubscriptionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function VerifyBkashDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: VerifyBkashDialogProps) {
  const [paymentID, setPaymentID] = React.useState("");
  const [trxID, setTrxID] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultMessage, setResultMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (subscription) {
      setPaymentID(subscription.payment?.paymentID || "");
      setTrxID(subscription.payment?.trxID || "");
      setError(null);
      setResultMessage(null);
    }
  }, [subscription]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;

    if (!paymentID.trim()) {
      setError("Please provide a valid bKash Payment ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await fetch(
        `/api/admin/subscriptions/${encodeURIComponent(subscription.id)}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentID: paymentID.trim(),
            trxID: trxID.trim() || undefined,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "bKash verification failed");
      }

      setResultMessage(data.message || "Payment verified and subscription activated successfully!");
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleVerify}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              Verify bKash Payment
            </DialogTitle>
            <DialogDescription>
              Check the transaction status directly with bKash Query API and activate this subscription.
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
              {subscription.payment?.merchantInvoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-mono text-xs">{subscription.payment.merchantInvoiceNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentID">bKash Payment ID</Label>
              <Input
                id="paymentID"
                value={paymentID}
                onChange={(e) => setPaymentID(e.target.value)}
                placeholder="e.g. TR0011m... or PaymentID from bKash"
                required
              />
              <p className="text-xs text-muted-foreground">
                The bKash payment ID returned during checkout initialization.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trxID">bKash TrxID (Optional)</Label>
              <Input
                id="trxID"
                value={trxID}
                onChange={(e) => setTrxID(e.target.value)}
                placeholder="e.g. BKL87ABC99"
              />
              <p className="text-xs text-muted-foreground">
                Optional transaction ID if known from customer SMS/statement.
              </p>
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
              disabled={loading || !paymentID.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Querying bKash...
                </>
              ) : (
                "Verify & Activate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
