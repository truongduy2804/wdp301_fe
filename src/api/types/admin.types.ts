// filepath: src/api/types/admin.types.ts

/**
 * Admin dashboard data types
 */

// ============================================================================
// Overview Dashboard Types
// ============================================================================

/** Key Performance Indicators for admin overview */
export interface OverviewKPI {
  /** Total number of users in system */
  totalUsers: number;
  /** Total number of reports submitted */
  totalReports: number;
  /** Reports currently in progress */
  inProgressReports: number;
  /** Completed reports */
  completedReports: number;
  /** Open complaints requiring attention */
  openComplaints: number;
  /** Total waste collected in kilograms */
  totalWasteKg: number;
}

/** Trend data point for charts */
export interface TrendPoint {
  /** Date in ISO format or display format (dd/mm) */
  date: string;
  /** Number of reports created on this date */
  created: number;
  /** Number of reports completed on this date */
  completed: number;
}

/** Top performing enterprise */
export interface TopEnterprise {
  /** Enterprise ID */
  id: string;
  /** Enterprise name */
  name: string;
  /** Number of completed reports */
  completedReports: number;
  /** Optional avatar/logo URL */
  avatar?: string;
  /** Optional completion rate (0-100) */
  completionRate?: number;
  /** Optional enterprise status */
  status?: string;
  /** Optional assigned jobs count */
  totalAssignments?: number;
  /** Optional collectors count */
  collectorsCount?: number;
}

/** Complete overview response */
export interface OverviewResponse {
  /** KPI metrics */
  kpi: OverviewKPI;
  /** 7-day trend data */
  trend: TrendPoint[];
  /** Top 5 enterprises */
  topEnterprises: TopEnterprise[];
}

// ============================================================================
// Backend-Aligned Admin Dashboard Types
// ============================================================================

export interface BackendSuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AdminOverviewStats {
  reports: {
    total: number;
    today: number;
    thisMonth: number;
    growthPercent: number | null;
    completed: number;
    cancelled: number;
    pending: number;
    completionRate: number;
  };
  users: {
    total: number;
    active: number;
    banned: number;
    newThisMonth: number;
    growthPercent: number | null;
  };
  enterprises: {
    total: number;
    active: number;
  };
  collectors: {
    total: number;
    active: number;
  };
  complaints: {
    total: number;
    open: number;
  };
  loyalty: {
    totalGiftsRedeemed: number;
    totalPointsIssued: number;
  };
}

export interface AdminReportTrendPoint {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

export interface AdminReportStatusBreakdownItem {
  status: string;
  count: number;
  percentage: number;
}

export interface AdminReportStatusBreakdown {
  total: number;
  breakdown: AdminReportStatusBreakdownItem[];
}

export interface AdminWasteTypeStatsItem {
  wasteType: string;
  reportCount: number;
  totalWeightKg: number;
}

export interface AdminRevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  yearlyRevenue: number;
  yearlyTransactions: number;
  byMethod: Array<{
    method: string;
    totalAmount: number;
    count: number;
  }>;
  byPlan: Array<{
    planName: string;
    totalAmount: number;
    count: number;
  }>;
}

export interface AdminTopEnterpriseItem {
  id: number;
  name: string;
  status: string;
  totalAssignments: number;
  completedAssignments: number;
  collectorsCount: number;
  completionRate: number;
}

export interface AdminSystemConfig {
  id: number;
  citizenBasePoint: number;
  organicMultiplier: number;
  recyclableMultiplier: number;
  hazardousMultiplier: number;
  accuracyMatchMultiplier: number;
  accuracyModerateMultiplier: number;
  accuracyHeavyMultiplier: number;
  collectorMatchTrustScore: number;
  penaltyWeightMismatch: number;
  penaltyUnauthorizedFee: number;
  penaltyNoShow: number;
  penaltyDefault: number;
  citizenCompensation: number;
  updatedAt: string;
}

export type UpdateAdminSystemConfigPayload = Partial<
  Omit<AdminSystemConfig, "id" | "updatedAt">
>;

export interface AdminDashboardData {
  overview: AdminOverviewStats;
  reportTrends: AdminReportTrendPoint[];
  reportStatusBreakdown: AdminReportStatusBreakdown;
  wasteTypeStats: AdminWasteTypeStatsItem[];
  revenueStats: AdminRevenueStats;
  topEnterprises: AdminTopEnterpriseItem[];
  systemConfig: AdminSystemConfig | null;
}

// ============================================================================
// System Health Types
// ============================================================================

/** System service status */
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';

/** System service health info */
export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number; // percentage
  latencyMs: number;
  errorRate: number; // percentage
  lastIncident?: string; // ISO date
}

// ============================================================================
// Activity Log Types
// ============================================================================

/** Activity log entry */
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string; // ISO date
  ipAddress?: string;
}
