// filepath: src/components/Admin/Overview/KPICard.tsx

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface KPICardProps {
  /** Label/title for the KPI */
  label: string;
  /** Numeric value to display */
  value: number;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional trend indicator */
  trend?: {
    /** Percentage change */
    value: number;
    /** Direction of trend */
    direction: 'up' | 'down';
  };
  /** Optional value formatter function */
  formatter?: (value: number) => string;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * KPI Card component for displaying key metrics
 * Modern design with gradient backgrounds and smooth animations
 */
export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  formatter = (v) => v.toLocaleString('vi-VN'),
  className = '',
}) => {
  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-2xl bg-white border border-gray-100
        p-6 transition-all duration-300
        hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1
        ${className}
      `}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
              {label}
            </p>
          </div>
          
          {Icon && (
            <div className="flex-shrink-0 ml-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-sm">
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatter(value)}
          </p>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-1.5">
            {trend.direction === 'up' ? (
              <>
                <div className="rounded-md bg-emerald-50 p-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  +{trend.value}%
                </span>
              </>
            ) : (
              <>
                <div className="rounded-md bg-rose-50 p-1">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-600" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-rose-600">
                  -{trend.value}%
                </span>
              </>
            )}
            <span className="text-xs text-gray-400 ml-0.5">vs tháng trước</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
