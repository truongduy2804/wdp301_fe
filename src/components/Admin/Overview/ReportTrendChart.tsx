// filepath: src/components/Admin/Overview/ReportTrendChart.tsx

import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/Admin/shared';
import type { TrendPoint } from '@/api/types/admin.types';
import { CHART_COLORS } from '@/utils/constants';

// ============================================================================
// Types
// ============================================================================

interface ReportTrendChartProps {
  /** 7-day trend data */
  trend: TrendPoint[];
  /** Custom className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Report Trend Chart component
 * Displays a line chart showing created vs completed reports over 7 days
 * Uses Recharts library for rendering
 */
export const ReportTrendChart: React.FC<ReportTrendChartProps> = ({
  trend,
  className = '',
}) => {
  return (
    <Card
      title="Xu hướng báo cáo"
      description="7 ngày gần đây"
      className={className}
      padding="md"
    >
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trend}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            
            {/* X Axis */}
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tickLine={false}
              axisLine={false}
            />
            
            {/* Y Axis */}
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px', fontWeight: '500' }}
              tickLine={false}
              axisLine={false}
            />
            
            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                padding: '12px',
              }}
              labelStyle={{
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1e293b',
              }}
              itemStyle={{
                fontSize: '13px',
                fontWeight: '500',
              }}
            />
            
            {/* Legend */}
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: '500',
              }}
              iconType="circle"
            />
            
            {/* Lines */}
            <Line
              type="monotone"
              dataKey="created"
              name="Báo cáo mới"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 3 }}
            />
            
            <Line
              type="monotone"
              dataKey="completed"
              name="Hoàn thành"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tổng mới</p>
          <p className="text-2xl font-bold text-gray-900">
            {trend.reduce((sum, point) => sum + point.created, 0)}
          </p>
        </div>
        
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hoàn thành</p>
          <p className="text-2xl font-bold text-emerald-600">
            {trend.reduce((sum, point) => sum + point.completed, 0)}
          </p>
        </div>
        
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tỷ lệ</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {(() => {
              const totalCreated = trend.reduce((sum, point) => sum + point.created, 0);
              const totalCompleted = trend.reduce((sum, point) => sum + point.completed, 0);
              const rate = totalCreated > 0 ? (totalCompleted / totalCreated) * 100 : 0;
              return `${rate.toFixed(0)}%`;
            })()}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReportTrendChart;
