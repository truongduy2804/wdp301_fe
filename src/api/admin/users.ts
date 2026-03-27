import { readAccessToken } from "@/utils/authStorage";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "ACTIVE" | "BANNED" | "DELETED";
  balance: number;
  role: string;
  reportCount: number;
  complaintCount: number;
  createdAt: string;
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  role?: "CITIZEN" | "COLLECTOR" | "ENTERPRISE" | "ADMIN";
  status?: "ACTIVE" | "BANNED" | "DELETED";
  search?: string;
}

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

export async function fetchUsers(query: UsersQuery): Promise<UsersResponse> {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.role) params.append("role", query.role);
  if (query.status) params.append("status", query.status);
  if (query.search) params.append("search", query.search);

  const url = buildApiUrl(`${ADMIN_PATH}/users?${params.toString()}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errText}`);
  }

  const response = await safeJson<{ data: UsersResponse }>(res);
  return response.data;
}

export async function unbanUser(userId: number): Promise<any> {
  const candidates = [
    `${ADMIN_PATH}/users/${userId}/unban`,
    `${API_VERSION}/admin/users/${userId}/unban`,
  ];

  let lastError = "";

  for (const path of candidates) {
    const res = await fetch(buildApiUrl(path), {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      return safeJson<any>(res);
    }

    lastError = await res.text();
    if (res.status !== 404) {
      throw new Error(`Failed to unban user: ${res.status} ${res.statusText} - ${lastError}`);
    }
  }

  throw new Error(`Failed to unban user: 404 Not Found - ${lastError}`);
}

export async function banUser(userId: number): Promise<any> {
  // Keep fallback compatibility because some backend versions expose ban route in admin/violations.
  const candidates: Array<{ path: string; method: "PATCH" | "GET" }> = [
    { path: `${API_VERSION}/admin/users/${userId}/ban`, method: "PATCH" },
    { path: `${ADMIN_PATH}/users/${userId}/ban`, method: "PATCH" },
    { path: `${API_VERSION}/admin/violations/ban/${userId}`, method: "GET" },
  ];

  let lastError = "";

  for (const candidate of candidates) {
    const res = await fetch(buildApiUrl(candidate.path), {
      method: candidate.method,
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      return safeJson<any>(res);
    }

    lastError = await res.text();
    if (res.status !== 404) {
      throw new Error(`Failed to ban user: ${res.status} ${res.statusText} - ${lastError}`);
    }
  }

  throw new Error(`Failed to ban user: 404 Not Found - ${lastError}`);
}
