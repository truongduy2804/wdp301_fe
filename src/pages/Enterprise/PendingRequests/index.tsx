// src/pages/enterprise/EnterprisePendingRequestsPage.tsx
import React, { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  MapPinned,
  Filter,
} from "lucide-react";

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
} from "../ui/enterpriseUI";

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

export default function EnterprisePendingRequestsPage() {
  const [rows, setRows] = useState<RequestItem[]>(mockRequests);

  const [zone, setZone] = useState<ZoneFilter>("ALL");
  const [wasteType, setWasteType] = useState<WasteFilter>("ALL");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(14, "day"),
    dayjs(),
  ]);

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [target, setTarget] = useState<RequestItem | null>(null);

  const pending = useMemo(() => {
    return rows.filter((r) => r.status === "PENDING_REVIEW");
  }, [rows]);

  const filtered = useMemo(() => {
    const [a, b] = range;
    return pending.filter((r) => {
      if (zone !== "ALL" && r.zone !== zone) return false;
      if (wasteType !== "ALL" && r.wasteType !== wasteType) return false;

      if (a && b) {
        const t = dayjs(r.createdAt);
        if (t.isBefore(a.startOf("day")) || t.isAfter(b.endOf("day")))
          return false;
      }
      return true;
    });
  }, [pending, zone, wasteType, range]);

  const accept = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "WAITING_ASSIGN",
              reviewedBy: "admin",
              reviewedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  };

  const openReject = (r: RequestItem) => {
    setTarget(r);
    setRejectReason("");
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (!target) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === target.id
          ? {
              ...r,
              status: "REJECTED",
              reviewedBy: "admin",
              reviewedAt: new Date().toISOString(),
              rejectReason:
                rejectReason.trim() || "Không đủ điều kiện tiếp nhận.",
            }
          : r,
      ),
    );
    setRejectOpen(false);
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
                  <ClipboardList className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Đơn chờ duyệt
                  </h1>
                  <p className="text-sm text-slate-600">
                    Tiếp nhận hoặc từ chối yêu cầu thu gom trong phạm vi hoạt
                    động.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
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
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="overflow-hidden" hover={false}>
          {filtered.length === 0 ? (
            <EmptyState
              title="Không có đơn chờ duyệt"
              desc="Thử đổi bộ lọc hoặc khoảng ngày."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">Loại rác</th>
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
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.id}
                        </div>
                        {r.note ? (
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {r.note}
                          </div>
                        ) : null}
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
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            onClick={() => accept(r.id)}
                            className="!rounded-xl !px-3 !py-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => openReject(r)}
                            className="!rounded-xl !px-3 !py-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
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

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        title={`Từ chối đơn ${target?.id ?? ""}`}
        sub="Nhập lý do để lưu vào lịch sử duyệt."
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <label className="text-sm font-semibold text-slate-800">Lý do</label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-300"
          placeholder="Ví dụ: Ngoài phạm vi, loại rác không hỗ trợ, thiếu thông tin..."
        />
      </Modal>
    </div>
  );
}
