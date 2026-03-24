// filepath: src/components/Admin/Overview/KPIGrid.tsx

import React from 'react';
import { Users, FileText, Clock, CheckCircle2, MessageSquareWarning, Package } from 'lucide-react';
import { KPICard } from './KPICard';
import type { OverviewKPI } from '@/api/types/admin.types';
import { formatNumber, formatWeight } from '@/utils/format';

// ============================================================================
// Types
// ============================================================================

interface KPIGridProps {
  /** KPI data to display */
  kpi: OverviewKPI;
  /** Custom className for grid */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * KPI Grid component displaying all key metrics in a responsive grid
 * Shows 6 main KPI cards with icons and formatted values
 */
export const KPIGrid: React.FC<KPIGridProps> = ({ kpi, className = '' }) => {
  return (
    <div
      className={`
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5
        ${className}
      `}
    >
      {/* Total Users */}
      <KPICard
        label="Người dùng"
        value={kpi.totalUsers}
        icon={Users}
        formatter={formatNumber}
      />

      {/* Total Reports */}
      <KPICard
        label="Báo cáo"
        value={kpi.totalReports}
        icon={FileText}
        formatter={formatNumber}
      />

      {/* In Progress Reports */}
      <KPICard
        label="Đang xử lý"
        value={kpi.inProgressReports}
        icon={Clock}
        formatter={formatNumber}
      />

      {/* Completed Reports */}
      <KPICard
        label="Hoàn thành"
        value={kpi.completedReports}
        icon={CheckCircle2}
        formatter={formatNumber}
      />

      {/* Open Complaints */}
      <KPICard
        label="Khiếu nại"
        value={kpi.openComplaints}
        icon={MessageSquareWarning}
        formatter={formatNumber}
      />

      {/* Total Waste */}
      <KPICard
        label="Rác thu gom"
        value={kpi.totalWasteKg}
        icon={Package}
        formatter={(value) => formatWeight(value)}
      />
    </div>
  );
};

export default KPIGrid;
