// filepath: src/api/config.ts

/**
 * API configuration and feature flags
 */

// ============================================================================
// Environment Variables
// ============================================================================

/** Base API URL from environment */
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 
  'http://localhost:8000';

/** Full API endpoint with version */
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

// ============================================================================
// Feature Flags
// ============================================================================

/** Use mock API instead of real backend (for development) */
export const USE_MOCK_API = import.meta.env.DEV ?? true;

/** Enable debug logs */
export const DEBUG_MODE = import.meta.env.DEV ?? false;

/** Enable API request logging */
export const LOG_API_REQUESTS = DEBUG_MODE;

// ============================================================================
// API Configuration
// ============================================================================

/** Default pagination settings */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** API timeout in milliseconds */
export const API_TIMEOUT = 30000; // 30 seconds

/** Mock API delay in milliseconds (to simulate network latency) */
export const MOCK_API_DELAY = 800;

/** Simulated error rate for mock API (0-1, where 0.1 = 10% chance) */
export const MOCK_ERROR_RATE = 0.05; // 5% error rate

// ============================================================================
// Auth Configuration
// ============================================================================

/** Token storage keys */
export const AUTH_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

/** Token expiry buffer in seconds */
export const TOKEN_REFRESH_BUFFER = 300; // 5 minutes

// ============================================================================
// File Upload Configuration
// ============================================================================

/** Max file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed file types for upload */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get full API URL for an endpoint
 * @param path - API path (e.g., '/admin/overview')
 * @returns Full URL
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ENDPOINT}${cleanPath}`;
};

/**
 * Log API request (only in debug mode)
 */
export const logApiRequest = (method: string, url: string, data?: unknown): void => {
  if (LOG_API_REQUESTS) {
    console.log(`[API ${method}]`, url, data ? data : '');
  }
};

/**
 * Log API response (only in debug mode)
 */
export const logApiResponse = (url: string, response: unknown): void => {
  if (LOG_API_REQUESTS) {
    console.log('[API Response]', url, response);
  }
};
