import { readAccessToken } from "@/utils/authStorage";

export interface Enterprise {
  id: number;
  name: string;
  status: "PENDING" | "ACTIVE" | "OFFLINE" | "BANNED" | "EXPIRED";
  address?: string;
  capacityKg?: number;
  owner?: {
    fullName: string;
    email: string;
    phone: string;
  };
  collectorsCount?: number;
  zonesCount?: number;
  totalAssignments?: number;
  activeSubscription?: boolean;
  createdAt: string;
}

export interface EnterprisesResponse {
  data: Enterprise[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface EnterprisesQuery {
  page?: number;
  limit?: number;
  status?: "PENDING" | "ACTIVE" | "OFFLINE" | "BANNED" | "EXPIRED";
  search?: string;
}

export type EnterpriseStatus = "PENDING" | "ACTIVE" | "OFFLINE" | "BANNED" | "EXPIRED";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_PATH = `${API_VERSION}/admin/dashboard`;

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
      `Response is not JSON. First 80 chars: ${text
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

export async function fetchEnterprises(query: EnterprisesQuery): Promise<EnterprisesResponse> {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.status) params.append("status", query.status);
  if (query.search) params.append("search", query.search);

  const url = buildApiUrl(`${ADMIN_PATH}/enterprises?${params.toString()}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch enterprises: ${res.status} ${res.statusText} - ${errText}`);
  }

  const response = await safeJson<{ data: EnterprisesResponse }>(res);
  return response.data;
}

export async function updateEnterpriseStatus(
  enterpriseId: number,
  status: EnterpriseStatus
): Promise<any> {
  const url = buildApiUrl(`${ADMIN_PATH}/enterprises/${enterpriseId}/status`);

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update enterprise status: ${res.status} ${res.statusText} - ${errText}`);
  }

  const response = await safeJson<any>(res);
  return response;
}
