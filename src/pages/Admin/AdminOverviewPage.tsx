// filepath: src/pages/admin/AdminOverviewPage.tsx

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  Filter,
  FileText,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageLoader, ErrorMessage } from "@/components/Admin/shared";
import { TopEnterpriseTable } from "@/components/Admin/Overview/TopEnterpriseTable";
import { Button, Card, StatCard, formatNumber } from "@/components/ui/page/componentUI";
import { formatCurrency, formatWeight } from "@/utils/format";
import { fetchAdminDashboardData, fetchAdminReportTrends } from "@/api/admin/dashboard";
import type { AdminDashboardData } from "@/api/types/admin.types";

// ============================================================================
// Component
// ============================================================================

/**
 * Admin Overview Dashboard Page
 * Main dashboard showing KPIs, alerts, trends, and top performers.
 * Fetches data from backend APIs and handles loading/error states.
 */
export default function AdminOverviewPage() {
  const [trendRange, setTrendRange] = useState<7 | 30 | 365>(30);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAdminDashboardData(trendRange);
      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetchAdminDashboardData(trendRange);
      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể làm mới dữ liệu. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Failed to refresh admin dashboard:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTrendRangeChange = async (nextRange: 7 | 30 | 365) => {
    if (nextRange === trendRange) return;

    setTrendRange(nextRange);

    try {
      setTrendLoading(true);
      const trends = await fetchAdminReportTrends(nextRange);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reportTrends: trends,
        };
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải xu hướng báo cáo.";
      setError(errorMessage);
      console.error("Failed to load report trends:", err);
    } finally {
      setTrendLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Đang tải dashboard admin..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={loadData} fullPage />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Không có dữ liệu để hiển thị" fullPage />
      </div>
    );
  }

  const totalWasteKg = data.wasteTypeStats.reduce((sum, item) => sum + item.totalWeightKg, 0);

  const topWasteTypes = [...data.wasteTypeStats]
    .sort((a, b) => b.totalWeightKg - a.totalWeightKg)
    .slice(0, 5);

  const enterpriseRows = data.topEnterprises.map((item) => ({
    id: String(item.id),
    name: item.name,
    completedReports: item.completedAssignments,
    completionRate: item.completionRate,
    status: item.status,
    totalAssignments: item.totalAssignments,
    collectorsCount: item.collectorsCount,
  }));

  const trendData = data.reportTrends.map((item) => ({
    ...item,
    labelDate: item.date.slice(5),
  }));

  const statusBreakdown = data.reportStatusBreakdown.breakdown.map(item => ({
    ...item,
    statusDisplayName: getReportStatusLabel(item.status),
  }));
  const statusTotal = data.reportStatusBreakdown.total;

  const pieColors = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

  const showBannedAlert = data.overview.users.banned > 0;

  const getWasteTypeLabel = (wasteType: string) => {
    switch (wasteType) {
      case "ORGANIC":
        return "Rác hữu cơ";
      case "RECYCLABLE":
        return "Rác tái chế";
      case "HAZARDOUS":
        return "Rác nguy hại";
      default:
        return wasteType;
    }
  };

  const getReportStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "ACCEPTED":
        return "Đã chấp nhận";
      case "ON_THE_WAY":
        return "Đang đến";
      case "ARRIVED":
        return "Đã đến nơi";
      case "COLLECTING":
        return "Đang thu gom";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Bảng điều khiển quản trị
                  </h1>
                  <p className="text-sm text-slate-600">
                    Tổng quan hệ thống và các chỉ số vận hành quan trọng
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="!rounded-2xl !px-3 !py-2 !bg-white !border !border-slate-200 !text-slate-800 !font-medium hover:!border-emerald-300 hover:!bg-emerald-50/60 hover:!text-emerald-800 active:!bg-emerald-100/60 disabled:!opacity-70 disabled:!cursor-not-allowed transition-all duration-200 ease-out shadow-sm hover:shadow"
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-700" : "text-slate-600"
                    }`}
                />
                {refreshing ? "Đang tải..." : "Tải lại"}
              </span>
            </Button>
          </div>
        </Card>

        {showBannedAlert && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
            <Users className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Hệ thống đang có {formatNumber(data.overview.users.banned)} tài khoản bị khóa.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Tổng báo cáo"
            value={formatNumber(data.overview.reports.total)}
            sub={`${formatNumber(data.overview.reports.today)} hôm nay`}
            icon={FileText}
            trend={
              data.overview.reports.growthPercent !== null
                ? {
                  label: `${data.overview.reports.growthPercent > 0 ? "+" : ""}${data.overview.reports.growthPercent}%`,
                  positive: data.overview.reports.growthPercent >= 0,
                }
                : undefined
            }
          />
          <StatCard
            title="Tỷ lệ hoàn thành"
            value={`${formatNumber(data.overview.reports.completionRate)}%`}
            sub={`${formatNumber(
              data.overview.reports.completed,
            )} hoàn thành • ${formatNumber(data.overview.reports.cancelled)} hủy`}
            icon={UserCheck}
          />
          <StatCard
            title="Người dùng"
            value={formatNumber(data.overview.users.active)}
            sub={`${formatNumber(data.overview.users.total)} tổng, ${formatNumber(data.overview.users.banned)} bị khóa`}
            icon={Users}
          />
          <StatCard
            title="Doanh nghiệp hoạt động"
            value={formatNumber(data.overview.enterprises.active)}
            sub={`${formatNumber(data.overview.enterprises.total)} tổng doanh nghiệp`}
            icon={Building2}
          />
          <StatCard
            title="Doanh thu tháng"
            value={formatCurrency(data.revenueStats.monthlyRevenue)}
            sub={`${formatNumber(data.revenueStats.monthlyTransactions)} giao dịch`}
            icon={CircleDollarSign}
          />
          <StatCard
            title="Tổng khối lượng rác"
            value={formatWeight(totalWasteKg)}
            sub={`${formatNumber(data.wasteTypeStats.length)} loại rác`}
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="p-4 sm:p-5 xl:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Xu hướng báo cáo {trendRange === 7 ? "1 tuần" : trendRange === 30 ? "1 tháng" : "1 năm"}
                </h2>
                <p className="text-sm text-slate-600">
                  Theo dõi tổng số, hoàn thành và đơn bị hủy
                </p>
              </div>
              <div className="inline-flex w-full items-center rounded-xl border border-slate-200 bg-white p-1 sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleTrendRangeChange(7)}
                  className={`inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none ${trendRange === 7
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  1 tuần
                </button>
                <button
                  type="button"
                  onClick={() => handleTrendRangeChange(30)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none ${trendRange === 30
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Filter className="h-4 w-4" />
                  1 tháng
                </button>
                <button
                  type="button"
                  onClick={() => handleTrendRangeChange(365)}
                  className={`inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none ${trendRange === 365
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  1 năm
                </button>
              </div>
            </div>
            <div className="relative h-[320px]">
              {trendLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang tải xu hướng...
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="labelDate" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Tổng" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="completed" name="Hoàn thành" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    name="Đã hủy"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Trạng thái báo cáo</h2>
              <p className="text-sm text-slate-600">Phân bố theo từng trạng thái xử lý (toàn bộ dữ liệu)</p>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="statusDisplayName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ payload }) => `${payload?.statusDisplayName}: ${payload?.percentage ?? 0}%`}
                  >
                    {statusBreakdown.map((_, index) => (
                      <Cell key={`status-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [value, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Tổng hiển thị: {formatNumber(statusTotal)} báo cáo
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Doanh thu</h2>
              <p className="text-sm text-slate-600">Tổng hợp doanh thu gói đăng ký</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Tổng doanh thu</span>
                <span className="font-semibold text-slate-900">{formatCurrency(data.revenueStats.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Năm nay</span>
                <span className="font-semibold text-slate-900">{formatCurrency(data.revenueStats.yearlyRevenue)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-600">Tháng này</span>
                <span className="font-semibold text-slate-900">{formatCurrency(data.revenueStats.monthlyRevenue)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Loại rác nổi bật</h2>
              <p className="text-sm text-slate-600">Top theo khối lượng thu gom</p>
            </div>
            <div className="space-y-2">
              {topWasteTypes.map((item) => (
                <div key={item.wasteType} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{getWasteTypeLabel(item.wasteType)}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatWeight(item.totalWeightKg)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Ưu đãi</h2>
              <p className="text-sm text-slate-600">Điểm thưởng và lượt đổi quà</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                <span className="text-emerald-700">Tổng điểm đã cấp</span>
                <span className="font-semibold text-emerald-900">{formatNumber(data.overview.loyalty.totalPointsIssued)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-blue-700">Tổng lượt đổi quà</span>
                <span className="font-semibold text-blue-900">{formatNumber(data.overview.loyalty.totalGiftsRedeemed)}</span>
              </div>
            </div>
          </Card>
        </div>

        <TopEnterpriseTable enterprises={enterpriseRows} />

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-medium text-slate-500">
          Cập nhật lúc: {new Date().toLocaleString("vi-VN")}
        </div>
      </div>
    </div>
  );
}
