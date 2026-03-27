export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export type DashboardDateRange = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
};

export type DashboardSummary = {
  totalWeight: number;
  totalCompletedReports: number;
  activeCollectors: number;
  todayTasks: {
    total: number;
    pending: number;
    collecting: number;
    completed: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
};

export type DashboardRankingSortBy = "weight" | "tasks" | "trust";
export type DashboardOrder = "asc" | "desc";

export type DashboardRankingItem = {
  id: number;
  fullName: string;
  avatar: string | null;
  employeeCode: string;
  trustScore: number;
  completedTasks: number;
  totalWeight: number;
};

export type DashboardStatsInterval = "day" | "week" | "month";

export type DashboardStatsItem = {
  label: string;
  ORGANIC: number;
  RECYCLABLE: number;
  HAZARDOUS: number;
};
