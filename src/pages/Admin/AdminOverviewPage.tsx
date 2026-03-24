// filepath: src/pages/admin/AdminOverviewPage.tsx

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageLoader, ErrorMessage } from '@/components/Admin/shared';
import { KPIGrid } from '@/components/Admin/Overview/KPIGrid';
import { AlertBox } from '@/components/Admin/Overview/AlertBox';
import { ReportTrendChart } from '@/components/Admin/Overview/ReportTrendChart';
import { TopEnterpriseTable } from '@/components/Admin/Overview/TopEnterpriseTable';
import { mockGetOverview } from '@/api/mock/admin.mock';
import type { OverviewResponse } from '@/api/types/admin.types';

// ============================================================================
// Component
// ============================================================================

/**
 * Admin Overview Dashboard Page
 * Main dashboard showing KPIs, alerts, trends, and top performers
 * Fetches data from mock API and handles loading/error states
 */
export default function AdminOverviewPage() {
  // State management
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load overview data from API
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockGetOverview();
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Không thể tải dữ liệu. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await mockGetOverview();
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Không thể làm mới dữ liệu. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Failed to refresh overview data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading) {
    return <PageLoader text="Đang tải thống kê tổng quan..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message={error} 
          onRetry={loadData}
          fullPage
        />
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Không có dữ liệu để hiển thị" 
          fullPage
        />
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Tổng quan
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Thống kê và giám sát hệ thống
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              inline-flex items-center gap-2.5 px-5 py-2.5
              bg-white border border-gray-200 rounded-xl
              text-sm font-semibold text-gray-700
              hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            <span>{refreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
          </button>
        </div>

        {/* Alert Box - Show if there are any alerts */}
        <AlertBox kpi={data.kpi} />

        {/* KPI Grid */}
        <KPIGrid kpi={data.kpi} />

        {/* Charts & Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Trend Chart */}
          <ReportTrendChart trend={data.trend} />

          {/* Top Enterprise Table */}
          <TopEnterpriseTable enterprises={data.topEnterprises} />
        </div>

        {/* Additional Info */}
        <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 text-center font-medium">
            Cập nhật lần cuối: {new Date().toLocaleString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
