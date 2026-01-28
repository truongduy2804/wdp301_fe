// src/pages/enterprise/EnterpriseProcessingRequestsPage.tsx
import React, { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Truck, MapPinned, CheckCircle2, RotateCcw } from "lucide-react";

import {
  Card,
  Button,
  Badge,
  Dropdown,
  DateRangePill,
  EmptyState,
  cx,
  formatNumber,
  Modal,
} from "../../../components/ui/page/componentUI";

import {
  mockCollectors,
  mockRequests,
  type RequestItem,
  type CollectorItem,
  type Zone,
  ZONE_OPTIONS,
} from "../data/mockEnterprise";

type ZoneFilter = Zone | "ALL";

export default function EnterpriseProcessingRequestsPage() {
  const [collectors] = useState<CollectorItem[]>(mockCollectors);
  const [rows, setRows] = useState<RequestItem[]>(mockRequests);

  const [zone, setZone] = useState<ZoneFilter>("ALL");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  // reassign modal
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<RequestItem | null>(null);
  const [pickCollector, setPickCollector] = useState("");

  const processing = useMemo(
    () => rows.filter((r) => r.status === "PROCESSING"),
    [rows],
  );

  const filtered = useMemo(() => {
    const [a, b] = range;
    return processing.filter((r) => {
      if (zone !== "ALL" && r.zone !== zone) return false;
      if (a && b) {
        const t = dayjs(r.createdAt);
        if (t.isBefore(a.startOf("day")) || t.isAfter(b.endOf("day")))
          return false;
      }
      return true;
    });
  }, [processing, zone, range]);

  const markDone = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "COMPLETED",
              completedAt: new Date().toISOString(),
              actualKg: Math.max(1, Math.round((r.estKg ?? 1) * 1.05)),
            }
          : r,
      ),
    );
  };

  const openReassign = (r: RequestItem) => {
    setTarget(r);
    setPickCollector(r.collectorId ?? "");
    setOpen(true);
  };

  const confirmReassign = () => {
    if (!target || !pickCollector) return;
    const c = collectors.find((x) => x.id === pickCollector);
    if (!c) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === target.id
          ? { ...r, collectorId: c.id, collectorName: c.name }
          : r,
      ),
    );

    setOpen(false);
    setTarget(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Truck className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Đơn đang xử lý
                  </h1>
                  <p className="text-sm text-slate-600">
                    Theo dõi tiến độ & điều phối lại collector khi cần.
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
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="overflow-hidden" hover={false}>
          {filtered.length === 0 ? (
            <EmptyState
              title="Chưa có đơn đang xử lý"
              desc="Khi gán collector, đơn sẽ xuất hiện ở đây."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">Collector</th>
                    <th className="px-4 py-3">Ước tính</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3">Tạo lúc</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
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
                        <div className="font-semibold text-slate-900">
                          {r.collectorName ?? "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.collectorId ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatNumber(r.estKg)} kg
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => openReassign(r)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Điều phối lại
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => markDone(r.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Hoàn tất
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Reassign modal */}
      <Modal
        open={open}
        title={`Điều phối lại ${target?.id ?? ""}`}
        sub={target ? `${target.zone} • ${target.address}` : ""}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button
              variant="primary"
              onClick={confirmReassign}
              disabled={!pickCollector}
            >
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="text-sm font-semibold text-slate-800 mb-2">
          Chọn collector
        </div>
        <select
          value={pickCollector}
          onChange={(e) => setPickCollector(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
        >
          <option value="">-- Chọn --</option>
          {collectors
            .filter((c) => c.active)
            .filter((c) => (target ? c.zone === target.zone : true))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
        </select>
        <div className="mt-2 text-xs text-slate-500">
          * Chỉ hiện collector đang hoạt động và cùng khu vực.
        </div>
      </Modal>
    </div>
  );
}
