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

export type AdminUserSubscription = {
  id: string;
  status: string;
  startsAt: Date;
  expiresAt: Date | null;
  plan: { id: string; name: string; slug: string } | null;
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
