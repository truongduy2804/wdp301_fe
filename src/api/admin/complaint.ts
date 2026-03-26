import { readAccessToken } from "@/utils/authStorage";
import type {
  AdminComplaint,
  AdminComplaintsQuery,
  AdminComplaintsResponse,
  RespondComplaintDto,
  RespondComplaintResult,
} from "@/api/types/complaint.types";
import type { ApiResponse } from "@/api/types/common.types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_COMPLAINTS_PATH = `${API_VERSION}/admin/complaints`;

function buildApiUrl(path: string): string {
  if (BASE_URL) return `${BASE_URL}${path}`;
  return path;
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
    throw new Error(
      `Invalid JSON response. First 120 chars: ${text.slice(0, 120)}`,
    );
  }
}

function getAuthHeaders(contentType?: string): HeadersInit {
  const token = readAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

function buildQueryString(query?: AdminComplaintsQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function fetchAdminComplaints(
  query?: AdminComplaintsQuery,
): Promise<{ data: AdminComplaint[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const url = buildApiUrl(`${ADMIN_COMPLAINTS_PATH}${buildQueryString(query)}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchAdminComplaints failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<AdminComplaintsResponse>(res);
  return response.data;
}

export async function respondAdminComplaint(
  complaintId: number,
  dto: RespondComplaintDto,
): Promise<RespondComplaintResult> {
  const url = buildApiUrl(`${ADMIN_COMPLAINTS_PATH}/${complaintId}/respond`);

  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders("application/json"),
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `respondAdminComplaint failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<ApiResponse<any>>(res);
  const data = response.data || {};

  return {
    id: Number(data.id),
    status: data.status,
    adminResponse: data.adminResponse ?? null,
    resolvedAt: data.resolvedAt ?? null,
  };
}
