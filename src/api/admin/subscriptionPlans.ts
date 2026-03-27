import { readAccessToken } from "@/utils/authStorage";
import type {
  BackendEnvelope,
  CreateSubscriptionPlanDto,
  SubscriptionPlan,
  UpdateSubscriptionPlanDto,
} from "@/api/types/subscriptionPlan.types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_PATH = `${API_VERSION}/admin/subscription-plans`;
const ADMIN_DASHBOARD_FALLBACK_PATH = `${API_VERSION}/admin/dashboard/subscription-plans`;

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

async function readBackendErrorMessage(res: Response): Promise<string> {
  const text = await res.text();

  if (!text) return "Unknown error";

  if (text.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
      if (typeof parsed.message === "string") return parsed.message;
      if (Array.isArray(parsed.message)) return parsed.message.map(String).join(", ");
      if (typeof parsed.error === "string") return parsed.error;
    } catch {
      // ignore and fallback to raw text
    }
  }

  return text;
}

async function requestWithFallback(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  paths: string[],
  body?: unknown,
): Promise<Response> {
  let lastError = "";

  for (const path of paths) {
    const res = await fetch(buildApiUrl(path), {
      method,
      headers: {
        ...getAuthHeaders(),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (res.ok) return res;

    lastError = await readBackendErrorMessage(res);
    if (res.status !== 404) {
      throw new Error(`${method} ${path} failed: ${res.status} ${res.statusText} - ${lastError}`);
    }
  }

  throw new Error(`${method} failed: 404 Not Found - ${lastError}`);
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await requestWithFallback("GET", [ADMIN_PATH, ADMIN_DASHBOARD_FALLBACK_PATH]);

  const response = await safeJson<BackendEnvelope<SubscriptionPlan[]>>(res);
  return response.data || [];
}

export async function fetchSubscriptionPlanById(id: number): Promise<SubscriptionPlan> {
  const res = await requestWithFallback("GET", [
    `${ADMIN_PATH}/${id}`,
    `${ADMIN_DASHBOARD_FALLBACK_PATH}/${id}`,
  ]);

  const response = await safeJson<BackendEnvelope<SubscriptionPlan>>(res);
  return response.data;
}

export async function createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
  const payload: CreateSubscriptionPlanDto = {
    name: dto.name,
    price: dto.price,
    durationMonths: dto.durationMonths,
    ...(dto.description ? { description: dto.description } : {}),
    ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
  };

  const res = await requestWithFallback("POST", [ADMIN_PATH, ADMIN_DASHBOARD_FALLBACK_PATH], payload);

  const response = await safeJson<BackendEnvelope<SubscriptionPlan>>(res);
  return response.data;
}

export async function updateSubscriptionPlan(
  id: number,
  dto: UpdateSubscriptionPlanDto,
): Promise<SubscriptionPlan> {
  const res = await requestWithFallback(
    "PATCH",
    [`${ADMIN_PATH}/${id}`, `${ADMIN_DASHBOARD_FALLBACK_PATH}/${id}`],
    dto,
  );

  const response = await safeJson<BackendEnvelope<SubscriptionPlan>>(res);
  return response.data;
}

export async function removeSubscriptionPlan(id: number): Promise<void> {
  await requestWithFallback("DELETE", [
    `${ADMIN_PATH}/${id}`,
    `${ADMIN_DASHBOARD_FALLBACK_PATH}/${id}`,
  ]);
}
