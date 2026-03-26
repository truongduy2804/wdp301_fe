import { readAccessToken } from "@/utils/authStorage";
import type {
  BanViolationUserResponse,
  FakeReportViolationDetail,
  FakeReportViolationDetailsResponse,
  FakeReportViolatorsPayload,
  FakeReportViolatorsQuery,
  FakeReportViolatorsResponse,
  UnbanViolationUserResponse,
} from "@/api/types/violation.types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_VIOLATIONS_PATH = `${API_VERSION}/admin/violations`;

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

function getAuthHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

function buildQueryString(query?: FakeReportViolatorsQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function fetchFakeReportViolators(
  query?: FakeReportViolatorsQuery,
): Promise<FakeReportViolatorsPayload> {
  const url = buildApiUrl(`${ADMIN_VIOLATIONS_PATH}/fake-reports${buildQueryString(query)}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchFakeReportViolators failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<FakeReportViolatorsResponse>(res);
  return response.data;
}

export async function fetchFakeReportViolationDetails(
  userId: number | string,
): Promise<FakeReportViolationDetail[]> {
  const url = buildApiUrl(`${ADMIN_VIOLATIONS_PATH}/fake-reports/${userId}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchFakeReportViolationDetails failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<FakeReportViolationDetailsResponse>(res);
  return response.data;
}

export async function banViolationUser(
  userId: number | string,
): Promise<string | undefined> {
  const url = buildApiUrl(`${ADMIN_VIOLATIONS_PATH}/ban/${userId}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `banViolationUser failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<BanViolationUserResponse>(res);
  return response.message;
}

export async function unbanViolationUser(
  userId: number | string,
): Promise<string | undefined> {
  const url = buildApiUrl(`${ADMIN_VIOLATIONS_PATH}/unban/${userId}`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `unbanViolationUser failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const response = await safeJson<UnbanViolationUserResponse>(res);
  return response.message;
}
