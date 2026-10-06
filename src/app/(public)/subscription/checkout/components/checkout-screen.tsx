"use client";

import { BadgeCheck, Check, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types/subscription-plan.type";

type CheckoutData = {
  success: boolean;
  message?: string;
  data?: {
    bkashURL?: string;
    url?: string;
    completed?: boolean;
  };
};

function formatPrice(plan: SubscriptionPlan): {
  amount: string;
  suffix: string;
} {
  const price = Number(plan.price);

  if (price === 0) {
    return { amount: "৳0", suffix: "forever" };
  }

  const amount = `৳${new Intl.NumberFormat("en-US").format(price)}`;

  if (plan.durationInDays % 365 === 0) {
    const years = plan.durationInDays / 365;
    return {
      amount,
      suffix: years === 1 ? "/ year" : `/ ${years} years`,
    };
  }

  if (plan.durationInDays > 0) {
    return { amount, suffix: `/ ${plan.durationInDays} days` };
  }

  return { amount, suffix: "one-time" };
}

export function CheckoutScreen({
  plan,
  alreadyActive,
}: {
  plan: SubscriptionPlan;
  alreadyActive: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { amount, suffix } = formatPrice(plan);
  const isFree = Number(plan.price) === 0;

  async function handleActivateFree() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = (await res.json()) as CheckoutData;

      if (!data.success) {
        setError(data.message ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBkash() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/bkash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = (await res.json()) as CheckoutData;

      if (!data.success || !data.data) {
        setError(data.message ?? "Something went wrong");
        setSubmitting(false);
        return;
      }

      const target = data.data.bkashURL ?? data.data.url;

      if (target) {
        window.location.href = target;
        return;
      }

      setError(data.message ?? "Something went wrong");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyActive) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-16">
        <div className="rounded-2xl border border-[#e1e9e3] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <BadgeCheck className="size-6" />
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-[-.04em] text-[#173f34]">
            You already have {plan.name}
          </h1>

          <p className="mt-2 text-sm text-[#647f74]">
            An active subscription for this plan is already running on your
            account.
          </p>

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full rounded-xl font-semibold"
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Plan summary */}
        <div className="lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6d9585]">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-.045em] text-[#173f34] sm:text-4xl">
            {plan.name} plan
          </h1>

          <div className="mt-6 rounded-2xl border border-[#e1e9e3] bg-white p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-[#7d9289]">Payable amount</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-[#254d40]">
                  {amount}{" "}
                  <span className="text-base font-normal text-[#7d9289]">
                    {suffix}
                  </span>
                </p>
              </div>

              {plan.badge && (
                <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-600">
                  {plan.badge}
                </span>
              )}
            </div>

            {plan.description && (
              <p className="mt-3 text-sm text-[#647f74]">{plan.description}</p>
            )}

            <ul className="mt-6 flex flex-col gap-2.5 border-t border-[#eef4f1] pt-5 text-sm text-[#395c50]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Up to {plan.maxListings} listings
              </li>
            </ul>
          </div>
        </div>

        {/* Payment */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#e1e9e3] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-[#254d40]">
              {isFree ? "Activate plan" : "Payment method"}
            </h2>

            {isFree ? (
              <p className="mt-2 text-sm text-[#647f74]">
                This plan is free — activate it and start listing right away.
              </p>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e1e9e3] bg-[#f8faf9] p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#e2136e] text-sm font-black text-white">
                  bKash
                </span>

                <div>
                  <p className="text-sm font-semibold text-[#254d40]">bKash</p>
                  <p className="text-xs text-[#7d9289]">
                    Pay with your bKash account
                  </p>
                </div>
              </div>
            )}

            {!isFree && (
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#7d9289]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                You will be redirected to the bKash checkout to approve the
                {amount} payment securely.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <Button
              type="button"
              size="lg"
              disabled={submitting}
              onClick={isFree ? handleActivateFree : handleBkash}
              className="mt-5 w-full rounded-xl bg-[#e2136e] font-semibold text-white shadow-lg shadow-[#e2136e]/20 hover:bg-[#ff2e83]"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isFree ? "Activating…" : "Redirecting to bKash…"}
                </>
              ) : (
                <>
                  {isFree ? "Activate free plan" : "Pay with bKash"}
                  {!isFree && <span className="ml-1 font-bold">{amount}</span>}
                </>
              )}
            </Button>

            {!isFree && (
              <p className="mt-3 text-center text-[11px] text-[#9aaca3]">
                By paying you agree to the subscription terms.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
