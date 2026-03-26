// filepath: src/components/Admin/Overview/TopEnterpriseTable.tsx

import React from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/Admin/shared';
import type { TopEnterprise } from '@/api/types/admin.types';
import { formatNumber } from '@/utils/format';

// ============================================================================
// Types
// ============================================================================

interface TopEnterpriseTableProps {
  /** Top enterprises list */
  enterprises: TopEnterprise[];
  /** Custom className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Top Enterprise Table component
 * Displays a ranking table of top performing enterprises
 * Shows rank, name, completed reports count, and completion rate
 */
export const TopEnterpriseTable: React.FC<TopEnterpriseTableProps> = ({
  enterprises,
  className = '',
}) => {
  return (
    <Card
      title="Top doanh nghiệp"
      description="Hiệu suất cao nhất"
      className={className}
      padding="none"
    >
      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Hạng
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Doanh nghiệp
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Hoàn thành
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tỷ lệ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {enterprises.map((enterprise, index) => (
              <tr
                key={enterprise.id}
                className="group hover:bg-gray-50/50 transition-colors duration-150"
              >
                {/* Rank */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`
                        flex items-center justify-center h-9 w-9 rounded-xl
                        font-bold text-sm transition-transform duration-200
                        group-hover:scale-110
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md' : ''}
                        ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-md' : ''}
                        ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' : ''}
                        ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                      `}
                    >
                      {index + 1}
                    </div>
                  </div>
                </td>

                {/* Enterprise Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {enterprise.avatar ? (
                        <img
                          src={enterprise.avatar}
                          alt={enterprise.name}
                          className="h-11 w-11 rounded-xl object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {enterprise.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {enterprise.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Completed Reports */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatNumber(enterprise.completedReports)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">báo cáo</div>
                </td>

                {/* Completion Rate */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {enterprise.completionRate !== undefined ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-emerald-700">
                        {enterprise.completionRate}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {enterprises.length === 0 && (
        <div className="px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-100 mb-4">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            Chưa có dữ liệu doanh nghiệp
          </p>
        </div>
      )}
    </Card>
  );
};

export default TopEnterpriseTable;
