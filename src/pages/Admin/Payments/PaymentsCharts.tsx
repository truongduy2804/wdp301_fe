import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/page/componentUI";
import type { AdminRevenueStats } from "@/api/types/adminPayment.types";
import { formatCurrency, formatNumber } from "@/utils/format";

const PIE_COLORS = ["#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444", "#4F46E5", "#10B981"];

type Props = {
  revenueStats: AdminRevenueStats | null;
};

function toMethodLabel(method: string): string {
  if (method === "BANK_TRANSFER") return "Chuyển khoản ngân hàng";
  return method;
}

export default function PaymentsCharts({ revenueStats }: Props) {
  const trendData = useMemo(() => {
    if (!revenueStats) return [];
    return [
      {
        label: "Tháng này",
        doanhThu: Number(revenueStats.monthlyRevenue || 0),
        giaoDich: Number(revenueStats.monthlyTransactions || 0),
      },
      {
        label: "Năm nay",
        doanhThu: Number(revenueStats.yearlyRevenue || 0),
        giaoDich: Number(revenueStats.yearlyTransactions || 0),
      },
      {
        label: "Toàn thời gian",
        doanhThu: Number(revenueStats.totalRevenue || 0),
        giaoDich: Number(revenueStats.totalTransactions || 0),
      },
    ];
  }, [revenueStats]);

  const byMethodData = useMemo(() => {
    if (!revenueStats) return [];
    return revenueStats.byMethod.map((x) => ({
      name: toMethodLabel(x.method || "UNKNOWN"),
      value: Number(x.totalAmount || 0),
      count: Number(x.count || 0),
    }));
  }, [revenueStats]);

  const byPlanData = useMemo(() => {
    if (!revenueStats) return [];
    return [...revenueStats.byPlan]
      .map((x) => ({
        planName: x.planName || "Unknown",
        totalAmount: Number(x.totalAmount || 0),
        count: Number(x.count || 0),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 6);
  }, [revenueStats]);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-4 sm:p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bức tranh doanh thu</h2>
              <p className="text-sm text-slate-600">So sánh mức doanh thu theo mốc thời gian chính</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}M`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "doanhThu") return [formatCurrency(Number(value || 0)), "Doanh thu"];
                    return [formatNumber(Number(value || 0)), "Giao dịch"];
                  }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  stroke="#0891B2"
                  fill="url(#revGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900"></h2>
            <p className="text-sm text-slate-600">Phương thức thanh toán</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byMethodData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {byMethodData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(Number(value || 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {byMethodData.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  {item.name}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-slate-600">{formatNumber(item.count)} giao dịch</p>
                </div>
              </div>
            ))}
            {byMethodData.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có dữ liệu phương thức thanh toán.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Top gói subscription theo doanh thu</h2>
          <p className="text-sm text-slate-600">Hiển thị tối đa 6 gói có đóng góp doanh thu cao nhất.</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byPlanData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="planName" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}M`}
              />
              <Tooltip formatter={(v: number) => formatCurrency(Number(v || 0))} />
              <Area
                type="monotone"
                dataKey="totalAmount"
                stroke="#0EA5E9"
                fill="#BAE6FD"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
