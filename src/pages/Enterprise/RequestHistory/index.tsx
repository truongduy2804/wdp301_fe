// src/pages/enterprise/EnterpriseRequestHistoryPage.tsx
import React, { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { History, MapPinned, Filter, Download } from "lucide-react";

import {
  Card,
  Badge,
  Dropdown,
  DateRangePill,
  EmptyState,
  cx,
  formatNumber,
  Button,
} from "../../../components/ui/page/componentUI";

import {
  mockRequests,
  type RequestItem,
  type Zone,
  type WasteType,
  ZONE_OPTIONS,
  WASTE_OPTIONS,
} from "../data/mockEnterprise";

type ZoneFilter = Zone | "ALL";
type WasteFilter = WasteType | "ALL";

function exportHistoryCSV(rows: RequestItem[]) {
  const header = [
    "id",
    "zone",
    "wasteType",
    "estKg",
    "actualKg",
    "collector",
    "createdAt",
    "completedAt",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        `"${r.zone}"`,
        `"${r.wasteType}"`,
        r.estKg,
        r.actualKg ?? "",
        `"${r.collectorName ?? ""}"`,
        `"${r.createdAt}"`,
        `"${r.completedAt ?? ""}"`,
      ].join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enterprise-history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EnterpriseRequestHistoryPage() {
  const [rows] = useState<RequestItem[]>(mockRequests);
  const [zone, setZone] = useState<ZoneFilter>("ALL");
  const [wasteType, setWasteType] = useState<WasteFilter>("ALL");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const completed = useMemo(
    () => rows.filter((r) => r.status === "COMPLETED"),
    [rows],
  );

  const filtered = useMemo(() => {
    const [a, b] = range;
    return completed.filter((r) => {
      if (zone !== "ALL" && r.zone !== zone) return false;
      if (wasteType !== "ALL" && r.wasteType !== wasteType) return false;

      if (a && b) {
        const t = dayjs(r.completedAt ?? r.createdAt);
        if (t.isBefore(a.startOf("day")) || t.isAfter(b.endOf("day")))
          return false;
      }
      return true;
    });
  }, [completed, zone, wasteType, range]);

  const totalKg = useMemo(
    () => filtered.reduce((s, r) => s + (r.actualKg ?? r.estKg ?? 0), 0),
    [filtered],
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <History className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Lịch sử đơn đã hoàn tất
                  </h1>
                  <p className="text-sm text-slate-600">
                    Tổng hợp đơn đã xử lý xong theo khu vực & loại rác.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dropdown<ZoneFilter>
                label="Khu vực"
                value={zone}
                onChange={setZone}
                icon={MapPinned}
                options={ZONE_OPTIONS}
              />
              <Dropdown<WasteFilter>
                label="Loại rác"
                value={wasteType}
                onChange={setWasteType}
                icon={Filter}
                options={WASTE_OPTIONS}
              />

              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm",
                  "hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors",
                )}
              >
                <span className="text-xs font-semibold text-slate-600">
                  Khoảng ngày
                </span>
                <DateRangePill
                  value={range}
                  onChange={setRange}
                  className={cx(
                    "!border-0 !shadow-none !bg-transparent !p-0 hover:!bg-transparent",
                  )}
                />
              </div>

              <Badge tone="emerald">{formatNumber(filtered.length)} đơn</Badge>
              <Badge tone="slate">{formatNumber(totalKg)} kg</Badge>

              <Button
                variant="outline"
                onClick={() => exportHistoryCSV(filtered)}
              >
                <Download className="h-4 w-4" />
                Xuất CSV
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="overflow-hidden" hover={false}>
          {filtered.length === 0 ? (
            <EmptyState
              title="Chưa có dữ liệu lịch sử"
              desc="Thử đổi bộ lọc hoặc khoảng ngày."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">Loại rác</th>
                    <th className="px-4 py-3">Ước tính</th>
                    <th className="px-4 py-3">Thực tế</th>
                    <th className="px-4 py-3">Collector</th>
                    <th className="px-4 py-3">Hoàn tất</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.zone}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="slate">{r.wasteType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatNumber(r.estKg)} kg
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatNumber(r.actualKg ?? r.estKg)} kg
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.collectorName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {dayjs(r.completedAt ?? r.createdAt).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
