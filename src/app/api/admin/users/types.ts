import type {
  UserRole,
  UserStatus,
} from "../../../../../generated/prisma/enums";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    listings: number;
    favorites: number;
    subscriptions: number;
  };
};

export type AdminUserPayment = {
  id: string;
  trxID: string | null;
  paymentID: string | null;
  merchantInvoiceNumber: string | null;
  amount: string | number;
  currency: string;
  method: string;
  status: string;
  paidAt: Date | string | null;
  customerMsisdn?: string | null;
};

export type AdminUserSubscription = {
  id: string;
  status: string;
  startsAt: Date | string;
  expiresAt: Date | string | null;
  createdAt: Date | string;
  plan: {
    id: string;
    name: string;
    slug: string;
    price?: string | number;
    maxListings?: number;
  } | null;
  payment?: AdminUserPayment | null;
};

export type AdminUserListing = {
  id: string;
  title: string;
  slug: string;
  verificationStatus: string;
};

export type AdminUserDetail = AdminUserListItem & {
  listings: AdminUserListing[];
  subscriptions: AdminUserSubscription[];
  listingQuota?: {
    eligible: boolean;
    currentCount: number;
    maxListings: number;
    planName?: string;
    planSlug?: string;
    expiresAt?: string | null;
  } | null;
};

export type AdminUserListStats = {
  total: number;
  active: number;
  blocked: number;
  admins: number;
};

export type AdminUserListResponse = {
  success: boolean;
  message?: string;
  data?: {
    items: AdminUserListItem[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
    stats: AdminUserListStats;
  };
};

export type AdminUserDetailResponse = {
  success: boolean;
  message?: string;
  data?: AdminUserDetail;
};
