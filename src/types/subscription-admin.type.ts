import type {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
} from "@generated/prisma/enums";

export type AdminSubscriptionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
};

export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  maxListings: number;
  durationInDays: number;
};

export type AdminSubscriptionPayment = {
  id: string;
  transactionId: string | null;
  paymentID: string | null;
  trxID: string | null;
  merchantInvoiceNumber: string | null;
  amount: string | number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  customerMsisdn: string | null;
  failureReason: string | null;
  metadata?: unknown;
  paidAt: string | null;
  createdAt: string;
};

export type AdminSubscriptionItem = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminSubscriptionUser;
  plan: AdminSubscriptionPlan;
  payment: AdminSubscriptionPayment | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
};

export type AdminSubscriptionStats = {
  total: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
  expiringSoon: number;
  totalRevenue: number;
};

export type AdminSubscriptionListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items: AdminSubscriptionItem[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    stats: AdminSubscriptionStats;
  };
};

export type AdminSubscriptionActionResponse = {
  success: boolean;
  message: string;
  data?: {
    subscription: {
      id: string;
      status: SubscriptionStatus;
      startsAt: string;
      expiresAt: string | null;
    };
    payment?: {
      id: string;
      status: PaymentStatus;
      trxID: string | null;
      paidAt: string | null;
    } | null;
  };
};
