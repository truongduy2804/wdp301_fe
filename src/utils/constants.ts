// filepath: src/utils/constants.ts

/**
 * Application-wide constants
 */

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  ENTERPRISE: 'ENTERPRISE',
  COLLECTOR: 'COLLECTOR',
  CITIZEN: 'CITIZEN',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  ENTERPRISE: 'Doanh nghiệp',
  COLLECTOR: 'Nhân viên thu gom',
  CITIZEN: 'Người dân',
};

// ============================================================================
// Account Status
// ============================================================================

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const;

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  SUSPENDED: 'Tạm dừng',
  PENDING: 'Chờ xử lý',
};

// ============================================================================
// Report/Request Status
// ============================================================================

export const REPORT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// ============================================================================
// Complaint Status
// ============================================================================

export const COMPLAINT_STATUS = {
  NEW: 'NEW',
  PROCESSING: 'PROCESSING',
  WAITING: 'WAITING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  NEW: 'Mới',
  PROCESSING: 'Đang xử lý',
  WAITING: 'Chờ phản hồi',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
};

// ============================================================================
// Priority Levels
// ============================================================================

export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

// ============================================================================
// Waste Types
// ============================================================================

export const WASTE_TYPES = {
  PLASTIC: 'PLASTIC',
  PAPER: 'PAPER',
  METAL: 'METAL',
  ORGANIC: 'ORGANIC',
  ELECTRONIC: 'ELECTRONIC',
  OTHER: 'OTHER',
} as const;

export const WASTE_TYPE_LABELS: Record<string, string> = {
  PLASTIC: 'Nhựa',
  PAPER: 'Giấy',
  METAL: 'Kim loại',
  ORGANIC: 'Hữu cơ',
  ELECTRONIC: 'Điện tử',
  OTHER: 'Khác',
};

// ============================================================================
// Zones/Districts (Ho Chi Minh City)
// ============================================================================

export const HCMC_DISTRICTS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Quận Bình Thạnh',
  'Quận Gò Vấp',
  'Quận Phú Nhuận',
  'Quận Tân Bình',
  'Quận Tân Phú',
  'Quận Thủ Đức',
  'Huyện Bình Chánh',
  'Huyện Cần Giờ',
  'Huyện Củ Chi',
  'Huyện Hóc Môn',
  'Huyện Nhà Bè',
] as const;

// ============================================================================
// Pagination
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================================================
// Table & List Settings
// ============================================================================

export const MAX_TABLE_ROWS = 100;
export const DEFAULT_SORT_ORDER = 'desc';

// ============================================================================
// File Upload
// ============================================================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// ============================================================================
// Chart Colors
// ============================================================================

export const CHART_COLORS = {
  primary: '#3b82f6', // blue-500
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
  purple: '#8b5cf6', // violet-500
  pink: '#ec4899', // pink-500
  gray: '#6b7280', // gray-500
} as const;

export const CHART_COLOR_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6b7280', // gray
];

// ============================================================================
// Date Ranges (for filters)
// ============================================================================

export const DATE_RANGE_PRESETS = [
  { label: 'Hôm nay', value: 'today' },
  { label: '7 ngày qua', value: '7days' },
  { label: '30 ngày qua', value: '30days' },
  { label: '90 ngày qua', value: '90days' },
  { label: 'Tháng này', value: 'thisMonth' },
  { label: 'Tháng trước', value: 'lastMonth' },
  { label: 'Tùy chỉnh', value: 'custom' },
] as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(0|\+84)[0-9]{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
} as const;

// ============================================================================
// API Request Timeouts (ms)
// ============================================================================

export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 60000, // 1 minute
  LONG_RUNNING: 120000, // 2 minutes
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  TABLE_PREFERENCES: 'table_preferences',
} as const;

// ============================================================================
// Routes (Admin)
// ============================================================================

export const ADMIN_ROUTES = {
  OVERVIEW: '/admin',
  VIOLATIONS: '/admin/violations',
  ENTERPRISES: '/admin/enterprises',
  COMPLAINTS: '/admin/complaints',
  STATISTICS: '/admin/statistics',
  SYSTEM_MONITOR: '/admin/monitor',
  ENTERPRISE_MAP: '/admin/enterprise-map',
} as const;

// ============================================================================
// Toast/Notification Duration (ms)
// ============================================================================

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;
