"use client";

import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  PublicSubscriptionPlanListResponse,
  SubscriptionPlan,
} from "@/types/subscription-plan.type";
import { Button } from "../ui/button";

type Mode = "loading" | "ready" | "hidden";

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

  if (plan.durationInDays % 30 === 0) {
    const months = plan.durationInDays / 30;
    return {
      amount,
      suffix: months === 1 ? "/ month" : `/ ${months} months`,
    };
  }

  if (plan.durationInDays > 0) {
    return { amount, suffix: `/ ${plan.durationInDays} days` };
  }

  return { amount, suffix: "one-time" };
}

function planFeatures(plan: SubscriptionPlan): string[] {
  if (plan.features.length > 0) {
    return plan.features;
  }

  const featured = `Add up to ${plan.maxListings} listing${
    plan.maxListings === 1 ? "" : "s"
  }`;

  if (Number(plan.price) === 0 || plan.durationInDays === 0) {
    return [featured, "Basic business profile", "Search visibility"];
  }

  return [featured];
}

function PlanCard({
  plan,
  featured,
}: {
  plan: SubscriptionPlan;
  featured: boolean;
}) {
  const { amount, suffix } = formatPrice(plan);
  const features = planFeatures(plan);
  const price = Number(plan.price);

  if (featured) {
    return (
      <div className="relative rounded-2xl border border-white/25 bg-white/[.08] p-7 text-white shadow-[0_25px_60px_rgba(0,0,0,.25)] backdrop-blur-xl">
        {plan.badge && (
          <span className="absolute right-5 top-5 rounded-full bg-[#d3f36b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#193d32]">
            {plan.badge}
          </span>
        )}

        <p className="text-sm font-bold text-[#b8df9d]">{plan.name}</p>

        <div className="mt-4 text-4xl font-bold">
          {amount}{" "}
          <span className="text-sm font-normal text-white/55">{suffix}</span>
        </div>

        {plan.description && (
          <p className="mt-3 text-sm text-white/65">{plan.description}</p>
        )}

        <ul className="mt-7 flex flex-col gap-3 text-sm text-white/85">
          {features.map((feature) => (
            <li key={feature}>
              <Check className="mr-2 inline size-4 text-[#d3f36b]" /> {feature}
            </li>
          ))}
        </ul>

        <Button className="mt-8 w-full rounded-lg bg-[#d3f36b] py-3 text-sm font-bold text-[#193d32] hover:bg-[#c4e85d]">
          {price === 0 ? "Start for free" : `Choose ${plan.name}`}
          {price > 0 && <ArrowRight className="ml-1 inline size-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[.04] p-7 backdrop-blur-xl">
      <p className="text-sm font-bold text-white/70">{plan.name}</p>

      <div className="mt-4 text-4xl font-bold">
        {amount}{" "}
        <span className="text-sm font-normal text-white/50">{suffix}</span>
      </div>

      {plan.description && (
        <p className="mt-3 text-sm text-white/60">{plan.description}</p>
      )}

      <ul className="mt-7 flex flex-col gap-3 text-sm text-white/75">
        {features.map((feature) => (
          <li key={feature}>
            <Check className="mr-2 inline size-4 text-[#b8df9d]" /> {feature}
          </li>
        ))}
      </ul>

      <Button className="mt-8 w-full rounded-lg border border-white/25 bg-transparent py-3 text-sm font-bold text-white hover:bg-white/10">
        {price === 0 ? "Start for free" : `Choose ${plan.name}`}
      </Button>
    </div>
  );
}

const SubscriptionSection = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const res = await fetch("/api/public/subscription-plans", {
          cache: "no-store",
        });
        const data = (await res.json()) as PublicSubscriptionPlanListResponse;

        if (cancelled) {
          return;
        }

        if (data.success && data.data && data.data.length > 0) {
          setPlans(data.data);
          setMode("ready");
        } else {
          setMode("hidden");
        }
      } catch {
        if (!cancelled) {
          setMode("hidden");
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredIndex =
    mode === "ready"
      ? plans.reduce((featured, plan, index) => {
          if (plan.badge) {
            return index;
          }

          return featured;
        }, plans.length - 1)
      : -1;

  const columns = plans.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2";

  if (mode === "hidden") {
    return null;
  }

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#0e2a22] px-5 py-24 text-white lg:px-8"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-[45%] bg-[#d3f36b]/10 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-[45%] bg-[#4b8b71]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8df9d]">
            Plans that grow with you
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-.045em] sm:text-4xl">
            Start free. Be found everywhere.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/65">
            Simple pricing for local businesses, independent professionals, and
            growing teams.
          </p>
        </div>

        <div className={`mx-auto mt-10 grid max-w-4xl gap-5 ${columns}`}>
          {mode === "loading"
            ? [0, 1].map((index) => (
                <div
                  key={`plan-skeleton-${index}`}
                  className="h-80 animate-pulse rounded-2xl border border-white/15 bg-white/[.04]"
                />
              ))
            : plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  featured={index === featuredIndex && plans.length > 1}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
