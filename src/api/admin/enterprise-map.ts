// src/api/admin/enterprise-map.ts
import { readAccessToken } from "@/utils/authStorage";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, ""); // bỏ "/" cuối nếu có

export interface EnterpriseMapLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  roleId: number;
  status: "ACTIVE" | "PENDING" | "BANNED" | "EXPIRED" | "OFFLINE";
  address: string;
}

export interface WasteTypeObj {
  wasteType: string;
}

export interface ServiceAreaObj {
  provinceCode: string;
  districtCode: string;
  wardCode: string;
}

export interface CollectorObj {
  id: number;
  fullName: string;
  phone: string;
  avatar?: string;
}

export interface WasteItem {
  wasteType: string;
}

export interface EnterpriseDetailMap extends EnterpriseMapLocation {
  email: string;
  phone: string;
  contactPhone?: string;
  contactEmail?: string;
  representative: string;
  businessLicense: string;
  wasteTypes?: (string | WasteTypeObj)[];
  wasteItems?: WasteItem[];
  serviceAreas: (string | ServiceAreaObj)[];
  registeredDate: string;
  createdAt?: string;
  capacityKg?: number;
  collectors?: CollectorObj[];
}

/**
 * Helper: build URL
 * - Nếu có VITE_API_URL => gọi thẳng backend
 * - Nếu không có => dùng relative path (cần Vite proxy)
 */
function buildApiUrl(path: string) {
  if (BASE_URL) return `${BASE_URL}${path}`;
  return path; // relative: "/api/v1/..."
}

/** Helper: parse JSON an toàn, tránh lỗi HTML <!doctype ... */
async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  // Nếu backend trả HTML (thường do gọi nhầm dev server 5173)
  if (text.trim().startsWith("<")) {
    throw new Error(
      `Response is not JSON (maybe wrong API base URL/proxy). First 80 chars: ${text
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

/**
 * Lấy danh sách doanh nghiệp trên bản đồ
 * GET /api/v1/admin/enterprises/map?status=...
 */
export async function fetchEnterprisesMap(
  status?: string,
): Promise<EnterpriseMapLocation[]> {
  const token = readAccessToken();
  const url = new URL(
    buildApiUrl("/api/v1/admin/enterprises/map"),
    window.location.origin,
  );

  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchEnterprisesMap failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const data = await safeJson<any>(res);

  // Extract linh hoạt theo nhiều format API
  if (Array.isArray(data)) return data;

  const d = data?.data;
  if (Array.isArray(d?.markers)) return d.markers;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.result)) return d.result;
  if (Array.isArray(d?.items)) return d.items;

  return [];
}

/**
 * Lấy chi tiết doanh nghiệp trên bản đồ
 * GET /api/v1/admin/enterprises/{id}/map
 */
export async function fetchEnterpriseDetailMap(
  id: number,
): Promise<EnterpriseDetailMap> {
  const token = readAccessToken();
  const url = buildApiUrl(`/api/v1/admin/enterprises/${id}/map`);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchEnterpriseDetailMap failed: ${res.status} ${res.statusText} - ${errText}`,
    );
  }

  const data = await safeJson<any>(res);

  // Format: data: { enterprise: {...}, collectors: [...] }
  if (data?.data?.enterprise) {
    return {
      ...data.data.enterprise,
      collectors: data.data.collectors || [],
    };
  }

  return data?.data || data;
}
