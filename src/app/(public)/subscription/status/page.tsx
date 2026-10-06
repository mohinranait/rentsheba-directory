import { BadgeCheck, Info, ShieldAlert, Undo2 } from "lucide-react";
import Link from "next/link";

export default async function SubscriptionStatusPage({
  searchParams,
}: {
  searchParams: Promise<{
    result?: string;
    trx?: string;
    paymentID?: string;
    reason?: string;
    message?: string;
  }>;
}) {
  const { result, trx, paymentID, reason, message } = await searchParams;

  const failed = result === "failed";
  const cancelled = result === "cancelled";
  const success = result === "success";

  const icon = success ? (
    <BadgeCheck className="size-8" />
  ) : (
    <ShieldAlert className="size-8" />
  );

  const title = success
    ? "Payment successful!"
    : failed
      ? "Payment failed"
      : cancelled
        ? "Payment cancelled"
        : "Payment processing";

  const description = success
    ? "Your subscription is now active. Thank you for subscribing!"
    : cancelled
      ? "You cancelled the payment on bKash. You can try again whenever you're ready."
      : reason || message || "The payment was not completed on the bKash payment gateway. Please try again.";

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-20">
      <div className="rounded-2xl border border-[#e1e9e3] bg-white p-10 text-center shadow-sm">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${
            success
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {icon}
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-[-.045em] text-[#173f34]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#647f74]">{description}</p>

        {paymentID && !success && (
          <p className="mt-2 text-xs text-[#8ca198]">
            Reference Payment ID: <span className="font-mono font-medium">{paymentID}</span>
          </p>
        )}

        {success && trx && (
          <p className="mt-4 rounded-lg bg-[#f0f7f3] px-3 py-2 text-xs text-[#395c50]">
            Transaction ID: <span className="font-semibold">{trx}</span>
          </p>
        )}

        {failed && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-semibold text-amber-950">
              <Info className="size-4 shrink-0 text-amber-700" />
              <span>bKash Sandbox Testing Instructions:</span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
              <li>Check the <strong>&quot;I agree to terms&quot;</strong> box on the first screen.</li>
              <li>Enter OTP: <strong>123456</strong> and click Confirm within the timer.</li>
              <li>Enter PIN: <strong>12121</strong> and click Confirm.</li>
              <li>
                If wallet <code>01770618575</code> fails, please try other sandbox test numbers:
                <br />
                <span className="font-mono font-medium text-amber-950">01929918378</span>,{" "}
                <span className="font-mono font-medium text-amber-950">01770618576</span>,{" "}
                <span className="font-mono font-medium text-amber-950">01877722345</span>
              </li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {success ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173f34] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#254d40]"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173f34] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#254d40]"
              >
                <Undo2 className="size-4" /> Try again
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe0d8] px-6 py-2.5 text-sm font-semibold text-[#395c50] transition-colors hover:bg-[#f2f8f5]"
              >
                Browse directory
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
