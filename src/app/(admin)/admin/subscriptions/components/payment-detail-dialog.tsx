"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminSubscriptionItem } from "@/types/subscription-admin.type";

type PaymentDetailDialogProps = {
  subscription: AdminSubscriptionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDate = (isoString?: string | null) => {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};

export function PaymentDetailDialog({
  subscription,
  open,
  onOpenChange,
}: PaymentDetailDialogProps) {
  if (!subscription) return null;

  const payment = subscription.payment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            Payment & Subscription Record
          </DialogTitle>
          <DialogDescription>
            Complete payment tracking and bKash transaction metadata.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* User info */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Name</span>
                <span className="font-medium">{subscription.user.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span className="font-medium">{subscription.user.email}</span>
              </div>
              {subscription.user.phone && (
                <div>
                  <span className="text-muted-foreground block text-xs">Phone</span>
                  <span>{subscription.user.phone}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block text-xs">User ID</span>
                <Link
                  href={`/admin/users/view/${subscription.userId}`}
                  className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {subscription.userId.slice(0, 13)}...
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Plan details */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Subscription Plan
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Plan Name</span>
                <span className="font-medium">{subscription.plan.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Plan Price</span>
                <span className="font-medium">৳{subscription.plan.price}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Max Listings</span>
                <span>{subscription.plan.maxListings} Listings</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Subscription Status</span>
                <Badge variant="outline" className="mt-0.5">
                  {subscription.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment information */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Payment & bKash Gateway Details
            </h4>
            {payment ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Payment Status</span>
                  <Badge
                    variant="secondary"
                    className={
                      payment.status === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : payment.status === "FAILED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Method</span>
                  <span className="font-medium">{payment.method}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Amount</span>
                  <span className="font-bold text-base text-foreground">
                    ৳{payment.amount} {payment.currency}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Paid Date</span>
                  <span>{formatDate(payment.paidAt)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs">bKash TrxID</span>
                  <span className="font-mono text-xs font-semibold bg-background px-2 py-1 rounded border inline-block">
                    {payment.trxID || "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs">bKash Payment ID</span>
                  <span className="font-mono text-xs break-all bg-background px-2 py-1 rounded border inline-block">
                    {payment.paymentID || "—"}
                  </span>
                </div>
                {payment.merchantInvoiceNumber && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Merchant Invoice</span>
                    <span className="font-mono text-xs">{payment.merchantInvoiceNumber}</span>
                  </div>
                )}
                {payment.customerMsisdn && (
                  <div>
                    <span className="text-muted-foreground block text-xs">Customer Wallet MSISDN</span>
                    <span>{payment.customerMsisdn}</span>
                  </div>
                )}
                {payment.failureReason && (
                  <div className="col-span-2">
                    <span className="text-destructive block text-xs">Failure Reason</span>
                    <span className="text-xs text-destructive">{payment.failureReason}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment record found for this subscription.</p>
            )}
          </div>

          {/* Timeline & Renewal */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Subscription Timeline & Renewal
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Created At</span>
                <span>{formatDate(subscription.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Started At</span>
                <span>{formatDate(subscription.startsAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Renewal Due / Expiry</span>
                <span className="font-medium text-foreground">
                  {formatDate(subscription.expiresAt)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Time Remaining</span>
                {subscription.daysRemaining !== null ? (
                  subscription.daysRemaining > 0 ? (
                    <span className="text-emerald-600 font-medium">
                      {subscription.daysRemaining} days remaining
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      Expired {Math.abs(subscription.daysRemaining)} days ago
                    </span>
                  )
                ) : (
                  <span>Never expires</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
