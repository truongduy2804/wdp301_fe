// src/pages/enterprise/EnterpriseStatsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Leaf,
  RefreshCw,
  TrendingUp,
  Truck,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import { useGetEnterpriseSubscriptionQuery } from "@/redux/api/enterprise/subscription";
import { useEnterpriseRenewSoonToast } from "@/hooks/useEnterpriseRenewToast";
import { usePendingPaymentToast } from "@/hooks/usePendingPaymentToast";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  useGetEnterpriseDashboardSummaryQuery,
  useGetEnterpriseDashboardRankingQuery,
  useGetEnterpriseDashboardStatsQuery,
} from "@/redux/api/enterprise/dashboard";

import type {
  DashboardOrder,
  DashboardRankingItem,
  DashboardRankingSortBy,
  DashboardStatsInterval,
} from "@/redux/api/enterprise/dashboard/type";

import {
  cx,
  formatNumber,
  Card,
  StatCard,
  Dropdown,
  DateRangePill,
} from "../../../components/ui/page/componentUI";

/* ===================== Types ===================== */
type DatePreset = "7d" | "30d" | "90d" | "custom";

type WasteKey = "ORGANIC" | "RECYCLABLE" | "HAZARDOUS";

type WasteTotalRow = {
  key: WasteKey;
  name: string;
  value: number;
};

type TrendRow = {
  label: string;
  ORGANIC: number;
  RECYCLABLE: number;
  HAZARDOUS: number;
  total: number;
};

/* ===================== Constants ===================== */
const CHART = {
  organic: "#10b981",
  recyclable: "#0ea5e9",
  hazardous: "#f59e0b",
  pie: ["#10b981", "#0ea5e9", "#f59e0b"],
};

const WASTE_LABEL: Record<WasteKey, string> = {
  ORGANIC: "Hữu cơ",
  RECYCLABLE: "Tái chế",
  HAZARDOUS: "Nguy hại",
};

const SORT_BY_LABEL: Record<DashboardRankingSortBy, string> = {
  weight: "Khối lượng",
  tasks: "Số nhiệm vụ",
  trust: "Độ tin cậy",
};

const INTERVAL_LABEL: Record<DashboardStatsInterval, string> = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
};

/* ===================== Utils ===================== */
function buildRangeFromPreset(
  preset: DatePreset,
): [Dayjs | null, Dayjs | null] {
  const today = dayjs();
  if (preset === "7d") return [today.subtract(6, "day"), today];
  if (preset === "30d") return [today.subtract(29, "day"), today];
  if (preset === "90d") return [today.subtract(11, "month"), today];
  return [today.subtract(6, "day"), today];
}

function exportRankingCSV(rows: DashboardRankingItem[]) {
  const header = [
    "id",
    "fullName",
    "employeeCode",
    "trustScore",
    "completedTasks",
    "totalWeight",
    "avatar",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        `"${r.fullName ?? ""}"`,
        `"${r.employeeCode ?? ""}"`,
        r.trustScore ?? 0,
        r.completedTasks ?? 0,
        r.totalWeight ?? 0,
        `"${r.avatar ?? ""}"`,
      ].join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enterprise-dashboard-ranking.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function getCollectorStatus(trustScore: number) {
  if (trustScore >= 100) {
    return {
      label: "Xuất sắc",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }

  if (trustScore >= 80) {
    return {
      label: "Ổn định",
      className: "bg-sky-50 text-sky-800 border-sky-200",
    };
  }

  return {
    label: "Cần cải thiện",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  };
}

function getAvatarFallback(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

/* ===================== Page ===================== */
export default function EnterpriseStatsPage() {
  const navigate = useNavigate();

  // subscription/toast logic giữ nguyên
  const { data: subscriptionData } = useGetEnterpriseSubscriptionQuery();

  const payload = subscriptionData?.data;
  const sub = payload?.subscription;
  const pendingPayment = payload?.pendingPayment ?? null;

  usePendingPaymentToast({
    pendingPayment,
    onResumePayment: () => {
      navigate(endPoint.SUBSCRIPTION, {
        state: { resumePendingPayment: true },
      });
    },
  });

  useEnterpriseRenewSoonToast({
    enterpriseStatus: payload?.enterpriseStatus,
    subIsActive: sub?.isActive,
    subIsExpired: sub?.isExpired,
    endDate: sub?.endDate ?? null,
    onRenewNow: () => {
      navigate(endPoint.SUBSCRIPTION, { state: { openPlanModal: true } });
    },
  });

  /* ===================== Filters ===================== */
  const [preset, setPreset] = useState<DatePreset>("7d");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>(
    buildRangeFromPreset("7d"),
  );
  const [interval, setInterval] = useState<DashboardStatsInterval>("day");
  const [sortBy, setSortBy] = useState<DashboardRankingSortBy>("weight");
  const [order, setOrder] = useState<DashboardOrder>("desc");

  useEffect(() => {
    if (preset === "custom") return;
    setRange(buildRangeFromPreset(preset));
  }, [preset]);

  const queryReady = Boolean(range[0] && range[1]);

  const dateParams = useMemo(
    () =>
      queryReady
        ? {
            startDate: range[0]!.format("YYYY-MM-DD"),
            endDate: range[1]!.format("YYYY-MM-DD"),
          }
        : undefined,
    [queryReady, range],
  );

  /* ===================== API ===================== */
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetEnterpriseDashboardSummaryQuery(dateParams, {
    skip: !queryReady,
  });

  const {
    data: ranking = [],
    isLoading: isRankingLoading,
    isFetching: isRankingFetching,
    error: rankingError,
    refetch: refetchRanking,
  } = useGetEnterpriseDashboardRankingQuery(
    dateParams
      ? {
          ...dateParams,
          sortBy,
          order,
        }
      : undefined,
    {
      skip: !queryReady,
    },
  );

  const {
    data: stats = [],
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    error: statsError,
    refetch: refetchStats,
  } = useGetEnterpriseDashboardStatsQuery(
    dateParams
      ? {
          ...dateParams,
          interval: "day",
        }
      : undefined,
    {
      skip: !queryReady,
    },
  );

  const isLoading = isSummaryLoading || isRankingLoading || isStatsLoading;

  const isFetching = isSummaryFetching || isRankingFetching || isStatsFetching;

  const hasError = Boolean(summaryError || rankingError || statsError);

  const handleRetryAll = () => {
    refetchSummary();
    refetchRanking();
    refetchStats();
  };

  /* ===================== Derived Data ===================== */
  const trendData = useMemo<TrendRow[]>(
    () =>
      (stats ?? []).map((item) => ({
        label: item.label,
        ORGANIC: Number(item.ORGANIC ?? 0),
        RECYCLABLE: Number(item.RECYCLABLE ?? 0),
        HAZARDOUS: Number(item.HAZARDOUS ?? 0),
        total:
          Number(item.ORGANIC ?? 0) +
          Number(item.RECYCLABLE ?? 0) +
          Number(item.HAZARDOUS ?? 0),
      })),
    [stats],
  );

  const wasteTotals = useMemo<WasteTotalRow[]>(() => {
    const organic = trendData.reduce((sum, item) => sum + item.ORGANIC, 0);
    const recyclable = trendData.reduce(
      (sum, item) => sum + item.RECYCLABLE,
      0,
    );
    const hazardous = trendData.reduce((sum, item) => sum + item.HAZARDOUS, 0);

    return [
      { key: "ORGANIC", name: WASTE_LABEL.ORGANIC, value: organic },
      { key: "RECYCLABLE", name: WASTE_LABEL.RECYCLABLE, value: recyclable },
      { key: "HAZARDOUS", name: WASTE_LABEL.HAZARDOUS, value: hazardous },
    ];
  }, [trendData]);

  const totalStatsWeight = useMemo(
    () => wasteTotals.reduce((sum, item) => sum + item.value, 0),
    [wasteTotals],
  );

  const topBarSubtitle = useMemo(() => {
    const [a, b] = range;
    if (!a || !b) {
      return "Chọn khoảng ngày để xem số liệu thống kê.";
    }

    return `Dữ liệu từ ${a.format("DD/MM/YYYY")} đến ${b.format("DD/MM/YYYY")}`;
  }, [range]);

  const summaryPeriodLabel = useMemo(() => {
    if (!summary?.period?.startDate || !summary?.period?.endDate) return null;

    return `${dayjs(summary.period.startDate).format("DD/MM/YYYY")} - ${dayjs(
      summary.period.endDate,
    ).format("DD/MM/YYYY")}`;
  }, [summary]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                    Thống kê
                  </h1>
                  <p className="text-sm text-slate-600">{topBarSubtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dropdown<DatePreset>
                label="Thời gian"
                value={preset}
                onChange={setPreset}
                icon={CalendarDays}
                options={[
                  { value: "7d", label: "7 ngày" },
                  { value: "30d", label: "30 ngày" },
                  { value: "90d", label: "12 tháng" },
                  { value: "custom", label: "Tuỳ chọn" },
                ]}
              />

              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
                  "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
                )}
              >
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-semibold text-slate-600">
                  Khoảng ngày
                </span>

                <DateRangePill
                  value={range}
                  onChange={(v) => {
                    setRange(v);
                    setPreset("custom");
                  }}
                  className={cx(
                    "!border-0 !shadow-none !bg-transparent !p-0 hover:!bg-transparent",
                  )}
                />
              </div>

              <Dropdown<DashboardStatsInterval>
                label="Nhóm thời gian"
                value={interval}
                onChange={setInterval}
                icon={Filter}
                options={[
                  { value: "day", label: "Theo ngày" },
                  { value: "week", label: "Theo tuần" },
                  { value: "month", label: "Theo tháng" },
                ]}
              />

              <Dropdown<DashboardRankingSortBy>
                label="Xếp hạng theo"
                value={sortBy}
                onChange={setSortBy}
                icon={TrendingUp}
                options={[
                  { value: "weight", label: "Khối lượng" },
                  { value: "tasks", label: "Số nhiệm vụ" },
                  { value: "trust", label: "Độ tin cậy" },
                ]}
              />

              <Dropdown<DashboardOrder>
                label="Thứ tự"
                value={order}
                onChange={setOrder}
                icon={Filter}
                options={[
                  { value: "desc", label: "Giảm dần" },
                  { value: "asc", label: "Tăng dần" },
                ]}
              />

              <button
                onClick={() => exportRankingCSV(ranking)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2",
                  "text-sm font-semibold text-emerald-800 shadow-sm",
                  "hover:bg-emerald-50 hover:border-emerald-400 transition-colors",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
                type="button"
                disabled={!ranking.length}
              >
                <Download className="h-4 w-4" />
                Xuất CSV
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Error */}
        {hasError ? (
          <Card className="p-4 border border-red-200 bg-red-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Không tải được dữ liệu dashboard
                </p>
                <p className="text-sm text-red-700">
                  Vui lòng kiểm tra token, quyền truy cập hoặc thử tải lại.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetryAll}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Tải lại
              </button>
            </div>
          </Card>
        ) : null}

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <StatCard
            title="Khối lượng"
            value={
              isLoading
                ? "..."
                : `${formatNumber(summary?.totalWeight ?? 0)} kg`
            }
            sub="Tổng khối lượng thu gom"
            icon={Leaf}
          />

          <StatCard
            title="Báo cáo hoàn tất"
            value={
              isLoading
                ? "..."
                : formatNumber(summary?.totalCompletedReports ?? 0)
            }
            sub="Tổng report đã hoàn tất"
            icon={ClipboardList}
          />

          <StatCard
            title="Nhân viên hoạt động"
            value={
              isLoading ? "..." : formatNumber(summary?.activeCollectors ?? 0)
            }
            sub="Số nhân viên đang hoạt động"
            icon={Users}
          />

          <StatCard
            title="Nhiệm vụ hôm nay"
            value={
              isLoading ? "..." : formatNumber(summary?.todayTasks?.total ?? 0)
            }
            sub={`Chờ xử lý: ${formatNumber(summary?.todayTasks?.pending ?? 0)}`}
            icon={Truck}
          />

          <StatCard
            title="Đang thu gom"
            value={
              isLoading
                ? "..."
                : formatNumber(summary?.todayTasks?.collecting ?? 0)
            }
            sub="Công việc đang được xử lý"
            icon={TrendingUp}
          />

          <StatCard
            title="Hoàn tất hôm nay"
            value={
              isLoading
                ? "..."
                : formatNumber(summary?.todayTasks?.completed ?? 0)
            }
            sub="Công việc hoàn tất trong ngày"
            icon={ShieldCheck}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Daily grouped bar chart */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Xu hướng rác thải theo thời gian
                </p>
                <p className="text-xs text-slate-600">
                  Theo ngày, mỗi cột thể hiện từng loại rác
                </p>
              </div>

              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                Ngày
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} barCategoryGap={8}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="ORGANIC"
                    name="Hữu cơ"
                    fill={CHART.organic}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="RECYCLABLE"
                    name="Tái chế"
                    fill={CHART.recyclable}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="HAZARDOUS"
                    name="Nguy hại"
                    fill={CHART.hazardous}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar chart */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Tổng khối lượng theo nhóm rác
                </p>
                <p className="text-xs text-slate-600">
                  Cộng dồn trong khoảng đã chọn
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                {formatNumber(totalStatsWeight)} kg
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteTotals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Khối lượng"
                    radius={[12, 12, 0, 0]}
                  >
                    {wasteTotals.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART.pie[idx % CHART.pie.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie chart */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Cơ cấu loại rác
                </p>
                <p className="text-xs text-slate-600">
                  Tỷ trọng theo khối lượng
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                {INTERVAL_LABEL[interval]}
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteTotals}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {wasteTotals.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART.pie[idx % CHART.pie.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Ranking table */}
        <Card className="overflow-hidden" hover={false}>
          <div className="p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Bảng xếp hạng nhân viên
              </p>
              <p className="text-xs text-slate-600">
                Sắp xếp theo {SORT_BY_LABEL[sortBy].toLowerCase()} (
                {order === "desc" ? "giảm dần" : "tăng dần"})
              </p>
            </div>

            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
              {ranking.length} nhân viên
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-xs font-semibold uppercase  text-slate-700">
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Mã Nhân viên</th>
                  <th className="px-4 py-3">Hoàn tất</th>
                  <th className="px-4 py-3">Khối lượng</th>
                  <th className="px-4 py-3">Điểm uy tín</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {ranking.length ? (
                  ranking.map((collector) => {
                    const status = getCollectorStatus(collector.trustScore);

                    return (
                      <tr
                        key={collector.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {collector.avatar ? (
                              <img
                                src={collector.avatar}
                                alt={collector.fullName}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full border border-slate-200 bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                                {getAvatarFallback(collector.fullName)}
                              </div>
                            )}

                            <div>
                              <div className="font-semibold text-slate-900">
                                {collector.fullName}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {collector.employeeCode}
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {formatNumber(collector.completedTasks)}
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {formatNumber(collector.totalWeight)} kg
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={cx(
                                  "h-full",
                                  collector.trustScore >= 100
                                    ? "bg-emerald-500"
                                    : collector.trustScore >= 80
                                      ? "bg-sky-500"
                                      : "bg-amber-500",
                                )}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, collector.trustScore),
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm font-semibold text-slate-900">
                              {collector.trustScore}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cx(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border",
                              status.className,
                            )}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      {isLoading || isFetching
                        ? "Đang tải bảng xếp hạng..."
                        : "Không có dữ liệu nhân viên trong khoảng thời gian đã chọn."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
