import { readAccessToken } from "@/utils/authStorage";
import type {
  AdminPaymentDetail,
  AdminPaymentQuery,
  AdminPaymentsResponse,
  AdminRevenueStats,
  BackendEnvelope,
} from "@/api/types/adminPayment.types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_PAYMENTS_PATH = `${API_VERSION}/admin/payments`;
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
      `Response is not JSON. First 80 chars: ${text.slice(0, 80).replace(/\s+/g, " ")}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response. First 120 chars: ${text.slice(0, 120)}`);
  }
}

function toSearchParams(query: AdminPaymentQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.page) params.append("page", String(query.page));
  if (query.limit) params.append("limit", String(query.limit));
  if (query.status) params.append("status", query.status);
  if (query.method) params.append("method", query.method);
  if (query.planId) params.append("planId", String(query.planId));
  if (query.enterpriseId) params.append("enterpriseId", String(query.enterpriseId));
  if (query.search) params.append("search", query.search);
  if (query.createdFrom) params.append("createdFrom", query.createdFrom);
  if (query.createdTo) params.append("createdTo", query.createdTo);
  if (query.paidFrom) params.append("paidFrom", query.paidFrom);
  if (query.paidTo) params.append("paidTo", query.paidTo);

  return params;
}

export async function fetchAdminPayments(query: AdminPaymentQuery): Promise<AdminPaymentsResponse> {
  const params = toSearchParams(query);
  const queryText = params.toString();
  const url = buildApiUrl(
    queryText ? `${ADMIN_PAYMENTS_PATH}?${queryText}` : ADMIN_PAYMENTS_PATH,
  );

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to fetch payments: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<BackendEnvelope<AdminPaymentsResponse>>(res);
  return response.data;
}

export async function fetchAdminPaymentByReference(referenceCode: string): Promise<AdminPaymentDetail> {
  const encodedReference = encodeURIComponent(referenceCode);
  const url = buildApiUrl(`${ADMIN_PAYMENTS_PATH}/reference/${encodedReference}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to fetch payment detail: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<BackendEnvelope<AdminPaymentDetail>>(res);
  return response.data;
}

export async function fetchAdminRevenueStats(): Promise<AdminRevenueStats> {
  const url = buildApiUrl(`${ADMIN_DASHBOARD_PATH}/revenue-stats`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to fetch revenue stats: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<BackendEnvelope<AdminRevenueStats>>(res);
  return response.data;
}
