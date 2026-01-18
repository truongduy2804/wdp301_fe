// src/pages/enterprise/EnterpriseAssignmentsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  MapPin,
  Phone,
  PlayCircle,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";

// ✅ đổi path import theo project bạn
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dropdown,
  EmptyState,
  Modal,
  cx,
  formatNumber,
} from "../ui/enterpriseUI";

/* ===================== Types ===================== */
type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";

type AssignmentStatus =
  | "NEW" // vừa tạo
  | "DISPATCHED" // đã điều phối
  | "ON_THE_WAY" // collector đang tới
  | "ARRIVED" // đã tới điểm
  | "COLLECTING" // đang thu gom
  | "COMPLETED" // hoàn tất
  | "CANCELLED" // huỷ
  | "FAILED"; // thất bại

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type Collector = {
  id: string;
  name: string;
  phone: string;
  zone: Zone;
  online: boolean;
  activeJobs: number;
  rating: number; // 0-5
};

type CitizenRequest = {
  id: string;
  createdAt: string;
  zone: Zone;
  address: string;
  contactName: string;
  contactPhone: string;
  wasteType: WasteType;
  weightKg?: number;
  note?: string;
};

type Assignment = {
  id: string;
  request: CitizenRequest;
  collector?: Collector | null;
  status: AssignmentStatus;
  priority: Priority;
  etaMinutes?: number; // dự kiến đến
  updatedAt: string;
  timeline: Array<{
    at: string;
    label: string;
    meta?: string;
  }>;
  proof?: {
    weightKg?: number;
    images?: string[];
    note?: string;
  };
};

/* ===================== Mock Data ===================== */
const ZONE_OPTIONS: Array<{ value: Zone; label: string }> = [
  { value: "District 1", label: "Quận 1" },
  { value: "District 3", label: "Quận 3" },
  { value: "District 7", label: "Quận 7" },
  { value: "Thu Duc", label: "Thủ Đức" },
];

const WASTE_OPTIONS: Array<{ value: WasteType; label: string }> = [
  { value: "Plastic", label: "Nhựa" },
  { value: "Paper", label: "Giấy" },
  { value: "Metal", label: "Kim loại" },
  { value: "Organic", label: "Hữu cơ" },
  { value: "Other", label: "Khác" },
];

const STATUS_OPTIONS: Array<{
  value: AssignmentStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "NEW", label: "Mới" },
  { value: "DISPATCHED", label: "Đã điều phối" },
  { value: "ON_THE_WAY", label: "Đang tới" },
  { value: "ARRIVED", label: "Đã tới" },
  { value: "COLLECTING", label: "Đang thu gom" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Huỷ" },
  { value: "FAILED", label: "Thất bại" },
];

const PRIORITY_OPTIONS: Array<{ value: Priority | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "LOW", label: "Thấp" },
  { value: "NORMAL", label: "Bình thường" },
  { value: "HIGH", label: "Cao" },
  { value: "URGENT", label: "Khẩn" },
];

function nowTs() {
  const d = new Date();
  return d.toLocaleString("vi-VN");
}

const MOCK_COLLECTORS: Collector[] = [
  {
    id: "C-001",
    name: "Nguyễn Bảo",
    phone: "0901 111 222",
    zone: "District 1",
    online: true,
    activeJobs: 1,
    rating: 4.8,
  },
  {
    id: "C-002",
    name: "Trần Huy",
    phone: "0902 222 333",
    zone: "District 1",
    online: false,
    activeJobs: 0,
    rating: 4.5,
  },
  {
    id: "C-003",
    name: "Phạm Linh",
    phone: "0903 333 444",
    zone: "District 7",
    online: true,
    activeJobs: 2,
    rating: 4.7,
  },
  {
    id: "C-004",
    name: "Lê Đạt",
    phone: "0904 444 555",
    zone: "Thu Duc",
    online: true,
    activeJobs: 0,
    rating: 4.4,
  },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "ASG-1001",
    request: {
      id: "REQ-7001",
      createdAt: "18/01/2026 08:35",
      zone: "District 1",
      address: "12 Lê Lợi, P. Bến Nghé, Q1",
      contactName: "Chị Mai",
      contactPhone: "0938 111 999",
      wasteType: "Plastic",
      weightKg: 6.2,
      note: "Có thể đến trước 10h",
    },
    collector: MOCK_COLLECTORS[0],
    status: "ON_THE_WAY",
    priority: "HIGH",
    etaMinutes: 18,
    updatedAt: "18/01/2026 09:10",
    timeline: [
      {
        at: "18/01/2026 08:35",
        label: "Tạo yêu cầu",
        meta: "Citizen gửi yêu cầu",
      },
      {
        at: "18/01/2026 08:42",
        label: "Tạo phân công",
        meta: "Hệ thống tạo ASG-1001",
      },
      {
        at: "18/01/2026 08:45",
        label: "Đã điều phối",
        meta: "Gán cho Nguyễn Bảo",
      },
      {
        at: "18/01/2026 09:10",
        label: "Collector đang tới",
        meta: "ETA 18 phút",
      },
    ],
  },
  {
    id: "ASG-1002",
    request: {
      id: "REQ-7002",
      createdAt: "18/01/2026 07:55",
      zone: "District 7",
      address: "99 Nguyễn Thị Thập, Q7",
      contactName: "Anh Vũ",
      contactPhone: "0909 888 777",
      wasteType: "Paper",
      weightKg: 12.3,
      note: "Giấy carton đã bó",
    },
    collector: MOCK_COLLECTORS[2],
    status: "COLLECTING",
    priority: "NORMAL",
    etaMinutes: 0,
    updatedAt: "18/01/2026 09:05",
    timeline: [
      {
        at: "18/01/2026 07:55",
        label: "Tạo yêu cầu",
        meta: "Citizen gửi yêu cầu",
      },
      {
        at: "18/01/2026 08:05",
        label: "Đã điều phối",
        meta: "Gán cho Phạm Linh",
      },
      {
        at: "18/01/2026 08:40",
        label: "Đã tới điểm",
        meta: "Bắt đầu xác nhận",
      },
      {
        at: "18/01/2026 09:05",
        label: "Đang thu gom",
        meta: "Đang cân/ghi nhận",
      },
    ],
  },
  {
    id: "ASG-1003",
    request: {
      id: "REQ-7003",
      createdAt: "17/01/2026 16:20",
      zone: "Thu Duc",
      address: "45 Võ Văn Ngân, Thủ Đức",
      contactName: "Cô Hạnh",
      contactPhone: "0912 333 222",
      wasteType: "Metal",
      weightKg: 3.5,
    },
    collector: MOCK_COLLECTORS[3],
    status: "COMPLETED",
    priority: "LOW",
    updatedAt: "17/01/2026 17:10",
    timeline: [
      { at: "17/01/2026 16:20", label: "Tạo yêu cầu" },
      { at: "17/01/2026 16:28", label: "Đã điều phối", meta: "Gán cho Lê Đạt" },
      { at: "17/01/2026 16:55", label: "Đã tới điểm" },
      { at: "17/01/2026 17:05", label: "Đang thu gom" },
      { at: "17/01/2026 17:10", label: "Hoàn tất", meta: "Khối lượng 3.4kg" },
    ],
    proof: {
      weightKg: 3.4,
      note: "Thu gom nhanh, đúng hẹn",
    },
  },
  {
    id: "ASG-1004",
    request: {
      id: "REQ-7004",
      createdAt: "18/01/2026 09:01",
      zone: "District 3",
      address: "220 Võ Văn Tần, Q3",
      contactName: "Anh Khoa",
      contactPhone: "0907 444 666",
      wasteType: "Other",
      note: "Có pin cũ + đồ điện tử nhỏ",
    },
    collector: null,
    status: "NEW",
    priority: "URGENT",
    updatedAt: "18/01/2026 09:02",
    timeline: [
      {
        at: "18/01/2026 09:01",
        label: "Tạo yêu cầu",
        meta: "Citizen gửi yêu cầu",
      },
      {
        at: "18/01/2026 09:02",
        label: "Chờ điều phối",
        meta: "Chưa gán collector",
      },
    ],
  },
];

/* ===================== UI mappings ===================== */
function statusBadgeTone(s: AssignmentStatus) {
  switch (s) {
    case "NEW":
      return { tone: "blue" as const, label: "Mới" };
    case "DISPATCHED":
      return { tone: "emerald" as const, label: "Đã điều phối" };
    case "ON_THE_WAY":
      return { tone: "amber" as const, label: "Đang tới" };
    case "ARRIVED":
      return { tone: "amber" as const, label: "Đã tới" };
    case "COLLECTING":
      return { tone: "amber" as const, label: "Đang thu gom" };
    case "COMPLETED":
      return { tone: "emerald" as const, label: "Hoàn tất" };
    case "CANCELLED":
      return { tone: "slate" as const, label: "Huỷ" };
    case "FAILED":
      return { tone: "rose" as const, label: "Thất bại" };
  }
}

function priorityBadge(p: Priority) {
  switch (p) {
    case "LOW":
      return <Badge tone="slate">Thấp</Badge>;
    case "NORMAL":
      return <Badge tone="emerald">Bình thường</Badge>;
    case "HIGH":
      return <Badge tone="amber">Cao</Badge>;
    case "URGENT":
      return <Badge tone="rose">Khẩn</Badge>;
  }
}

function statusIcon(s: AssignmentStatus) {
  const cls = "h-4 w-4";
  switch (s) {
    case "NEW":
      return <Clock3 className={cls} />;
    case "DISPATCHED":
      return <Truck className={cls} />;
    case "ON_THE_WAY":
      return <PlayCircle className={cls} />;
    case "ARRIVED":
      return <MapPin className={cls} />;
    case "COLLECTING":
      return <Truck className={cls} />;
    case "COMPLETED":
      return <CheckCircle2 className={cls} />;
    case "CANCELLED":
      return <XCircle className={cls} />;
    case "FAILED":
      return <XCircle className={cls} />;
  }
}

/* ===================== Page ===================== */
type StatusFilter = AssignmentStatus | "ALL";
type PriorityFilter = Priority | "ALL";

export default function EnterpriseAssignmentsPage() {
  // data
  const [assignments, setAssignments] =
    useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [collectors] = useState<Collector[]>(MOCK_COLLECTORS);

  // filters
  const [zone, setZone] = useState<Zone | "ALL">("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");
  const [wasteType, setWasteType] = useState<WasteType | "ALL">("ALL");
  const [q, setQ] = useState("");

  // selection
  const [selectedId, setSelectedId] = useState<string | null>(
    assignments[0]?.id ?? null,
  );
  const selected = useMemo(
    () => assignments.find((a) => a.id === selectedId) ?? null,
    [assignments, selectedId],
  );

  // modals
  const [assignModal, setAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Assignment | null>(null);
  const [assignCollectorId, setAssignCollectorId] = useState<string>(
    collectors[0]?.id ?? "",
  );
  const [eta, setEta] = useState<number>(25);

  const [statusModal, setStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Assignment | null>(null);
  const [nextStatus, setNextStatus] = useState<AssignmentStatus>("DISPATCHED");

  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<null | {
    tone: "emerald" | "rose" | "amber";
    msg: string;
  }>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return assignments
      .filter((a) => (zone === "ALL" ? true : a.request.zone === zone))
      .filter((a) => (status === "ALL" ? true : a.status === status))
      .filter((a) => (priority === "ALL" ? true : a.priority === priority))
      .filter((a) =>
        wasteType === "ALL" ? true : a.request.wasteType === wasteType,
      )
      .filter((a) => {
        if (!s) return true;
        const hay = [
          a.id,
          a.request.id,
          a.request.address,
          a.request.contactName,
          a.request.contactPhone,
          a.collector?.name ?? "",
          a.collector?.phone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [assignments, zone, status, priority, wasteType, q]);

  // Keep selection valid
  useEffect(() => {
    if (!selectedId && list[0]) setSelectedId(list[0].id);
    if (selectedId && !assignments.some((x) => x.id === selectedId)) {
      setSelectedId(list[0]?.id ?? null);
    }
  }, [selectedId, list, assignments]);

  const counts = useMemo(() => {
    const total = list.length;
    const inProgress = list.filter((a) =>
      ["DISPATCHED", "ON_THE_WAY", "ARRIVED", "COLLECTING"].includes(a.status),
    ).length;
    const completed = list.filter((a) => a.status === "COMPLETED").length;
    const waiting = list.filter((a) => a.status === "NEW").length;
    return { total, inProgress, completed, waiting };
  }, [list]);

  async function toastSave(
    msg: string,
    tone: "emerald" | "rose" | "amber" = "emerald",
  ) {
    setSaving(true);
    setFlash(null);
    await new Promise((r) => setTimeout(r, 350));
    setSaving(false);
    setFlash({ tone, msg });
    window.setTimeout(() => setFlash(null), 1800);
  }

  function patchAssignment(
    id: string,
    patch: Partial<Assignment>,
    timeline?: { label: string; meta?: string },
  ) {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updatedAt = nowTs();
        const next: Assignment = {
          ...a,
          ...patch,
          updatedAt,
          timeline: timeline
            ? [
                ...a.timeline,
                { at: updatedAt, label: timeline.label, meta: timeline.meta },
              ]
            : a.timeline,
        };
        return next;
      }),
    );
  }

  /* ===================== Actions ===================== */
  function openAssign(a: Assignment) {
    setAssignTarget(a);
    setAssignCollectorId(
      a.collector?.id ??
        collectors.find((c) => c.zone === a.request.zone && c.online)?.id ??
        collectors[0]?.id ??
        "",
    );
    setEta(a.etaMinutes ?? 25);
    setAssignModal(true);
  }

  function confirmAssign() {
    if (!assignTarget) return;
    const c = collectors.find((x) => x.id === assignCollectorId) ?? null;
    if (!c) {
      toastSave("Vui lòng chọn collector", "rose");
      return;
    }

    patchAssignment(
      assignTarget.id,
      {
        collector: c,
        status: "DISPATCHED",
        etaMinutes: Math.max(0, Number(eta || 0)),
      },
      { label: "Đã điều phối", meta: `Gán cho ${c.name} • ETA ${eta} phút` },
    );

    setAssignModal(false);
    toastSave("Đã điều phối thành công");
  }

  function openStatus(a: Assignment) {
    setStatusTarget(a);

    // gợi ý next status theo flow
    const suggested: Record<AssignmentStatus, AssignmentStatus> = {
      NEW: "DISPATCHED",
      DISPATCHED: "ON_THE_WAY",
      ON_THE_WAY: "ARRIVED",
      ARRIVED: "COLLECTING",
      COLLECTING: "COMPLETED",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
      FAILED: "FAILED",
    };
    setNextStatus(suggested[a.status]);
    setStatusModal(true);
  }

  function confirmStatus() {
    if (!statusTarget) return;

    const metaByStatus: Record<AssignmentStatus, string> = {
      NEW: "Reset về trạng thái mới",
      DISPATCHED: "Đã gửi phân công đến collector",
      ON_THE_WAY: "Collector xác nhận đang di chuyển",
      ARRIVED: "Collector đã tới điểm thu gom",
      COLLECTING: "Bắt đầu cân/ghi nhận rác",
      COMPLETED: "Hoàn tất thu gom",
      CANCELLED: "Huỷ theo yêu cầu/điều phối",
      FAILED: "Không thể thu gom (lý do vận hành)",
    };

    patchAssignment(
      statusTarget.id,
      { status: nextStatus },
      {
        label: `Cập nhật trạng thái: ${statusBadgeTone(nextStatus).label}`,
        meta: metaByStatus[nextStatus],
      },
    );

    setStatusModal(false);
    toastSave("Đã cập nhật trạng thái");
  }

  function quickCancel(a: Assignment) {
    patchAssignment(
      a.id,
      { status: "CANCELLED" },
      { label: "Huỷ phân công", meta: "Thao tác nhanh" },
    );
    toastSave("Đã huỷ phân công", "amber");
  }

  /* ===================== Render ===================== */
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
        {/* Header + Quick KPIs */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-900">
                Phân công & theo dõi
              </div>
              <div className="text-sm text-slate-600">
                Điều phối yêu cầu từ citizen, gán collector và theo dõi tiến độ
                theo thời gian thực (UI demo).
              </div>

              {flash ? (
                <div className="mt-2">
                  <Badge
                    tone={
                      flash.tone === "emerald"
                        ? "emerald"
                        : flash.tone === "amber"
                          ? "amber"
                          : "rose"
                    }
                  >
                    {flash.msg}
                  </Badge>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tổng
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(counts.total)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Chờ điều phối
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(counts.waiting)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Đang xử lý
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(counts.inProgress)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hoàn tất
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(counts.completed)}
                </div>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="px-4 sm:px-5 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo mã ASG/REQ, tên, SĐT, địa chỉ, collector..."
                  className={cx(
                    "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm",
                    "outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all",
                  )}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Dropdown
                  label="Khu vực"
                  value={zone}
                  onChange={(v) => setZone(v)}
                  options={[
                    { value: "ALL", label: "Tất cả" } as any,
                    ...ZONE_OPTIONS,
                  ]}
                  icon={({ className }) => (
                    <MapPin className={cx("h-4 w-4", className)} />
                  )}
                />
                <Dropdown
                  label="Trạng thái"
                  value={status}
                  onChange={(v) => setStatus(v)}
                  options={STATUS_OPTIONS as any}
                  icon={({ className }) => (
                    <Filter className={cx("h-4 w-4", className)} />
                  )}
                />
                <Dropdown
                  label="Ưu tiên"
                  value={priority}
                  onChange={(v) => setPriority(v)}
                  options={PRIORITY_OPTIONS as any}
                  icon={({ className }) => (
                    <ChevronDown className={cx("h-4 w-4", className)} />
                  )}
                />
                <Dropdown
                  label="Loại rác"
                  value={wasteType}
                  onChange={(v) => setWasteType(v)}
                  options={[
                    { value: "ALL", label: "Tất cả" } as any,
                    ...WASTE_OPTIONS.map((x) => ({
                      value: x.value,
                      label: x.label,
                    })),
                  ]}
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setZone("ALL");
                    setStatus("ALL");
                    setPriority("ALL");
                    setWasteType("ALL");
                    setQ("");
                  }}
                >
                  Xoá lọc
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left list */}
          <Card className="lg:col-span-5 hover:shadow-md transition-shadow">
            <CardHeader
              title="Danh sách phân công"
              sub={`${formatNumber(list.length)} mục • Click để xem chi tiết`}
              right={
                <Badge tone="slate">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Hôm nay
                </Badge>
              }
            />

            <div className="px-3 sm:px-4 pb-4">
              {list.length === 0 ? (
                <EmptyState
                  title="Không có phân công phù hợp"
                  desc="Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm."
                />
              ) : (
                <div className="space-y-2">
                  {list.map((a) => {
                    const active = a.id === selectedId;
                    const st = statusBadgeTone(a.status);
                    const zoneLabel =
                      ZONE_OPTIONS.find((z) => z.value === a.request.zone)
                        ?.label ?? a.request.zone;

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className={cx(
                          "w-full rounded-2xl border p-3 text-left transition-all",
                          active
                            ? "border-emerald-200 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-bold text-slate-900">
                                {a.id}
                              </div>
                              <div className="text-xs text-slate-500">
                                {a.request.id}
                              </div>
                              {priorityBadge(a.priority)}
                              <Badge tone={st.tone}>{st.label}</Badge>
                            </div>

                            <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                              {a.request.address}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                                {zoneLabel}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-slate-500" />
                                {a.request.contactName}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-slate-500" />
                                {a.request.contactPhone}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xs text-slate-500">
                              Cập nhật
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              {a.updatedAt.split(" ").slice(-1)[0]}
                            </div>

                            <div className="mt-2">
                              {a.collector ? (
                                <Badge
                                  tone={
                                    a.collector.online ? "emerald" : "slate"
                                  }
                                >
                                  {a.collector.online ? "Online" : "Offline"}
                                </Badge>
                              ) : (
                                <Badge tone="rose">Chưa gán</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Right detail */}
          <Card className="lg:col-span-7 hover:shadow-md transition-shadow">
            <CardHeader
              title="Chi tiết & theo dõi"
              sub={
                selected
                  ? `${selected.id} • ${selected.request.id}`
                  : "Chọn một phân công để xem"
              }
              right={
                selected ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openAssign(selected)}
                      disabled={saving}
                    >
                      <Truck className="h-4 w-4" />
                      {selected.collector ? "Đổi collector" : "Gán collector"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => openStatus(selected)}
                      disabled={saving}
                    >
                      {statusIcon(selected.status)}
                      Cập nhật trạng thái
                    </Button>

                    {selected.status !== "COMPLETED" &&
                    selected.status !== "CANCELLED" &&
                    selected.status !== "FAILED" ? (
                      <Button
                        variant="danger"
                        onClick={() => quickCancel(selected)}
                        disabled={saving}
                      >
                        <XCircle className="h-4 w-4" />
                        Huỷ
                      </Button>
                    ) : null}
                  </div>
                ) : null
              }
            />

            <div className="px-4 sm:px-5 pb-5">
              {!selected ? (
                <EmptyState
                  title="Chưa chọn phân công"
                  desc="Click một dòng bên trái để xem timeline, trạng thái và thông tin gán collector."
                />
              ) : (
                <div className="space-y-4">
                  {/* Summary strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Trạng thái
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge tone={statusBadgeTone(selected.status).tone}>
                          {statusBadgeTone(selected.status).label}
                        </Badge>
                        {priorityBadge(selected.priority)}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Cập nhật:{" "}
                        <b className="text-slate-800">{selected.updatedAt}</b>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Yêu cầu
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        Loại rác:{" "}
                        <b className="text-slate-900">
                          {WASTE_OPTIONS.find(
                            (w) => w.value === selected.request.wasteType,
                          )?.label ?? selected.request.wasteType}
                        </b>
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        Ước tính:{" "}
                        <b className="text-slate-900">
                          {selected.request.weightKg != null
                            ? `${selected.request.weightKg} kg`
                            : "—"}
                        </b>
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        Tạo lúc:{" "}
                        <b className="text-slate-900">
                          {selected.request.createdAt}
                        </b>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Collector
                      </div>
                      {selected.collector ? (
                        <>
                          <div className="mt-2 text-sm font-bold text-slate-900">
                            {selected.collector.name}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            SĐT:{" "}
                            <b className="text-slate-900">
                              {selected.collector.phone}
                            </b>
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            Jobs:{" "}
                            <b className="text-slate-900">
                              {selected.collector.activeJobs}
                            </b>{" "}
                            • Rating{" "}
                            <b className="text-slate-900">
                              {selected.collector.rating}
                            </b>
                          </div>
                        </>
                      ) : (
                        <div className="mt-2">
                          <Badge tone="rose">Chưa gán collector</Badge>
                          <div className="mt-2 text-sm text-slate-600">
                            Hãy “Gán collector” để bắt đầu điều phối.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address + note */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-700" />
                          Điểm thu gom
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {selected.request.address}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          Liên hệ:{" "}
                          <b className="text-slate-900">
                            {selected.request.contactName}
                          </b>{" "}
                          •{" "}
                          <b className="text-slate-900">
                            {selected.request.contactPhone}
                          </b>
                        </div>
                      </div>

                      {selected.etaMinutes != null ? (
                        <Badge
                          tone={selected.etaMinutes <= 15 ? "emerald" : "amber"}
                        >
                          ETA {selected.etaMinutes} phút
                        </Badge>
                      ) : null}
                    </div>

                    {selected.request.note ? (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                        <b>Ghi chú:</b> {selected.request.note}
                      </div>
                    ) : null}
                  </div>

                  {/* Timeline */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-emerald-700" />
                      Timeline xử lý
                    </div>

                    <div className="mt-4 space-y-3">
                      {selected.timeline.map((t, idx) => {
                        const last = idx === selected.timeline.length - 1;
                        return (
                          <div
                            key={`${t.at}-${idx}`}
                            className="flex items-start gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-3 rounded-full bg-emerald-500 mt-1" />
                              {!last ? (
                                <div className="w-px flex-1 bg-slate-200 mt-1" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-bold text-slate-900">
                                  {t.label}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {t.at}
                                </div>
                              </div>
                              {t.meta ? (
                                <div className="mt-1 text-sm text-slate-600">
                                  {t.meta}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Proof (if completed) */}
                  {selected.status === "COMPLETED" ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        Bằng chứng & ghi nhận
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Khối lượng
                          </div>
                          <div className="mt-2 text-xl font-bold text-slate-900">
                            {selected.proof?.weightKg != null
                              ? `${selected.proof?.weightKg} kg`
                              : "—"}
                          </div>
                        </div>
                        <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Ghi chú
                          </div>
                          <div className="mt-2 text-sm text-slate-700">
                            {selected.proof?.note ?? "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ===================== Assign Modal ===================== */}
      <Modal
        open={assignModal}
        title={
          assignTarget?.collector ? "Đổi / gán collector" : "Gán collector"
        }
        sub="Chọn collector phù hợp theo khu vực và tải công việc."
        onClose={() => setAssignModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignModal(false)}>
              Huỷ
            </Button>
            <Button variant="primary" onClick={confirmAssign} disabled={saving}>
              <Truck className="h-4 w-4" />
              {assignTarget?.collector ? "Cập nhật" : "Điều phối"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {assignTarget ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-900">
                {assignTarget.id}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {assignTarget.request.address}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="slate">{assignTarget.request.id}</Badge>
                <Badge tone="emerald">
                  {ZONE_OPTIONS.find(
                    (z) => z.value === assignTarget.request.zone,
                  )?.label ?? assignTarget.request.zone}
                </Badge>
                {priorityBadge(assignTarget.priority)}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              label="Collector"
              value={assignCollectorId as any}
              onChange={(v) => setAssignCollectorId(v as any)}
              options={collectors.map((c) => ({
                value: c.id as any,
                label: `${c.name} • ${ZONE_OPTIONS.find((z) => z.value === c.zone)?.label ?? c.zone} • ${
                  c.online ? "Online" : "Offline"
                } • Jobs:${c.activeJobs}`,
              }))}
            />

            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-slate-800">
                ETA (phút)
              </div>
              <input
                type="number"
                min={0}
                value={eta}
                onChange={(e) => setEta(Number(e.target.value || 0))}
                className={cx(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                  "outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all",
                )}
              />
              <div className="text-xs text-slate-500">
                Tip: dựa vào khoảng cách & tình trạng giao thông.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Gợi ý: ưu tiên collector <b>Online</b>, cùng khu vực,{" "}
            <b>activeJobs thấp</b> để giảm trễ SLA.
          </div>
        </div>
      </Modal>

      {/* ===================== Status Modal ===================== */}
      <Modal
        open={statusModal}
        title="Cập nhật trạng thái"
        sub="Đổi trạng thái để phản ánh tiến độ thực tế (UI demo)."
        onClose={() => setStatusModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusModal(false)}>
              Huỷ
            </Button>
            <Button variant="primary" onClick={confirmStatus} disabled={saving}>
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {statusTarget ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    {statusTarget.id}
                  </div>
                  <div className="mt-1 text-sm text-slate-700 line-clamp-2">
                    {statusTarget.request.address}
                  </div>
                </div>
                <Badge tone={statusBadgeTone(statusTarget.status).tone}>
                  {statusBadgeTone(statusTarget.status).label}
                </Badge>
              </div>

              <div className="mt-2 text-sm text-slate-600">
                Collector:{" "}
                <b className="text-slate-900">
                  {statusTarget.collector?.name ?? "Chưa gán"}
                </b>
              </div>
            </div>
          ) : null}

          <Dropdown
            label="Trạng thái mới"
            value={nextStatus as any}
            onChange={(v) => setNextStatus(v as any)}
            options={STATUS_OPTIONS.filter((x) => x.value !== "ALL").map(
              (x) => ({
                value: x.value as any,
                label: x.label,
              }),
            )}
            icon={({ className }) => (
              <Clock3 className={cx("h-4 w-4", className)} />
            )}
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Flow gợi ý:{" "}
            <b>
              Mới → Đã điều phối → Đang tới → Đã tới → Đang thu gom → Hoàn tất
            </b>
          </div>
        </div>
      </Modal>

      {/* Animations (nếu project chưa có global animate-in) */}
      <style>{`
        @keyframes slide-in-from-top-4 {
          from { transform: translateY(-1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation: fadeIn 0.18s ease-out; }
        .slide-in-from-top-4 { animation: slide-in-from-top-4 0.22s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
