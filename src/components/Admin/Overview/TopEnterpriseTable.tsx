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
  const getStatusLabel = (status?: string) => {
    if (status === 'ACTIVE') return 'Đang hoạt động';
    if (status === 'PENDING') return 'Chờ duyệt';
    if (status === 'BANNED') return 'Bị khóa';
    if (status === 'OFFLINE') return 'Tạm dừng';
    if (status === 'EXPIRED') return 'Hết hạn';
    return 'Không xác định';
  };

  const getStatusStyle = (status?: string) => {
    if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'BANNED') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status === 'OFFLINE') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (status === 'EXPIRED') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <Card
      className={className}
      padding="none"
    >
      <div className="border-b border-slate-100 px-4 py-4 text-center md:px-6">
        <h3 className="text-xl font-bold text-slate-900">Top doanh nghiệp</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">Hiệu suất cao nhất</p>
      </div>

      <div className="space-y-3 p-4 font-sans md:hidden">
        {enterprises.map((enterprise, index) => (
          <div key={enterprise.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                  #{index + 1}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusStyle(enterprise.status)}`}>
                  {getStatusLabel(enterprise.status)}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {enterprise.completionRate ?? 0}%
              </span>
            </div>

            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{enterprise.name}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">ID: {enterprise.id}</p>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Tổng đơn</p>
                <p className="text-sm font-bold text-slate-900">{formatNumber(enterprise.totalAssignments ?? 0)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Hoàn thành</p>
                <p className="text-sm font-bold text-slate-900">{formatNumber(enterprise.completedReports)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[11px] text-slate-500">Người thu gom</p>
                <p className="text-sm font-bold text-slate-900">{formatNumber(enterprise.collectorsCount ?? 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto font-sans md:block">
        <table className="min-w-[980px] w-full table-fixed">
          <colgroup>
            <col className="w-[88px]" />
            <col className="w-[44%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Hạng</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Doanh nghiệp</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Tổng đơn</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Hoàn thành</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Người thu gom</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {enterprises.map((enterprise, index) => (
              <tr key={enterprise.id} className="group hover:bg-gray-50/50 transition-colors duration-150">
                <td className="px-5 py-3.5 whitespace-nowrap align-middle">
                  <div className="flex items-center justify-center">
                    <div
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-transform duration-200
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

                <td className="px-5 py-3.5 align-middle min-w-[340px]">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {enterprise.avatar ? (
                        <img
                          src={enterprise.avatar}
                          alt={enterprise.name}
                          className="h-10 w-10 rounded-lg object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                          <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {enterprise.name}
                      </p>
                      <div className="mt-0.5 inline-flex items-center gap-2 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-500 whitespace-nowrap">ID: {enterprise.id}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${getStatusStyle(enterprise.status)}`}>
                          {getStatusLabel(enterprise.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-center align-middle">
                  <div className="text-sm font-bold text-gray-900">{formatNumber(enterprise.totalAssignments ?? 0)}</div>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-center align-middle">
                  <div className="text-sm font-bold text-gray-900">{formatNumber(enterprise.completedReports)}</div>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-center align-middle">
                  <div className="text-sm font-bold text-gray-900">{formatNumber(enterprise.collectorsCount ?? 0)}</div>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-center align-middle">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-emerald-700">{enterprise.completionRate ?? 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {enterprises.length === 0 && (
        <div className="px-6 py-16 text-center font-sans">
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
