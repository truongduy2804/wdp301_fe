import { readAccessToken } from "@/utils/authStorage";
import type {
  BackendSuccessResponse,
  AdminOverviewStats,
  AdminReportTrendPoint,
  AdminReportStatusBreakdown,
  AdminWasteTypeStatsItem,
  AdminRevenueStats,
  AdminTopEnterpriseItem,
  AdminSystemConfig,
  UpdateAdminSystemConfigPayload,
  AdminDashboardData,
} from "@/api/types/admin.types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_DASHBOARD_PATH = `${API_VERSION}/admin/dashboard`;

function buildApiUrl(path: string): string {
  if (BASE_URL) return `${BASE_URL}${path}`;
  return path;
}

function getAuthHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (text.trim().startsWith("<")) {
    throw new Error(
      `Response is not JSON (check API base URL/proxy). First 80 chars: ${text
        .slice(0, 80)
        .replace(/\s+/g, " ")}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response. First 120 chars: ${text.slice(0, 120)}`);
  }
}

async function getDashboardResource<T>(resource: string): Promise<T> {
  const url = buildApiUrl(`${ADMIN_DASHBOARD_PATH}/${resource}`);
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GET ${resource} failed: ${res.status} ${res.statusText} - ${errText}`);
  }

  const response = await safeJson<BackendSuccessResponse<T>>(res);
  return response.data;
}

async function patchDashboardResource<T>(resource: string, payload: unknown): Promise<T> {
  const url = buildApiUrl(`${ADMIN_DASHBOARD_PATH}/${resource}`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PATCH ${resource} failed: ${res.status} ${res.statusText} - ${errText}`);
  }

  const response = await safeJson<BackendSuccessResponse<T>>(res);
  return response.data;
}

export async function fetchAdminOverview(): Promise<AdminOverviewStats> {
  return getDashboardResource<AdminOverviewStats>("overview");
}

export async function fetchAdminReportTrends(days = 30): Promise<AdminReportTrendPoint[]> {
  return getDashboardResource<AdminReportTrendPoint[]>(`report-trends?days=${days}`);
}

export async function fetchAdminReportStatusBreakdown(): Promise<AdminReportStatusBreakdown> {
  return getDashboardResource<AdminReportStatusBreakdown>("report-status-breakdown");
}

export async function fetchAdminWasteTypeStats(): Promise<AdminWasteTypeStatsItem[]> {
  return getDashboardResource<AdminWasteTypeStatsItem[]>("waste-type-stats");
}

export async function fetchAdminRevenueStats(): Promise<AdminRevenueStats> {
  return getDashboardResource<AdminRevenueStats>("revenue-stats");
}

export async function fetchAdminTopEnterprises(limit = 8): Promise<AdminTopEnterpriseItem[]> {
  return getDashboardResource<AdminTopEnterpriseItem[]>(`top-enterprises?limit=${limit}`);
}

export async function fetchAdminSystemConfig(): Promise<AdminSystemConfig | null> {
  return getDashboardResource<AdminSystemConfig | null>("system-config");
}

export async function updateAdminSystemConfig(
  payload: UpdateAdminSystemConfigPayload,
): Promise<AdminSystemConfig> {
  return patchDashboardResource<AdminSystemConfig>("system-config", payload);
}

export async function fetchAdminDashboardData(trendsDays: number = 30): Promise<AdminDashboardData> {
  const [overview, reportTrends, reportStatusBreakdown, wasteTypeStats, revenueStats, topEnterprises, systemConfig] =
    await Promise.all([
      fetchAdminOverview(),
      fetchAdminReportTrends(trendsDays),
      fetchAdminReportStatusBreakdown(),
      fetchAdminWasteTypeStats(),
      fetchAdminRevenueStats(),
      fetchAdminTopEnterprises(8),
      fetchAdminSystemConfig(),
    ]);

  return {
    overview,
    reportTrends,
    reportStatusBreakdown,
    wasteTypeStats,
    revenueStats,
    topEnterprises,
    systemConfig,
  };
}
