import type { PlanType } from "../../generated/prisma/enums";

export type { PlanType };

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  type: PlanType;
  price: string;
  maxListings: number;
  durationInDays: number;
  description: string | null;
  features: string[];
  badge: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPlanAdminItem = SubscriptionPlan & {
  _count: {
    subscriptions: number;
  };
};

export type SubscriptionPlanStats = {
  total: number;
  active: number;
  inactive: number;
  subscriptions: number;
};

export type SubscriptionPlanListData = {
  items: SubscriptionPlanAdminItem[];
  stats: SubscriptionPlanStats;
};

export type SubscriptionPlanListResponse = {
  success: boolean;
  message?: string;
  data?: SubscriptionPlanListData;
};

export type SubscriptionPlanDetailResponse = {
  success: boolean;
  message?: string;
  data?: SubscriptionPlan;
};

export type PublicSubscriptionPlanListResponse = {
  success: boolean;
  message?: string;
  data?: SubscriptionPlan[];
};

export type { SubscriptionPlanFormValues } from "@/lib/schemas/subscription-plan-schema";
