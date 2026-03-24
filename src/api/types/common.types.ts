// filepath: src/api/types/common.types.ts

/**
 * Common types shared across the application
 * These types are also shared with backend team
 */

// ============================================================================
// User & Account Types
// ============================================================================

/** User roles in the system */
export type UserRole = 'ADMIN' | 'ENTERPRISE' | 'COLLECTOR' | 'CITIZEN';

/** Account status */
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

/** Common user interface */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// ============================================================================
// Pagination Types
// ============================================================================

/** Pagination parameters for list queries */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Pagination metadata in responses */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

/** Common filter parameters */
export interface FilterParams {
  search?: string;
  role?: UserRole;
  status?: AccountStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Date range filter */
export interface DateRangeFilter {
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

// ============================================================================
// API Response Types
// ============================================================================

/** Standard API success response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Common Status Types
// ============================================================================

/** Report/Request status */
export type ReportStatus = 
  | 'PENDING'
  | 'APPROVED' 
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/** Complaint status */
export type ComplaintStatus = 
  | 'NEW'
  | 'PROCESSING'
  | 'WAITING'
  | 'RESOLVED'
  | 'CLOSED';

/** Priority level */
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ============================================================================
// Common Data Types
// ============================================================================

/** Address information */
export interface Address {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/** File/Image upload */
export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/** Waste type */
export type WasteType = 'PLASTIC' | 'PAPER' | 'METAL' | 'ORGANIC' | 'ELECTRONIC' | 'OTHER';

/** Zone/District */
export interface Zone {
  id: string;
  name: string;
  district?: string;
  province?: string;
}
