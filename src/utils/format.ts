// filepath: src/utils/format.ts

/**
 * Utility functions for formatting data
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 * @param date - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Format date with time (dd/mm/yyyy HH:mm)
 * @param date - ISO date string or Date object
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Format date with full time (dd/mm/yyyy HH:mm:ss)
 * @param date - ISO date string or Date object
 * @returns Formatted datetime string with seconds
 */
export const formatDateTimeFull = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
};

/**
 * Format date as time only (HH:mm)
 * @param date - ISO date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * Format date for display with context
 * - Today: "Today at HH:mm"
 * - This week: "Monday at HH:mm"
 * - Older: "dd/mm/yyyy HH:mm"
 */
export const formatSmartDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const d = dayjs(date);
  const now = dayjs();
  
  if (d.isSame(now, 'day')) {
    return `Today at ${d.format('HH:mm')}`;
  }
  
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return `Yesterday at ${d.format('HH:mm')}`;
  }
  
  if (d.isAfter(now.subtract(7, 'day'))) {
    return d.format('dddd [at] HH:mm');
  }
  
  return d.format('DD/MM/YYYY HH:mm');
};

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | null | undefined,
  decimals: number = 0
): string => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format number as percentage
 * @param value - Number to format (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param isDecimal - Whether value is already decimal (default: false)
 * @returns Formatted percentage string
 */
export const formatPercent = (
  value: number | null | undefined,
  decimals: number = 1,
  isDecimal: boolean = false
): string => {
  if (value === null || value === undefined) return '-';
  
  const percentage = isDecimal ? value * 100 : value;
  return `${formatNumber(percentage, decimals)}%`;
};

/**
 * Format number as currency (VND)
 * @param value - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return '-';
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format weight in kg with appropriate unit
 * @param kg - Weight in kilograms
 * @returns Formatted weight string
 */
export const formatWeight = (kg: number | null | undefined): string => {
  if (kg === null || kg === undefined) return '-';
  
  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, 2)} tấn`;
  }
  
  return `${formatNumber(kg, 2)} kg`;
};

/**
 * Compact number format for large numbers
 * @param value - Number to format
 * @returns Compact format (e.g., 1.5K, 2.3M)
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
  });
  
  return formatter.format(value);
};

// ============================================================================
// String Formatting
// ============================================================================

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 50
): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return '-';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format phone number (Vietnam format)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: 0XX XXX XXXX or 0XXX XXX XXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

/**
 * Format address to single line
 * @param address - Address object
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
} | null | undefined): string => {
  if (!address) return '-';
  
  const parts = [
    address.street,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : '-';
};

// ============================================================================
// Status Badge Helpers
// ============================================================================

/**
 * Get color class for status badges
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  if (['active', 'approved', 'completed', 'resolved'].includes(statusLower)) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  
  if (['pending', 'waiting', 'in_progress', 'processing'].includes(statusLower)) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  
  if (['rejected', 'cancelled', 'suspended', 'closed'].includes(statusLower)) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  
  if (['new'].includes(statusLower)) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get color class for priority badges
 */
export const getPriorityColor = (priority: string): string => {
  const priorityLower = priority.toLowerCase();
  
  if (['urgent', 'high'].includes(priorityLower)) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  
  if (['medium'].includes(priorityLower)) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200';
};
