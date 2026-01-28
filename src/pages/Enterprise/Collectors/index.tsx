// src/pages/enterprise/EnterpriseCollectorsPage.tsx
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Users,
  UserCheck,
  MapPinned,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  Button,
  Badge,
  Dropdown,
  EmptyState,
  cx,
  formatNumber,
  Modal,
} from "../../../components/ui/page/componentUI";

import {
  mockCollectors,
  mockRequests,
  type CollectorItem,
  type RequestItem,
  type Zone,
  ZONE_OPTIONS,
} from "../data/mockEnterprise";

type ZoneFilter = Zone | "ALL";
type StaffFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function EnterpriseCollectorsPage() {
  const [collectors, setCollectors] = useState<CollectorItem[]>(mockCollectors);
  const [requests, setRequests] = useState<RequestItem[]>(mockRequests);

  const [zone, setZone] = useState<ZoneFilter>("ALL");
  const [staff, setStaff] = useState<StaffFilter>("ALL");

  // assign modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [pickCollector, setPickCollector] = useState<string>("");
  const [targetReq, setTargetReq] = useState<RequestItem | null>(null);

  const staffOptions = [
    { value: "ALL" as const, label: "Tất cả" },
    { value: "ACTIVE" as const, label: "Đang hoạt động" },
    { value: "INACTIVE" as const, label: "Tạm dừng" },
  ];

  const waitingAssign = useMemo(
    () => requests.filter((r) => r.status === "WAITING_ASSIGN"),
    [requests],
  );

  const filteredCollectors = useMemo(() => {
    return collectors.filter((c) => {
      if (zone !== "ALL" && c.zone !== zone) return false;
      if (staff === "ACTIVE" && !c.active) return false;
      if (staff === "INACTIVE" && c.active) return false;
      return true;
    });
  }, [collectors, zone, staff]);

  const openAssign = (r: RequestItem) => {
    setTargetReq(r);
    setPickCollector("");
    setAssignOpen(true);
  };

  const confirmAssign = () => {
    if (!targetReq || !pickCollector) return;
    const c = collectors.find((x) => x.id === pickCollector);
    if (!c) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === targetReq.id
          ? {
              ...r,
              status: "PROCESSING",
              collectorId: c.id,
              collectorName: c.name,
            }
          : r,
      ),
    );

    setAssignOpen(false);
    setTargetReq(null);
  };

  const toggleActive = (id: string) => {
    setCollectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const collectorLoad = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => {
      if (r.status === "PROCESSING" && r.collectorId) {
        map.set(r.collectorId, (map.get(r.collectorId) ?? 0) + 1);
      }
    });
    return map;
  }, [requests]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Quản lý nhân viên thu gom
                  </h1>
                  <p className="text-sm text-slate-600">
                    Gán & điều phối yêu cầu thu gom cho Collector theo khu vực.
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
              <Dropdown<StaffFilter>
                label="Trạng thái"
                value={staff}
                onChange={setStaff}
                icon={UserCheck}
                options={staffOptions}
              />
              <Badge tone="emerald">
                {formatNumber(filteredCollectors.length)} collector
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
        {/* Waiting assign */}
        <Card className="p-4" hover={false}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Đơn chờ gán</p>
              <p className="text-xs text-slate-600">
                Đơn đã duyệt nhưng chưa điều phối collector.
              </p>
            </div>
            <Badge tone="amber">{formatNumber(waitingAssign.length)} đơn</Badge>
          </div>

          {waitingAssign.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title="Không có đơn chờ gán"
                desc="Tất cả đơn đã được điều phối."
              />
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">Loại rác</th>
                    <th className="px-4 py-3">Ước tính</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3 text-right">Gán</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingAssign.map((r) => (
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
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.address}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            onClick={() => openAssign(r)}
                          >
                            <ArrowRight className="h-4 w-4" />
                            Chọn collector
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

        {/* Collectors */}
        <Card className="overflow-hidden" hover={false}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Danh sách Collector
              </p>
              <p className="text-xs text-slate-600">
                Theo dõi hiệu suất & trạng thái hoạt động.
              </p>
            </div>
            <Badge tone="slate">
              {formatNumber(
                requests.filter((r) => r.status === "PROCESSING").length,
              )}{" "}
              đang xử lý
            </Badge>
          </div>

          {filteredCollectors.length === 0 ? (
            <EmptyState
              title="Không có collector phù hợp"
              desc="Thử đổi bộ lọc khu vực / trạng thái."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3">Collector</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3">On-time</th>
                    <th className="px-4 py-3">TB (phút)</th>
                    <th className="px-4 py-3">Load</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollectors.map((c) => {
                    const load = collectorLoad.get(c.id) ?? 0;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {c.id}
                            {c.phone ? ` • ${c.phone}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {c.zone}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={c.onTimeRate >= 90 ? "emerald" : "amber"}
                          >
                            {c.onTimeRate}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {c.avgMinutes}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={load >= 3 ? "amber" : "slate"}>
                            {load} đơn
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant={c.active ? "outline" : "danger"}
                              onClick={() => toggleActive(c.id)}
                            >
                              {c.active ? "Đang hoạt động" : "Tạm dừng"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Assign modal */}
      <Modal
        open={assignOpen}
        title={`Gán collector cho ${targetReq?.id ?? ""}`}
        sub={targetReq ? `${targetReq.zone} • ${targetReq.address}` : ""}
        onClose={() => setAssignOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Huỷ
            </Button>
            <Button
              variant="primary"
              onClick={confirmAssign}
              disabled={!pickCollector}
            >
              Xác nhận gán
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Ước tính</span>
              <span className="font-bold text-slate-900">
                {formatNumber(targetReq?.estKg ?? 0)} kg
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Tạo lúc:{" "}
              {targetReq
                ? dayjs(targetReq.createdAt).format("DD/MM/YYYY HH:mm")
                : "-"}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">
              Chọn collector
            </div>
            <select
              value={pickCollector}
              onChange={(e) => setPickCollector(e.target.value)}
              className={cx(
                "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                "outline-none focus:border-emerald-300",
              )}
            >
              <option value="">-- Chọn --</option>
              {collectors
                .filter((c) => c.active)
                .filter((c) => (targetReq ? c.zone === targetReq.zone : true))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
            </select>
            <div className="mt-2 text-xs text-slate-500">
              * Gợi ý: chỉ hiện collector đang hoạt động và cùng khu vực với
              đơn.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
