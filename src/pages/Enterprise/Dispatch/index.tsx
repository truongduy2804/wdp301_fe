import React, { useMemo, useState } from "react";
import {
  MapPinned,
  Users,
  Wand2,
  Clock,
  Truck,
  CheckCircle2,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  EmptyState,
  cx,
  formatNumber,
  Modal,
} from "../ui/enterpriseUI";

type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type RequestStatus =
  | "NEW"
  | "VERIFIED"
  | "SCHEDULED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

type RequestItem = {
  id: string;
  citizenName: string;
  phone: string;
  address: string;
  zone: Zone;
  wasteType: WasteType;
  estKg: number;
  createdAt: string;
  pickupWindow?: string;
  priority: Priority;
  status: RequestStatus;
  assigneeId?: string;
};

type Collector = {
  id: string;
  name: string;
  zone: Zone;
  online: boolean;
  load: number; // số job đang giữ
};

const ZONES: Zone[] = ["District 1", "District 3", "District 7", "Thu Duc"];

const COLLECTORS: Collector[] = [
  { id: "C-001", name: "Nguyễn Văn A", zone: "Thu Duc", online: true, load: 3 },
  {
    id: "C-002",
    name: "Trần Thị B",
    zone: "District 7",
    online: true,
    load: 2,
  },
  { id: "C-003", name: "Lê Văn C", zone: "District 1", online: false, load: 1 },
  {
    id: "C-004",
    name: "Phạm Thị D",
    zone: "District 3",
    online: true,
    load: 4,
  },
];

const MOCK: RequestItem[] = [
  {
    id: "RQ-1201",
    citizenName: "Xanh C. T. T. C.",
    phone: "0901***222",
    address: "12 Nguyễn Huệ, P.Bến Nghé",
    zone: "District 1",
    wasteType: "Plastic",
    estKg: 12,
    createdAt: "08:42 • 18/01",
    priority: "HIGH",
    status: "NEW",
  },
  {
    id: "RQ-1202",
    citizenName: "Ngọc H.",
    phone: "0908***111",
    address: "45 Lê Văn Sỹ",
    zone: "District 3",
    wasteType: "Paper",
    estKg: 7,
    createdAt: "09:05 • 18/01",
    priority: "MEDIUM",
    status: "VERIFIED",
  },
  {
    id: "RQ-1203",
    citizenName: "Minh K.",
    phone: "0933***888",
    address: "KDC Phú Mỹ Hưng",
    zone: "District 7",
    wasteType: "Organic",
    estKg: 18,
    createdAt: "09:12 • 18/01",
    priority: "LOW",
    status: "SCHEDULED",
    pickupWindow: "14:00 - 16:00",
  },
  {
    id: "RQ-1204",
    citizenName: "Hà N.",
    phone: "0909***999",
    address: "Đường 12, Linh Trung",
    zone: "Thu Duc",
    wasteType: "Metal",
    estKg: 5,
    createdAt: "09:25 • 18/01",
    priority: "MEDIUM",
    status: "ASSIGNED",
    pickupWindow: "10:30 - 12:00",
    assigneeId: "C-001",
  },
];

function toneByStatus(s: RequestStatus) {
  if (s === "NEW") return "blue";
  if (s === "VERIFIED") return "emerald";
  if (s === "SCHEDULED") return "amber";
  if (s === "ASSIGNED") return "slate";
  if (s === "IN_PROGRESS") return "blue";
  if (s === "DONE") return "emerald";
  return "rose";
}

function labelStatus(s: RequestStatus) {
  switch (s) {
    case "NEW":
      return "Mới";
    case "VERIFIED":
      return "Đã xác minh";
    case "SCHEDULED":
      return "Đã lên lịch";
    case "ASSIGNED":
      return "Đã gán";
    case "IN_PROGRESS":
      return "Đang thu gom";
    case "DONE":
      return "Hoàn tất";
    case "CANCELLED":
      return "Hủy";
  }
}

export default function EnterpriseDispatchPage() {
  const [zone, setZone] = useState<Zone | "ALL">("ALL");
  const [status, setStatus] = useState<RequestStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState<RequestItem[]>(MOCK);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<RequestItem | null>(null);
  const [assignCollector, setAssignCollector] = useState<string>("");
  const [assignWindow, setAssignWindow] = useState<string>("10:00 - 12:00");

  const collectors = useMemo(() => {
    const base =
      zone === "ALL" ? COLLECTORS : COLLECTORS.filter((c) => c.zone === zone);
    return base;
  }, [zone]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (zone === "ALL" ? true : r.zone === zone))
      .filter((r) => (status === "ALL" ? true : r.status === status))
      .filter((r) => {
        const s = `${r.id} ${r.citizenName} ${r.address}`.toLowerCase();
        return s.includes(q.trim().toLowerCase());
      });
  }, [rows, zone, status, q]);

  const kpi = useMemo(() => {
    const by = (s: RequestStatus) =>
      filtered.filter((x) => x.status === s).length;
    return {
      incoming: by("NEW"),
      verified: by("VERIFIED"),
      scheduled: by("SCHEDULED"),
      assigned: by("ASSIGNED") + by("IN_PROGRESS"),
      done: by("DONE"),
    };
  }, [filtered]);

  const zoneCards = useMemo(() => {
    const list = ZONES.map((z) => {
      const inZone = rows.filter((r) => r.zone === z);
      const backlog = inZone.filter((r) =>
        ["NEW", "VERIFIED", "SCHEDULED"].includes(r.status),
      ).length;
      const active = COLLECTORS.filter((c) => c.zone === z && c.online).length;
      const assigned = inZone.filter((r) =>
        ["ASSIGNED", "IN_PROGRESS"].includes(r.status),
      ).length;
      return { z, backlog, active, assigned, total: inZone.length };
    });
    return list;
  }, [rows]);

  function openAssign(r: RequestItem) {
    setAssignTarget(r);
    setAssignCollector("");
    setAssignWindow(r.pickupWindow || "10:00 - 12:00");
    setAssignOpen(true);
  }

  function doVerify(rid: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === rid ? { ...r, status: "VERIFIED" } : r)),
    );
  }

  function doSchedule(rid: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rid
          ? {
              ...r,
              status: "SCHEDULED",
              pickupWindow: r.pickupWindow ?? "14:00 - 16:00",
            }
          : r,
      ),
    );
  }

  function doAutoAssign() {
    // auto assign: chọn collector online cùng zone, load thấp nhất
    setRows((prev) =>
      prev.map((r) => {
        if (!["SCHEDULED", "VERIFIED"].includes(r.status)) return r;
        const pool = COLLECTORS.filter(
          (c) => c.online && c.zone === r.zone,
        ).sort((a, b) => a.load - b.load);
        if (!pool.length) return r;
        return {
          ...r,
          status: "ASSIGNED",
          assigneeId: pool[0].id,
          pickupWindow: r.pickupWindow ?? "10:00 - 12:00",
        };
      }),
    );
  }

  function confirmAssign() {
    if (!assignTarget) return;
    if (!assignCollector) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === assignTarget.id
          ? {
              ...r,
              status: "ASSIGNED",
              assigneeId: assignCollector,
              pickupWindow: assignWindow,
            }
          : r,
      ),
    );

    setAssignOpen(false);
  }

  const columns = useMemo(() => {
    const col = [
      { key: "NEW" as const, title: "Mới" },
      { key: "VERIFIED" as const, title: "Đã xác minh" },
      { key: "SCHEDULED" as const, title: "Đã lên lịch" },
      { key: "ASSIGNED" as const, title: "Đang xử lý" },
      { key: "DONE" as const, title: "Hoàn tất" },
    ];

    const map: Record<string, RequestItem[]> = {
      NEW: filtered.filter((r) => r.status === "NEW"),
      VERIFIED: filtered.filter((r) => r.status === "VERIFIED"),
      SCHEDULED: filtered.filter((r) => r.status === "SCHEDULED"),
      ASSIGNED: filtered.filter(
        (r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS",
      ),
      DONE: filtered.filter((r) => r.status === "DONE"),
    };

    return { col, map };
  }, [filtered]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                    <MapPinned className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                      Điều phối theo khu vực
                    </h1>
                    <p className="text-sm text-slate-600">
                      Nhận yêu cầu từ citizen → xác minh → lên lịch → gán
                      collector → theo dõi thực thi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo mã / tên / địa chỉ..."
                    className="w-[min(92vw,320px)] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-400"
                  />
                </div>

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

                <Dropdown
                  label="Trạng thái"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "ALL", label: "Tất cả" },
                    { value: "NEW", label: "Mới" },
                    { value: "VERIFIED", label: "Đã xác minh" },
                    { value: "SCHEDULED", label: "Đã lên lịch" },
                    { value: "ASSIGNED", label: "Đã gán" },
                    { value: "IN_PROGRESS", label: "Đang thu gom" },
                    { value: "DONE", label: "Hoàn tất" },
                    { value: "CANCELLED", label: "Hủy" },
                  ]}
                />

                <Button variant="outline" onClick={doAutoAssign}>
                  <Wand2 className="h-4 w-4" />
                  Auto-assign
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Badge tone="blue">Mới: {kpi.incoming}</Badge>
              <Badge tone="emerald">Xác minh: {kpi.verified}</Badge>
              <Badge tone="amber">Lên lịch: {kpi.scheduled}</Badge>
              <Badge tone="slate">Đang xử lý: {kpi.assigned}</Badge>
              <Badge tone="emerald">Hoàn tất: {kpi.done}</Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-1">
            <CardHeader
              title="Tổng quan khu vực"
              sub="Backlog / Collector online / Job đang xử lý"
            />
            <div className="px-4 sm:px-5 pb-5 space-y-3">
              {zoneCards.map((z) => (
                <div
                  key={z.z}
                  className={cx(
                    "rounded-2xl border border-slate-200 p-4",
                    "hover:shadow-md hover:border-slate-300 transition-all",
                    zone !== "ALL" && zone === z.z
                      ? "bg-emerald-50/40"
                      : "bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {z.z}
                      </div>
                      <div className="text-sm text-slate-600">
                        Tổng: {formatNumber(z.total)} yêu cầu
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setZone((z.z as any) ?? "ALL")}
                    >
                      Lọc
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                      <div className="text-xs font-semibold text-slate-500">
                        Backlog
                      </div>
                      <div className="font-bold text-slate-900">
                        {z.backlog}
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2">
                      <div className="text-xs font-semibold text-emerald-700">
                        Online
                      </div>
                      <div className="font-bold text-emerald-900">
                        {z.active}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-2">
                      <div className="text-xs font-semibold text-slate-500">
                        Đang xử lý
                      </div>
                      <div className="font-bold text-slate-900">
                        {z.assigned}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-bold text-slate-900">
                  Bản đồ (placeholder)
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Sau này nối Mapbox/Google Map: heatmap yêu cầu + vị trí
                  collectors + route.
                </div>
                <div className="mt-3 h-40 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-400">
                  Map preview
                </div>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader
              title="Bảng điều phối"
              sub="Mỗi cột là một giai đoạn xử lý — thao tác nhanh ngay trên thẻ."
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="slate">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Collector: {collectors.length}
                  </Badge>
                </div>
              }
            />

            <div className="px-4 sm:px-5 pb-5">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {columns.col.map((c) => (
                  <div
                    key={c.key}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-700">
                        {c.title}
                      </div>
                      <Badge tone="slate" className="px-2 py-0.5">
                        {columns.map[c.key].length}
                      </Badge>
                    </div>

                    <div className="p-2 space-y-2 max-h-[520px] overflow-auto">
                      {columns.map[c.key].length ? (
                        columns.map[c.key].map((r) => (
                          <div
                            key={r.id}
                            className="rounded-2xl border border-slate-200 bg-white p-3 hover:shadow-md hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {r.id}
                                </div>
                                <div className="text-xs text-slate-600 truncate">
                                  {r.address}
                                </div>
                              </div>
                              <Badge tone={toneByStatus(r.status) as any}>
                                {labelStatus(r.status)}
                              </Badge>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <Badge tone="slate">{r.zone}</Badge>
                              <Badge tone="emerald">{r.wasteType}</Badge>
                              <Badge tone="amber">{r.estKg}kg</Badge>
                              <Badge
                                tone={
                                  r.priority === "HIGH"
                                    ? "rose"
                                    : r.priority === "MEDIUM"
                                      ? "amber"
                                      : "slate"
                                }
                              >
                                Ưu tiên: {r.priority}
                              </Badge>
                            </div>

                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              {r.createdAt}
                              {r.pickupWindow ? (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <Truck className="h-3.5 w-3.5" />
                                  {r.pickupWindow}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {r.status === "NEW" ? (
                                <Button
                                  variant="outline"
                                  onClick={() => doVerify(r.id)}
                                >
                                  Xác minh
                                </Button>
                              ) : null}

                              {r.status === "VERIFIED" ? (
                                <Button
                                  variant="outline"
                                  onClick={() => doSchedule(r.id)}
                                >
                                  Lên lịch
                                </Button>
                              ) : null}

                              {["SCHEDULED", "VERIFIED"].includes(r.status) ? (
                                <Button onClick={() => openAssign(r)}>
                                  Gán collector
                                </Button>
                              ) : null}

                              {r.status === "ASSIGNED" ? (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setRows((p) =>
                                      p.map((x) =>
                                        x.id === r.id
                                          ? { ...x, status: "IN_PROGRESS" }
                                          : x,
                                      ),
                                    )
                                  }
                                >
                                  Bắt đầu
                                </Button>
                              ) : null}

                              {r.status === "IN_PROGRESS" ? (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setRows((p) =>
                                      p.map((x) =>
                                        x.id === r.id
                                          ? { ...x, status: "DONE" }
                                          : x,
                                      ),
                                    )
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Hoàn tất
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                          Trống
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!filtered.length ? (
                <EmptyState
                  title="Không có dữ liệu"
                  desc="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                />
              ) : null}
            </div>
          </Card>
        </div>

        <Modal
          open={assignOpen}
          title="Gán collector"
          sub={
            assignTarget
              ? `${assignTarget.id} • ${assignTarget.zone}`
              : undefined
          }
          onClose={() => setAssignOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAssignOpen(false)}>
                Hủy
              </Button>
              <Button onClick={confirmAssign} disabled={!assignCollector}>
                Xác nhận
              </Button>
            </>
          }
        >
          {assignTarget ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-bold text-slate-900">
                  {assignTarget.citizenName}
                </div>
                <div className="text-sm text-slate-600">
                  {assignTarget.address}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge tone="slate">{assignTarget.zone}</Badge>
                  <Badge tone="emerald">{assignTarget.wasteType}</Badge>
                  <Badge tone="amber">Ước tính {assignTarget.estKg}kg</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Collector
                  </div>
                  <select
                    value={assignCollector}
                    onChange={(e) => setAssignCollector(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                  >
                    <option value="">Chọn collector...</option>
                    {COLLECTORS.filter((c) => c.zone === assignTarget.zone).map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.online ? "online" : "offline"}) • load{" "}
                          {c.load}
                        </option>
                      ),
                    )}
                  </select>
                  <div className="mt-1 text-xs text-slate-500">
                    Gợi ý: chọn người online + load thấp để giảm trễ SLA.
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    Khung giờ
                  </div>
                  <input
                    value={assignWindow}
                    onChange={(e) => setAssignWindow(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400"
                    placeholder="10:00 - 12:00"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Có thể ràng buộc rule theo giờ vận hành ở trang Cài đặt.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  );
}
