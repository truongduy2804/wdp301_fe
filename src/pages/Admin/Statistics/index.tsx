// src/pages/Admin/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  BarChart3,
  CalendarDays,
  ShieldCheck,
  Users,
  Activity,
  Bug,
  MessageSquareWarning,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import {
  cx,
  formatNumber,
  Card,
  StatCard,
  Dropdown,
  DateRangePill,
  Badge,
} from "@/components/ui/page/componentUI";

/* ===================== Types ===================== */
type DatePreset = "7d" | "30d" | "90d" | "custom";
type Service = "ALL" | "API" | "Auth" | "Portal" | "Worker";

type DailyPoint = {
  date: string;
  activeUsers: number;
  requests: number;
  errors: number;
};

type ServicePoint = {
  service: Exclude<Service, "ALL">;
  uptime: number; // %
  latencyMs: number;
  errorRate: number; // %
};

type ComplaintSlice = { name: string; value: number };

/* ===================== Mock Data ===================== */
const DAILY_7D: DailyPoint[] = [
  { date: "01/12", activeUsers: 1240, requests: 32800, errors: 122 },
  { date: "02/12", activeUsers: 1310, requests: 35120, errors: 138 },
  { date: "03/12", activeUsers: 1425, requests: 38210, errors: 144 },
  { date: "04/12", activeUsers: 1390, requests: 36540, errors: 131 },
  { date: "05/12", activeUsers: 1510, requests: 40980, errors: 162 },
  { date: "06/12", activeUsers: 1472, requests: 39210, errors: 150 },
  { date: "07/12", activeUsers: 1620, requests: 43110, errors: 171 },
];

const DAILY_30D: DailyPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const d = i + 1;
  const base = 1200 + (i % 7) * 70;
  const req = 32000 + (i % 9) * 1500 + (i % 3) * 700;
  const err = 120 + (i % 8) * 10;
  return {
    date: `${String(d).padStart(2, "0")}/12`,
    activeUsers: base,
    requests: req,
    errors: err,
  };
});

const DAILY_90D: DailyPoint[] = Array.from({ length: 12 }).map((_, i) => {
  const month = i + 1;
  const users = 32000 + i * 1400 + (i % 2) * 900;
  const req = 920000 + i * 52000 + (i % 3) * 14000;
  const err = 3200 + i * 110 + (i % 4) * 80;
  return {
    date: `M${month}`,
    activeUsers: users,
    requests: req,
    errors: err,
  };
});

const SERVICES: ServicePoint[] = [
  { service: "API", uptime: 99.96, latencyMs: 180, errorRate: 0.42 },
  { service: "Auth", uptime: 99.91, latencyMs: 210, errorRate: 0.55 },
  { service: "Portal", uptime: 99.98, latencyMs: 140, errorRate: 0.31 },
  { service: "Worker", uptime: 99.87, latencyMs: 260, errorRate: 0.72 },
];

const COMPLAINTS: ComplaintSlice[] = [
  { name: "Mới", value: 18 },
  { name: "Đang xử lý", value: 32 },
  { name: "Chờ phản hồi", value: 12 },
  { name: "Đã giải quyết", value: 64 },
];

const CHART = {
  lineA: "#10b981",
  lineB: "#0ea5e9",
  lineC: "#f59e0b",
  bar: ["#10b981", "#22c55e", "#14b8a6", "#0ea5e9"],
  pie: ["#0ea5e9", "#10b981", "#f59e0b", "#a855f7"],
};

/* ===================== Page ===================== */
export default function AdminDashboard() {
  const [preset, setPreset] = useState<DatePreset>("7d");
  const [service, setService] = useState<Service>("ALL");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const daily = useMemo(() => {
    if (preset === "7d") return DAILY_7D;
    if (preset === "30d") return DAILY_30D;
    if (preset === "90d") return DAILY_90D;
    return DAILY_30D;
  }, [preset]);

  useEffect(() => {
    const today = dayjs();
    if (preset === "7d") setRange([today.subtract(6, "day"), today]);
    if (preset === "30d") setRange([today.subtract(29, "day"), today]);
    if (preset === "90d") setRange([today.subtract(11, "month"), today]);
  }, [preset]);

  const kpi = useMemo(() => {
    const totalRequests = daily.reduce((s, x) => s + x.requests, 0);
    const totalErrors = daily.reduce((s, x) => s + x.errors, 0);
    const avgActiveUsers = Math.round(
      daily.reduce((s, x) => s + x.activeUsers, 0) / Math.max(1, daily.length),
    );
    const errRate = totalRequests
      ? Math.round((totalErrors / totalRequests) * 10000) / 100
      : 0;

    const usersTotal = 12480; // mock
    const rolesCount = 6; // mock
    const complaintsOpen = COMPLAINTS[0].value + COMPLAINTS[1].value; // mock
    const uptimeAvg =
      Math.round(
        (SERVICES.reduce((s, x) => s + x.uptime, 0) / SERVICES.length) * 100,
      ) / 100;

    return {
      totalRequests,
      totalErrors,
      errRate,
      avgActiveUsers,
      usersTotal,
      rolesCount,
      complaintsOpen,
      uptimeAvg,
    };
  }, [daily]);

  const subtitle = useMemo(() => {
    const [a, b] = range;
    if (!a || !b) return "Tổng quan hoạt động hệ thống theo bộ lọc.";
    return `Dữ liệu từ ${a.format("DD/MM/YYYY")} đến ${b.format("DD/MM/YYYY")}`;
  }, [range]);

  const serviceData = useMemo(() => {
    if (service === "ALL") return SERVICES;
    return SERVICES.filter((s) => s.service === service);
  }, [service]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Tổng quan hệ thống
                  </h1>
                  <p className="text-sm text-slate-600">{subtitle}</p>
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
                  { value: "90d", label: "12 tháng (gộp)" },
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

              <Dropdown<Service>
                label="Dịch vụ"
                value={service}
                onChange={setService}
                icon={Filter}
                options={[
                  { value: "ALL", label: "Tất cả" },
                  { value: "API", label: "API" },
                  { value: "Auth", label: "Auth" },
                  { value: "Portal", label: "Portal" },
                  { value: "Worker", label: "Worker" },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <StatCard
            title="Active users"
            value={formatNumber(kpi.avgActiveUsers)}
            sub="Trung bình / ngày"
            icon={Users}
            trend={{ label: "+3.2%", positive: true }}
          />
          <StatCard
            title="Requests"
            value={formatNumber(kpi.totalRequests)}
            sub="Tổng request"
            icon={Activity}
            trend={{ label: "+5.1%", positive: true }}
          />
          <StatCard
            title="Errors"
            value={formatNumber(kpi.totalErrors)}
            sub={`Tỷ lệ: ${kpi.errRate}%`}
            icon={Bug}
            trend={{ label: "+0.2%", positive: false }}
          />
          <StatCard
            title="Uptime"
            value={`${kpi.uptimeAvg}%`}
            sub="Trung bình service"
            icon={ShieldCheck}
            trend={{ label: "+0.01%", positive: true }}
          />
          <StatCard
            title="Người dùng"
            value={formatNumber(kpi.usersTotal)}
            sub="Tổng tài khoản"
            icon={Users}
            trend={{ label: "+1.0%", positive: true }}
          />
          <StatCard
            title="Khiếu nại mở"
            value={formatNumber(kpi.complaintsOpen)}
            sub="Mới + đang xử lý"
            icon={MessageSquareWarning}
            trend={{ label: "-2.4%", positive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Lưu lượng & lỗi theo thời gian
                </p>
                <p className="text-xs text-slate-600">Requests / Errors</p>
              </div>
              <Badge tone="emerald">
                {preset === "7d"
                  ? "7 ngày"
                  : preset === "30d"
                    ? "30 ngày"
                    : preset === "90d"
                      ? "12 tháng"
                      : "Tuỳ chọn"}
              </Badge>
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
                    name="Requests"
                    stroke={CHART.lineA}
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    name="Errors"
                    stroke={CHART.lineC}
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
                <p className="text-sm font-bold text-slate-900">
                  Sức khoẻ dịch vụ
                </p>
                <p className="text-xs text-slate-600">Latency (ms)</p>
              </div>
              <Badge tone="slate">
                {service === "ALL" ? "All services" : service}
              </Badge>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="latencyMs" radius={[12, 12, 0, 0]}>
                    {serviceData.map((_, idx) => (
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
                  Trạng thái khiếu nại
                </p>
                <p className="text-xs text-slate-600">
                  Phân bổ theo trạng thái
                </p>
              </div>
              <Badge tone="slate">All</Badge>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COMPLAINTS}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {COMPLAINTS.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART.pie[idx % CHART.pie.length]}
                      />
                    ))}
                  </Pie>
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
      </div>
    </div>
  );
}
