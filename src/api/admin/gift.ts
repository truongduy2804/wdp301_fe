// filepath: src/api/admin/gift.ts

/**
 * Gift Management API Service
 * Handles all gift-related API calls for admin
 */

import { readAccessToken } from "@/utils/authStorage";
import type {
  Gift,
  CreateGiftDto,
  UpdateGiftDto,
  Redemption,
  GiftsResponse,
  GiftResponse,
  RedemptionsResponse,
} from "@/api/types/gift.types";

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_VERSION = "/api/v1";
const ADMIN_GIFTS_PATH = `${API_VERSION}/admin/gifts`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build full API URL
 * - If VITE_API_BASE_URL is set, use it as base
 * - Otherwise use relative path (requires Vite proxy)
 */
function buildApiUrl(path: string): string {
  if (BASE_URL) return `${BASE_URL}${path}`;
  return path;
}

/**
 * Safe JSON parser - avoids HTML error responses
 */
async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  // Check if response is HTML instead of JSON
  if (text.trim().startsWith("<")) {
    throw new Error(
      `Response is not JSON (check API base URL/proxy). First 80 chars: ${text
        .slice(0, 80)
        .replace(/\s+/g, " ")}`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Invalid JSON response. First 120 chars: ${text.slice(0, 120)}`
    );
  }
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = readAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all gifts
 * GET /api/v1/admin/gifts
 */
export async function fetchGifts(): Promise<Gift[]> {
  const url = buildApiUrl(ADMIN_GIFTS_PATH);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchGifts failed: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const response = await safeJson<GiftsResponse>(res);

  // Extract data from response
  return response.data || [];
}

/**
 * Create a new gift
 * POST /api/v1/admin/gifts
 */
export async function createGift(dto: CreateGiftDto): Promise<Gift> {
  const url = buildApiUrl(ADMIN_GIFTS_PATH);

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append("name", dto.name);
  formData.append("requiredPoints", dto.requiredPoints.toString());
  formData.append("stock", dto.stock.toString());
  
  if (dto.description) {
    formData.append("description", dto.description);
  }
  
  if (dto.image) {
    formData.append("image", dto.image);
  }

  const token = readAccessToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type - browser will set it with boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `createGift failed: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const response = await safeJson<GiftResponse>(res);
  return response.data;
}

/**
 * Update a gift
 * PATCH /api/v1/admin/gifts/:id
 */
export async function updateGift(
  giftId: number,
  dto: UpdateGiftDto
): Promise<Gift> {
  const url = buildApiUrl(`${ADMIN_GIFTS_PATH}/${giftId}`);

  // Create FormData for multipart upload
  const formData = new FormData();
  
  if (dto.name !== undefined) {
    formData.append("name", dto.name);
  }
  if (dto.description !== undefined) {
    formData.append("description", dto.description);
  }
  if (dto.requiredPoints !== undefined) {
    formData.append("requiredPoints", dto.requiredPoints.toString());
  }
  if (dto.stock !== undefined) {
    formData.append("stock", dto.stock.toString());
  }
  if (dto.isActive !== undefined) {
    formData.append("isActive", dto.isActive.toString());
  }
  if (dto.image) {
    formData.append("image", dto.image);
  }

  const token = readAccessToken();
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `updateGift failed: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const response = await safeJson<GiftResponse>(res);
  return response.data;
}

/**
 * Toggle gift active status
 * PATCH /api/v1/admin/gifts/:id/active
 */
export async function toggleGiftActive(giftId: number): Promise<Gift> {
  const url = buildApiUrl(`${ADMIN_GIFTS_PATH}/${giftId}/active`);

  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `toggleGiftActive failed: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const response = await safeJson<GiftResponse>(res);
  return response.data;
}

/**
 * Get all redemption history
 * GET /api/v1/admin/gifts/transactions
 */
export async function fetchRedemptions(): Promise<Redemption[]> {
  const url = buildApiUrl(`${ADMIN_GIFTS_PATH}/transactions`);

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `fetchRedemptions failed: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const response = await safeJson<RedemptionsResponse>(res);
  return response.data || [];
}
