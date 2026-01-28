// src/pages/Admin/SystemMonitor.tsx
import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Filter,
  Globe,
  Server,
} from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";

import {
  cx,
  Card,
  CardHeader,
  StatCard,
  Dropdown,
  DateRangePill,
  Badge,
} from "@/components/ui/page/componentUI";

type DatePreset = "24h" | "7d" | "30d" | "custom";
type Service = "ALL" | "API" | "Auth" | "Portal" | "Worker";

type HealthRow = {
  id: string;
  name: Exclude<Service, "ALL">;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  uptime: number; // %
  latencyMs: number;
  errorRate: number; // %
  lastIncident: string;
};

const HEALTH: HealthRow[] = [
  {
    id: "SVC-API",
    name: "API",
    status: "HEALTHY",
    uptime: 99.96,
    latencyMs: 180,
    errorRate: 0.42,
    lastIncident: "—",
  },
  {
    id: "SVC-AUTH",
    name: "Auth",
    status: "DEGRADED",
    uptime: 99.91,
    latencyMs: 240,
    errorRate: 0.78,
    lastIncident: "05/12 14:22",
  },
  {
    id: "SVC-PORTAL",
    name: "Portal",
    status: "HEALTHY",
    uptime: 99.98,
    latencyMs: 140,
    errorRate: 0.31,
    lastIncident: "—",
  },
  {
    id: "SVC-WORKER",
    name: "Worker",
    status: "HEALTHY",
    uptime: 99.87,
    latencyMs: 260,
    errorRate: 0.72,
    lastIncident: "02/12 09:10",
  },
];

export default function AdminSystemMonitor() {
  const [preset, setPreset] = useState<DatePreset>("24h");
  const [service, setService] = useState<Service>("ALL");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(1, "day"),
    dayjs(),
  ]);

  const rows = useMemo(() => {
    if (service === "ALL") return HEALTH;
    return HEALTH.filter((r) => r.name === service);
  }, [service]);

  const kpi = useMemo(() => {
    const uptimeAvg =
      Math.round(
        (rows.reduce((s, x) => s + x.uptime, 0) / Math.max(1, rows.length)) *
          100,
      ) / 100;
    const latencyAvg = Math.round(
      rows.reduce((s, x) => s + x.latencyMs, 0) / Math.max(1, rows.length),
    );
    const errAvg =
      Math.round(
        (rows.reduce((s, x) => s + x.errorRate, 0) / Math.max(1, rows.length)) *
          100,
      ) / 100;
    const degraded = rows.filter((x) => x.status !== "HEALTHY").length;

    return { uptimeAvg, latencyAvg, errAvg, degraded };
  }, [rows]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Server className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Giám sát hệ thống
                  </h1>
                  <p className="text-sm text-slate-600">
                    Theo dõi uptime, latency, error-rate theo dịch vụ.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dropdown<DatePreset>
                label="Thời gian"
                value={preset}
                onChange={(v) => {
                  setPreset(v);
                  const now = dayjs();
                  if (v === "24h") setRange([now.subtract(1, "day"), now]);
                  if (v === "7d") setRange([now.subtract(6, "day"), now]);
                  if (v === "30d") setRange([now.subtract(29, "day"), now]);
                }}
                icon={CalendarDays}
                options={[
                  { value: "24h", label: "24 giờ" },
                  { value: "7d", label: "7 ngày" },
                  { value: "30d", label: "30 ngày" },
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Uptime"
            value={`${kpi.uptimeAvg}%`}
            sub="Trung bình"
            icon={CheckCircle2}
            trend={{ label: "+0.01%", positive: true }}
          />
          <StatCard
            title="Latency"
            value={`${kpi.latencyAvg} ms`}
            sub="Trung bình"
            icon={Cpu}
            trend={{ label: "-3.2%", positive: true }}
          />
          <StatCard
            title="Error rate"
            value={`${kpi.errAvg}%`}
            sub="Trung bình"
            icon={AlertTriangle}
            trend={{ label: "+0.2%", positive: false }}
          />
          <StatCard
            title="Cảnh báo"
            value={`${kpi.degraded}`}
            sub="Degraded/Down"
            icon={Activity}
            trend={{ label: "—", positive: true }}
          />
        </div>

        <Card className="overflow-hidden" hover={false}>
          <CardHeader
            title="Service health"
            sub="Danh sách dịch vụ và tình trạng hiện tại"
            right={
              <div className="inline-flex items-center gap-2">
                <Badge tone="slate">
                  {service === "ALL" ? "All services" : service}
                </Badge>
                <Badge tone="emerald">
                  {preset === "24h"
                    ? "24h"
                    : preset === "7d"
                      ? "7d"
                      : preset === "30d"
                        ? "30d"
                        : "custom"}
                </Badge>
              </div>
            }
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Uptime</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Error</th>
                  <th className="px-4 py-3">Last incident</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tone =
                    r.status === "HEALTHY"
                      ? "emerald"
                      : r.status === "DEGRADED"
                        ? "amber"
                        : "rose";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-500">{r.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={tone as any}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {r.uptime}%
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.latencyMs} ms
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.errorRate}%
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.lastIncident}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-700" />
              Tip: nếu Auth degraded, kiểm tra error-rate và latency trước.
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Healthy</span>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
