import React, { useMemo, useState } from "react";
import { FileDown, Leaf, TrendingUp } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  formatNumber,
} from "../ui/enterpriseUI";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

type Preset = "7d" | "30d" | "12m";
type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";

type MonthPoint = {
  label: string;
  recycledKg: number;
  co2Kg: number;
  onTime: number;
};

const MONTHS: MonthPoint[] = [
  { label: "T1", recycledKg: 18200, co2Kg: 7600, onTime: 92 },
  { label: "T2", recycledKg: 19450, co2Kg: 8150, onTime: 90 },
  { label: "T3", recycledKg: 21100, co2Kg: 8900, onTime: 91 },
  { label: "T4", recycledKg: 22650, co2Kg: 9400, onTime: 93 },
  { label: "T5", recycledKg: 23980, co2Kg: 10020, onTime: 92 },
  { label: "T6", recycledKg: 25110, co2Kg: 10480, onTime: 94 },
];

function exportCSV(points: MonthPoint[]) {
  const header = ["label", "recycledKg", "co2Kg", "onTime"];
  const lines = [
    header.join(","),
    ...points.map((p) => [p.label, p.recycledKg, p.co2Kg, p.onTime].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enterprise-reports.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EnterpriseReportsPage() {
  const [preset, setPreset] = useState<Preset>("12m");
  const [zone, setZone] = useState<Zone | "ALL">("ALL");

  const series = useMemo(() => MONTHS, []);

  const kpi = useMemo(() => {
    const totalKg = series.reduce((s, x) => s + x.recycledKg, 0);
    const totalCo2 = series.reduce((s, x) => s + x.co2Kg, 0);
    const avgOnTime = Math.round(
      series.reduce((s, x) => s + x.onTime, 0) / series.length,
    );
    return { totalKg, totalCo2, avgOnTime };
  }, [series]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Leaf className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Báo cáo tái chế
                  </h1>
                  <p className="text-sm text-slate-600">
                    Tổng hợp khối lượng tái chế, CO₂ tiết kiệm và SLA.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Dropdown
                  label="Thời gian"
                  value={preset}
                  onChange={setPreset}
                  options={[
                    { value: "7d", label: "7 ngày" },
                    { value: "30d", label: "30 ngày" },
                    { value: "12m", label: "12 tháng" },
                  ]}
                />
                <Dropdown
                  label="Khu vực"
                  value={zone}
                  onChange={setZone}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "District 1", label: "Quận 1" },
                    { value: "District 3", label: "Quận 3" },
                    { value: "District 7", label: "Quận 7" },
                    { value: "Thu Duc", label: "Thủ Đức" },
                  ]}
                />
                <Button variant="outline" onClick={() => exportCSV(series)}>
                  <FileDown className="h-4 w-4" />
                  Xuất CSV
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Badge tone="emerald">
                Tổng tái chế: {formatNumber(kpi.totalKg)} kg
              </Badge>
              <Badge tone="emerald">
                CO₂ tiết kiệm: {formatNumber(kpi.totalCo2)} kg
              </Badge>
              <Badge tone="slate">On-time TB: {kpi.avgOnTime}%</Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <CardHeader
              title="Khối lượng tái chế theo tháng"
              sub="Bar nhiều màu (recycled/CO₂) để dễ so sánh."
            />
            <div className="p-4 sm:p-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ReTooltip />
                  <Legend />
                  <Bar
                    dataKey="recycledKg"
                    fill="#10b981"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar dataKey="co2Kg" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Xu hướng SLA (On-time)"
              sub="Line chart phản ánh chất lượng vận hành."
            />
            <div className="p-4 sm:p-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[80, 100]} />
                  <ReTooltip />
                  <Line
                    type="monotone"
                    dataKey="onTime"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="co2Kg"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 sm:px-5 pb-5 text-sm text-slate-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
              Gợi ý: khi on-time giảm liên tục → tăng nhân sự theo khu vực hoặc
              tối ưu tuyến.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
