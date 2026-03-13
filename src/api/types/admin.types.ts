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
