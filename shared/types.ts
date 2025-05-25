import { 
  User as DbUser,
  Case as DbCase,
  Message as DbMessage,
  Subscription as DbSubscription,
  Investigator as DbInvestigator,
  Review as DbReview
} from "./schema";

// Export types that may need additional properties or transformations
export type User = DbUser;

export type Case = DbCase & {
  updates?: CaseUpdate[];
};

export type CaseUpdate = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
};

export type Message = DbMessage;

export type Subscription = DbSubscription & {
  casesUsed?: number;
  remainingCases?: number;
};

export type Review = DbReview;

export type Investigator = DbInvestigator & {
  reviews?: Review[];
};

// Admin stats type
export type AdminStats = {
  totalUsers: number;
  totalCases: number;
  totalInvestigators: number;
  totalSubscriptions: number;
  revenueByPlan: { plan: string; count: number; revenue: number }[];
  casesByStatus: { status: string; count: number }[];
  subscriptionGrowth?: { date: string; count: number }[];
  caseGrowth?: { date: string; count: number }[];
};

// Role-based types
export type SubscriberDashboardStats = {
  activeCases: number;
  availableCases: number;
  unreadMessages: number;
  subscription: Subscription;
};

export type InvestigatorDashboardStats = {
  activeCases: number;
  pendingCases: number;
  completedCases: number;
  averageRating: number;
  reviewCount: number;
  earnings: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalCases: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentUsers: User[];
  recentCases: Case[];
};
