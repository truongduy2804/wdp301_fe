// src/pages/enterprise/EnterpriseStatsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Leaf,
  MapPinned,
  TrendingUp,
  Users,
} from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import { useGetEnterpriseSubscriptionQuery } from "@/redux/api/enterprise/subscription";
import { useEnterpriseRenewSoonToast } from "@/hooks/useEnterpriseRenewToast";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  cx,
  formatNumber,
  Card,
  StatCard,
  Dropdown,
  DateRangePill,
} from "../../../components/ui/page/componentUI";
import { usePendingPaymentToast } from "@/hooks/usePendingPaymentToast";

/* ===================== Types ===================== */
type DatePreset = "7d" | "30d" | "90d" | "custom";
type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";
type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";

type DailyPoint = {
  date: string;
  requests: number;
  collectedKg: number;
  completed: number;
};

type ZonePoint = {
  zone: Zone;
  requests: number;
  completed: number;
  collectedKg: number;
};

type WastePoint = {
  type: WasteType;
  valueKg: number;
};

type CollectorRow = {
  id: string;
  name: string;
  zone: Zone;
  completedJobs: number;
  onTimeRate: number;
  avgMinutes: number;
};

/* ===================== Mock Data ===================== */
const DAILY_7D: DailyPoint[] = [
  { date: "01/12", requests: 86, collectedKg: 920, completed: 78 },
  { date: "02/12", requests: 92, collectedKg: 980, completed: 84 },
  { date: "03/12", requests: 110, collectedKg: 1210, completed: 98 },
  { date: "04/12", requests: 104, collectedKg: 1150, completed: 93 },
  { date: "05/12", requests: 120, collectedKg: 1330, completed: 109 },
  { date: "06/12", requests: 98, collectedKg: 1010, completed: 90 },
  { date: "07/12", requests: 132, collectedKg: 1490, completed: 121 },
];

const DAILY_30D: DailyPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const d = i + 1;
  const base = 90 + (i % 7) * 8;
  return {
    date: `${String(d).padStart(2, "0")}/12`,
    requests: base + (i % 3) * 5,
    collectedKg: 900 + base * 8 + (i % 5) * 30,
    completed: Math.round(base * 0.9 + (i % 4) * 3),
  };
});

const DAILY_90D: DailyPoint[] = Array.from({ length: 12 }).map((_, i) => {
  const month = i + 1;
  const requests = 2400 + i * 120 + (i % 2) * 80;
  const completed = Math.round(requests * (0.88 + (i % 3) * 0.02));
  return {
    date: `M${month}`,
    requests,
    completed,
    collectedKg: 21000 + i * 1400 + (i % 2) * 900,
  };
});

const ZONES: ZonePoint[] = [
  { zone: "District 1", requests: 980, completed: 910, collectedKg: 10450 },
  { zone: "District 3", requests: 860, completed: 785, collectedKg: 9050 },
  { zone: "District 7", requests: 1120, completed: 1042, collectedKg: 12120 },
  { zone: "Thu Duc", requests: 1340, completed: 1220, collectedKg: 14280 },
];

const WASTE: WastePoint[] = [
  { type: "Plastic", valueKg: 6800 },
  { type: "Paper", valueKg: 5200 },
  { type: "Metal", valueKg: 2100 },
  { type: "Organic", valueKg: 3900 },
  { type: "Other", valueKg: 1500 },
];

const COLLECTORS: CollectorRow[] = [
  {
    id: "C-001",
    name: "Nguyễn Văn A",
    zone: "Thu Duc",
    completedJobs: 312,
    onTimeRate: 94,
    avgMinutes: 28,
  },
  {
    id: "C-002",
    name: "Trần Thị B",
    zone: "District 7",
    completedJobs: 288,
    onTimeRate: 92,
    avgMinutes: 31,
  },
  {
    id: "C-003",
    name: "Lê Văn C",
    zone: "District 1",
    completedJobs: 265,
    onTimeRate: 90,
    avgMinutes: 33,
  },
  {
    id: "C-004",
    name: "Phạm Thị D",
    zone: "District 3",
    completedJobs: 241,
    onTimeRate: 89,
    avgMinutes: 35,
  },
  {
    id: "C-005",
    name: "Võ Văn E",
    zone: "Thu Duc",
    completedJobs: 228,
    onTimeRate: 87,
    avgMinutes: 37,
  },
];

/* ===================== Utils ===================== */
function exportCollectorsCSV(rows: CollectorRow[]) {
  const header = [
    "id",
    "name",
    "zone",
    "completedJobs",
    "onTimeRate",
    "avgMinutes",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        `"${r.name}"`,
        `"${r.zone}"`,
        r.completedJobs,
        r.onTimeRate,
        r.avgMinutes,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enterprise-collectors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ===================== Theme ===================== */
const CHART = {
  lineA: "#10b981", // emerald
  lineB: "#0ea5e9", // sky
  bar: ["#10b981", "#22c55e", "#14b8a6", "#0ea5e9"],
  pie: ["#10b981", "#22c55e", "#14b8a6", "#0ea5e9", "#a855f7"],
};

/* ===================== Page ===================== */
export default function EnterpriseStatsPage() {
  const navigate = useNavigate();

  // gọi để lấy endDate / trạng thái (nhẹ)
  const { data } = useGetEnterpriseSubscriptionQuery();

  const payload = data?.data;
  const sub = payload?.subscription;
  const pendingPayment = payload?.pendingPayment ?? null;

  // toast nhắc nhở trên trang chính
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

  const [preset, setPreset] = useState<DatePreset>("7d");
  const [zone, setZone] = useState<Zone | "ALL">("ALL");
  const [wasteType, setWasteType] = useState<WasteType | "ALL">("ALL");

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const daily = useMemo(() => {
    if (preset === "7d") return DAILY_7D;
    if (preset === "30d") return DAILY_30D;
    if (preset === "90d") return DAILY_90D;
    return DAILY_30D; // custom demo
  }, [preset]);

  const kpi = useMemo(() => {
    const totalRequests = daily.reduce((s, x) => s + x.requests, 0);
    const totalCompleted = daily.reduce((s, x) => s + x.completed, 0);
    const totalKg = daily.reduce((s, x) => s + x.collectedKg, 0);
    const completionRate = totalRequests
      ? Math.round((totalCompleted / totalRequests) * 100)
      : 0;
    const co2SavedKg = Math.round(totalKg * 0.42);
    const avgResponseMin = Math.max(18, Math.round(34 - completionRate * 0.1));

    return {
      totalRequests,
      totalCompleted,
      totalKg,
      completionRate,
      co2SavedKg,
      avgResponseMin,
    };
  }, [daily]);

  const zoneData = useMemo(
    () => (zone === "ALL" ? ZONES : ZONES.filter((z) => z.zone === zone)),
    [zone],
  );

  const wasteData = useMemo(
    () =>
      wasteType === "ALL" ? WASTE : WASTE.filter((w) => w.type === wasteType),
    [wasteType],
  );

  const collectors = useMemo(() => {
    const byZone =
      zone === "ALL" ? COLLECTORS : COLLECTORS.filter((c) => c.zone === zone);
    return [...byZone].sort((a, b) => b.completedJobs - a.completedJobs);
  }, [zone]);

  // preset -> sync range
  useEffect(() => {
    const today = dayjs();
    if (preset === "7d") setRange([today.subtract(6, "day"), today]);
    if (preset === "30d") setRange([today.subtract(29, "day"), today]);
    if (preset === "90d") setRange([today.subtract(11, "month"), today]);
    // custom: giữ range user chọn
  }, [preset]);

  const topBarSubtitle = useMemo(() => {
    const [a, b] = range;
    if (!a || !b)
      return "Chọn bộ lọc để xem số liệu chi tiết theo khu vực và loại rác.";
    return `Dữ liệu từ ${a.format("DD/MM/YYYY")} đến ${b.format("DD/MM/YYYY")}`;
  }, [range]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Thống kê doanh nghiệp
                  </h1>
                  <p className="text-sm text-slate-600">{topBarSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Dropdown<DatePreset>
                label="Thời gian"
                value={preset}
                onChange={setPreset}
                icon={CalendarDays}
                options={[
                  { value: "7d", label: "7 ngày" },
                  { value: "30d", label: "30 ngày" },
                  { value: "90d", label: "12 tháng (gộp)" },
                  { value: "custom", label: "Tuỳ chọn" },
                ]}
              />

              {/* Date range pill (wrap cho giống layout cũ) */}
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

              <Dropdown<Zone | "ALL">
                label="Khu vực"
                value={zone}
                onChange={setZone}
                icon={MapPinned}
                options={[
                  { value: "ALL", label: "Tất cả" },
                  { value: "District 1", label: "Quận 1" },
                  { value: "District 3", label: "Quận 3" },
                  { value: "District 7", label: "Quận 7" },
                  { value: "Thu Duc", label: "Thủ Đức" },
                ]}
              />

              <Dropdown<WasteType | "ALL">
                label="Loại rác"
                value={wasteType}
                onChange={setWasteType}
                icon={Filter}
                options={[
                  { value: "ALL", label: "Tất cả" },
                  { value: "Plastic", label: "Nhựa" },
                  { value: "Paper", label: "Giấy" },
                  { value: "Metal", label: "Kim loại" },
                  { value: "Organic", label: "Hữu cơ" },
                  { value: "Other", label: "Khác" },
                ]}
              />

              <button
                onClick={() => exportCollectorsCSV(collectors)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2",
                  "text-sm font-semibold text-emerald-800 shadow-sm",
                  "hover:bg-emerald-50 hover:border-emerald-400 transition-colors",
                )}
                type="button"
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
        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <StatCard
            title="Yêu cầu"
            value={formatNumber(kpi.totalRequests)}
            sub="Tổng số yêu cầu"
            icon={TrendingUp}
            trend={{ label: "+6.2%", positive: true }}
          />
          <StatCard
            title="Hoàn tất"
            value={formatNumber(kpi.totalCompleted)}
            sub={`Tỷ lệ: ${kpi.completionRate}%`}
            icon={BarChart3}
            trend={{ label: "+2.1%", positive: true }}
          />
          <StatCard
            title="Khối lượng"
            value={`${formatNumber(kpi.totalKg)} kg`}
            sub="Thu gom"
            icon={Leaf}
            trend={{ label: "+4.8%", positive: true }}
          />
          <StatCard
            title="CO₂ tiết kiệm"
            value={`${formatNumber(kpi.co2SavedKg)} kg`}
            sub="Ước tính"
            icon={Leaf}
            trend={{ label: "+3.5%", positive: true }}
          />
          <StatCard
            title="Collector"
            value={formatNumber(collectors.length)}
            sub="Đang hoạt động"
            icon={Users}
            trend={{ label: "-1.0%", positive: false }}
          />
          <StatCard
            title="Phản hồi TB"
            value={`${kpi.avgResponseMin} phút`}
            sub="Từ tạo yêu cầu"
            icon={TrendingUp}
            trend={{ label: "-0.8%", positive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Xu hướng theo thời gian
                </p>
                <p className="text-xs text-slate-600">Yêu cầu / Hoàn tất</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                {preset === "7d"
                  ? "7 ngày"
                  : preset === "30d"
                    ? "30 ngày"
                    : preset === "90d"
                      ? "12 tháng"
                      : "Tuỳ chọn"}
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    name="Yêu cầu"
                    stroke={CHART.lineA}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Hoàn tất"
                    stroke={CHART.lineB}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Theo khu vực</p>
                <p className="text-xs text-slate-600">
                  Khối lượng thu gom (kg)
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                {zone === "ALL" ? "All zones" : zone}
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="collectedKg" radius={[12, 12, 0, 0]}>
                    {zoneData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART.bar[idx % CHART.bar.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Cơ cấu loại rác
                </p>
                <p className="text-xs text-slate-600">
                  Tỷ trọng theo khối lượng
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                {wasteType === "ALL" ? "All types" : wasteType}
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteData}
                    dataKey="valueKg"
                    nameKey="type"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {wasteData.map((_, idx) => (
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

        {/* Table */}
        <Card className="overflow-hidden" hover={false}>
          <div className="p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Top Collectors</p>
              <p className="text-xs text-slate-600">
                Xếp hạng theo số job hoàn tất (kỳ hiện tại)
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
              {zone === "ALL" ? "Tất cả khu vực" : `Khu vực: ${zone}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Hoàn tất</th>
                  <th className="px-4 py-3">Đúng giờ</th>
                  <th className="px-4 py-3">Thời gian TB</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((c) => {
                  const good = c.onTimeRate >= 90;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-500">{c.id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {c.zone}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatNumber(c.completedJobs)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cx(
                                "h-full",
                                good ? "bg-emerald-500" : "bg-amber-500",
                              )}
                              style={{
                                width: `${Math.min(100, Math.max(0, c.onTimeRate))}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {c.onTimeRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {c.avgMinutes} phút
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cx(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border",
                            good
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200",
                          )}
                        >
                          {good ? "Ổn định" : "Cần cải thiện"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
            <span>
              Tip: dùng bộ lọc{" "}
              <span className="font-semibold text-slate-900">Khu vực</span> để
              xem hiệu suất theo từng địa bàn.
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>On-time ≥ 90%</span>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
