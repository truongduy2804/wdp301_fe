// filepath: src/api/mock/admin.mock.ts

/**
 * Mock API for admin dashboard
 * Simulates backend API responses with realistic data
 */

import { MOCK_API_DELAY, MOCK_ERROR_RATE } from '../config';
import type { OverviewResponse, TrendPoint, TopEnterprise } from '../types/admin.types';

// ============================================================================
// Utility Functions
// ============================================================================

/** Simulate network delay */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Simulate random API error */
const shouldSimulateError = () => Math.random() < MOCK_ERROR_RATE;

/** Generate date string for trend (dd/mm format) */
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

// ============================================================================
// Mock Data
// ============================================================================

/** Generate 7-day trend data */
const generateTrendData = (): TrendPoint[] => {
  const trend: TrendPoint[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const baseCreated = 45 + Math.floor(Math.random() * 25);
    const completed = Math.floor(baseCreated * (0.75 + Math.random() * 0.15));
    
    trend.push({
      date: getDateString(i),
      created: baseCreated,
      completed: completed,
    });
  }
  
  return trend;
};

/** Vietnamese enterprise names */
const ENTERPRISE_NAMES = [
  'Công ty TNHH Tái Chế Xanh Việt Nam',
  'Doanh nghiệp Môi Trường Sạch',
  'Công ty CP Tái Chế Thông Minh',
  'Công ty TNHH Thu Gom Rác Thải',
  'Doanh nghiệp Xử Lý Chất Thải',
  'Công ty CP Môi Trường Xanh',
  'Công ty TNHH Tái Sinh',
  'Công ty CP Eco Green',
  'Doanh nghiệp Recycle Pro',
  'Công ty TNHH Xanh Sạch Đẹp',
];

/** Generate top enterprises list */
const generateTopEnterprises = (): TopEnterprise[] => {
  const enterprises: TopEnterprise[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < 5; i++) {
    let name: string;
    do {
      name = ENTERPRISE_NAMES[Math.floor(Math.random() * ENTERPRISE_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    
    const completedReports = 150 - (i * 20) + Math.floor(Math.random() * 15);
    
    enterprises.push({
      id: `ENT-${String(i + 1).padStart(3, '0')}`,
      name,
      completedReports,
      completionRate: 85 + Math.floor(Math.random() * 12),
      avatar: undefined, // Can add avatar URLs if needed
    });
  }
  
  // Sort by completed reports descending
  return enterprises.sort((a, b) => b.completedReports - a.completedReports);
};

/** Mock overview data */
const MOCK_OVERVIEW_DATA: OverviewResponse = {
  kpi: {
    totalUsers: 1248,
    totalReports: 3542,
    inProgressReports: 89,
    completedReports: 3124,
    openComplaints: 12,
    totalWasteKg: 48750,
  },
  trend: generateTrendData(),
  topEnterprises: generateTopEnterprises(),
};

// ============================================================================
// Mock API Functions
// ============================================================================

/**
 * Get admin overview dashboard data
 * @returns Promise resolving to overview data
 * @throws Error if simulated error occurs
 */
export const mockGetOverview = async (): Promise<OverviewResponse> => {
  // Simulate network delay
  await delay(MOCK_API_DELAY);
  
  // Simulate random error
  if (shouldSimulateError()) {
    throw new Error('Failed to fetch overview data. Please try again.');
  }
  
  // Return mock data with some randomization for realism
  return {
    kpi: {
      totalUsers: MOCK_OVERVIEW_DATA.kpi.totalUsers + Math.floor(Math.random() * 10),
      totalReports: MOCK_OVERVIEW_DATA.kpi.totalReports + Math.floor(Math.random() * 20),
      inProgressReports: MOCK_OVERVIEW_DATA.kpi.inProgressReports + Math.floor(Math.random() * 5),
      completedReports: MOCK_OVERVIEW_DATA.kpi.completedReports + Math.floor(Math.random() * 15),
      openComplaints: MOCK_OVERVIEW_DATA.kpi.openComplaints + Math.floor(Math.random() * 3),
      totalWasteKg: MOCK_OVERVIEW_DATA.kpi.totalWasteKg + Math.floor(Math.random() * 500),
    },
    trend: generateTrendData(), // Generate fresh trend data each time
    topEnterprises: generateTopEnterprises(), // Generate fresh enterprise list
  };
};

/**
 * Refresh overview data (same as get, but semantically different)
 * Used for manual refresh actions
 */
export const mockRefreshOverview = async (): Promise<OverviewResponse> => {
  return mockGetOverview();
};
