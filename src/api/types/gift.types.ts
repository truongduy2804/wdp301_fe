// filepath: src/api/types/gift.types.ts

import type { ApiResponse } from './common.types';

/**
 * Gift management and loyalty program types
 */

// ============================================================================
// Gift Types
// ============================================================================

/** Gift item in the system */
export interface Gift {
  /** Unique gift ID */
  id: number;
  /** Gift name */
  name: string;
  /** Gift description */
  description?: string;
  /** Required loyalty points to redeem */
  requiredPoints: number;
  /** Available stock quantity */
  stock: number;
  /** Gift image URL */
  imageUrl?: string;
  /** Whether gift is active and available for redemption */
  isActive: boolean;
  /** Gift creation date */
  createdAt: string;
  /** Gift last update date */
  updatedAt: string;
}

/** DTO for creating a new gift */
export interface CreateGiftDto {
  /** Gift name */
  name: string;
  /** Gift description */
  description?: string;
  /** Required loyalty points to redeem */
  requiredPoints: number;
  /** Initial stock quantity */
  stock: number;
  /** Gift image file (for upload) */
  image?: File;
}

/** DTO for updating a gift */
export interface UpdateGiftDto {
  /** Gift name */
  name?: string;
  /** Gift description */
  description?: string;
  /** Required loyalty points */
  requiredPoints?: number;
  /** Stock quantity */
  stock?: number;
  /** Active status */
  isActive?: boolean;
  /** Gift image file (for upload) */
  image?: File;
}

// ============================================================================
// Point Transaction Types (for Redemption)
// ============================================================================

/** Point transaction type */
export type TransactionType = 
  | 'EARN_REPORT_CREATED'
  | 'EARN_REPORT_COMPLETED'
  | 'EARN_EVALUATION_BONUS'
  | 'REDEEM_GIFT';

/** User info in redemption */
export interface RedemptionUser {
  /** User full name */
  fullName: string;
  /** User email */
  email: string;
  /** User phone */
  phone?: string;
  /** User avatar URL */
  avatar?: string;
}

/** Gift info in redemption */
export interface RedemptionGift {
  /** Gift ID */
  id: number;
  /** Gift name */
  name: string;
  /** Gift image URL */
  imageUrl?: string;
  /** Points required */
  requiredPoints: number;
}

/** Point transaction/Redemption record */
export interface Redemption {
  /** Transaction ID */
  id: number;
  /** User ID who redeemed */
  userId: number;
  /** User information */
  user: RedemptionUser;
  /** Gift ID (null if not a redemption) */
  giftId: number;
  /** Gift information */
  gift: RedemptionGift;
  /** Transaction type */
  type: TransactionType;
  /** Points amount (negative for redemption) */
  amount: number;
  /** Description/reason */
  description?: string;
  /** Transaction timestamp */
  createdAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/** Gifts list response */
export type GiftsResponse = ApiResponse<Gift[]>;

/** Single gift response */
export type GiftResponse = ApiResponse<Gift>;

/** Redemptions list response */
export type RedemptionsResponse = ApiResponse<Redemption[]>;
