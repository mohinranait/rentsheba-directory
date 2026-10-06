export type DashboardKpis = {
  totalListings: number;
  approvedListings: number;
  pendingListings: number;
  featuredListings: number;
  rejectedListings: number;
  totalUsers: number;
  activeUsers: number;
  totalSellers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  expiringSoonSubscriptions: number;
  totalReviews: number;
  pendingReviews: number;
  totalViews: number;
};

export type MonthlyTrendItem = {
  month: string;
  listings: number;
  revenue: number;
  users: number;
};

export type CategoryStatItem = {
  name: string;
  count: number;
  fill?: string;
};

export type LocationStatItem = {
  name: string;
  count: number;
};

export type StatusStatItem = {
  status: string;
  count: number;
  fill: string;
};

export type PendingListingItem = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  categoryName: string;
  locationName: string;
  thumbnailUrl: string | null;
};

export type RecentPaymentItem = {
  id: string;
  subscriptionId: string;
  amount: number;
  status: string;
  trxID: string | null;
  paymentID: string | null;
  paidAt: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  planName: string;
};

export type ExpiringSubscriptionItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  expiresAt: string;
  daysRemaining: number;
};

export type AdminDashboardData = {
  adminName: string;
  kpis: DashboardKpis;
  monthlyTrends: MonthlyTrendItem[];
  categoryDistribution: CategoryStatItem[];
  locationDistribution: LocationStatItem[];
  statusDistribution: StatusStatItem[];
  pendingListings: PendingListingItem[];
  recentPayments: RecentPaymentItem[];
  expiringSubscriptions: ExpiringSubscriptionItem[];
};

export type AdminDashboardResponse = {
  success: boolean;
  message?: string;
  data?: AdminDashboardData;
};
