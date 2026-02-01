// src/api/admin/enterprise-map.ts

// Since the project seems to use raw fetch or mock APIs, 
// I'll implement these using a flexible fetch wrapper or raw fetch.
// We'll use the baseURL if provided, otherwise assume relative or absolute URLs.

const BASE_URL = import.meta.env.VITE_API_URL || "";

export interface EnterpriseMapLocation {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    roleId: number; // Added to distinguish project enterprises (roleId 2)
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
 * Lấy danh sách doanh nghiệp trên bản đồ
 * @param status Lọc theo trạng thái
 */
export async function fetchEnterprisesMap(status?: string): Promise<EnterpriseMapLocation[]> {
    // Clean URL construction to avoid double slashes
    const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = BASE_URL.includes("/api/v1") ? "/admin/enterprises/map" : "/api/v1/admin/enterprises/map";
    const url = new URL(`${cleanBase}${cleanPath}`, window.location.origin);

    if (status) {
        url.searchParams.append("status", status);
    }

    const token = localStorage.getItem("econet_access_token") || sessionStorage.getItem("econet_access_token");
    console.log(`DEBUG: Fetching enterprises from: ${url.toString()} with token: ${token ? "exists" : "MISSING"}`);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token || ""}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`DEBUG: API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch enterprises map: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();
    console.log("DEBUG: Raw Map Response:", res);

    // Robust extraction: direct array, data.markers, data: [], or data: { result: [] }
    let markers = [];
    if (Array.isArray(res)) {
        markers = res;
    } else if (res && res.data) {
        if (Array.isArray(res.data.markers)) {
            markers = res.data.markers;
        } else if (Array.isArray(res.data)) {
            markers = res.data;
        } else if (res.data.result && Array.isArray(res.data.result)) {
            markers = res.data.result;
        } else if (res.data.items && Array.isArray(res.data.items)) {
            markers = res.data.items;
        }
    }

    console.log(`DEBUG: API Success, received ${markers.length} enterprises.`);
    return markers;
}

/**
 * Lấy chi tiết doanh nghiệp trên bản đồ
 * @param id ID của doanh nghiệp
 */
export async function fetchEnterpriseDetailMap(id: number): Promise<EnterpriseDetailMap> {
    const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = BASE_URL.includes("/api/v1") ? `/admin/enterprises/${id}/map` : `/api/v1/admin/enterprises/${id}/map`;

    const response = await fetch(`${cleanBase}${cleanPath}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("econet_access_token") || ""}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch enterprise detail: ${response.statusText}`);
    }

    const res = await response.json();
    console.log("DEBUG: Raw Enterprise Detail:", res);

    // Based on raw response: data: { enterprise: {...}, collectors: [...] }
    if (res.data && res.data.enterprise) {
        return {
            ...res.data.enterprise,
            collectors: res.data.collectors || []
        };
    }

    return res.data || res;
}
