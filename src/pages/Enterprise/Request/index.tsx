// src/pages/enterprise/EnterprisePickupRequestsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Ban,
  CalendarDays,
  ChevronRight,
  Clock,
  Download,
  Filter,
  MapPin,
  PackageCheck,
  Search,
  TimerReset,
  Truck,
  UserCircle2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import {
  Card,
  Dropdown,
  DateRangePill,
  cx,
  formatNumber,
} from "../ui/enterpriseUI";

/* ===================== Types ===================== */
type Zone = "District 1" | "District 3" | "District 7" | "Thu Duc";
type WasteType = "Plastic" | "Paper" | "Metal" | "Organic" | "Other";
type Priority = "LOW" | "NORMAL" | "HIGH";

type PickupStatus =
  | "NEW"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COLLECTED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

type Citizen = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
};

type Collector = {
  id: string;
  name: string;
  zone: Zone;
  onTimeRate: number; // %
  activeJobs: number;
};

type StatusLog = {
  at: string; // ISO or display
  by: "SYSTEM" | "ENTERPRISE" | "COLLECTOR" | "CITIZEN";
  title: string;
  note?: string;
};

type PickupRequest = {
  id: string;
  createdAt: string; // ISO
  zone: Zone;
  address: string;
  citizen: Citizen;

  wasteType: WasteType;
  estimateKg: number;
  notes?: string;
  photos?: string[];

  preferredFrom: string; // ISO
  preferredTo: string; // ISO

  status: PickupStatus;
  priority: Priority;

  assignedCollectorId?: string;
  scheduledAt?: string; // ISO
  etaMinutes?: number;

  actualKg?: number;
  receiptCode?: string;

  logs: StatusLog[];
};

/* ===================== Mock Data ===================== */
const COLLECTORS: Collector[] = [
  {
    id: "COL-01",
    name: "Trần Thị B",
    zone: "District 7",
    onTimeRate: 92,
    activeJobs: 3,
  },
  {
    id: "COL-02",
    name: "Nguyễn Văn A",
    zone: "Thu Duc",
    onTimeRate: 94,
    activeJobs: 2,
  },
  {
    id: "COL-03",
    name: "Lê Văn C",
    zone: "District 1",
    onTimeRate: 90,
    activeJobs: 4,
  },
  {
    id: "COL-04",
    name: "Phạm Thị D",
    zone: "District 3",
    onTimeRate: 89,
    activeJobs: 1,
  },
];

const MOCK_REQUESTS: PickupRequest[] = [
  {
    id: "REQ-240118-0001",
    createdAt: dayjs().subtract(5, "hour").toISOString(),
    zone: "District 7",
    address: "12 Nguyễn Thị Thập, P. Tân Phú, Q7",
    citizen: { id: "CIT-01", name: "Nguyễn Hoàng Anh", phone: "0909 123 456" },
    wasteType: "Plastic",
    estimateKg: 12,
    notes: "Rác đã đóng bao, để trước cổng. Có 2 bao lớn.",
    photos: [],
    preferredFrom: dayjs().add(1, "day").hour(9).minute(0).toISOString(),
    preferredTo: dayjs().add(1, "day").hour(11).minute(0).toISOString(),
    status: "NEW",
    priority: "NORMAL",
    logs: [
      {
        at: dayjs().subtract(5, "hour").format("HH:mm DD/MM/YYYY"),
        by: "CITIZEN",
        title: "Citizen tạo yêu cầu",
      },
      {
        at: dayjs().subtract(5, "hour").format("HH:mm DD/MM/YYYY"),
        by: "SYSTEM",
        title: "Ghi nhận vào hàng chờ xử lý",
      },
    ],
  },
  {
    id: "REQ-240118-0002",
    createdAt: dayjs().subtract(20, "hour").toISOString(),
    zone: "Thu Duc",
    address: "88 Võ Văn Ngân, TP. Thủ Đức",
    citizen: { id: "CIT-02", name: "Võ Thảo My", phone: "0933 555 222" },
    wasteType: "Paper",
    estimateKg: 24,
    notes: "Giấy carton + sách cũ. Có thể cân tại chỗ.",
    photos: [],
    preferredFrom: dayjs().hour(14).minute(0).toISOString(),
    preferredTo: dayjs().hour(17).minute(0).toISOString(),
    status: "ASSIGNED",
    priority: "HIGH",
    assignedCollectorId: "COL-02",
    scheduledAt: dayjs().hour(15).minute(0).toISOString(),
    etaMinutes: 35,
    logs: [
      {
        at: dayjs().subtract(20, "hour").format("HH:mm DD/MM/YYYY"),
        by: "CITIZEN",
        title: "Citizen tạo yêu cầu",
      },
      {
        at: dayjs().subtract(18, "hour").format("HH:mm DD/MM/YYYY"),
        by: "ENTERPRISE",
        title: "Enterprise xác nhận",
        note: "Hẹn thu gom 15:00",
      },
      {
        at: dayjs().subtract(6, "hour").format("HH:mm DD/MM/YYYY"),
        by: "ENTERPRISE",
        title: "Gán collector",
        note: "COL-02 — Nguyễn Văn A",
      },
    ],
  },
  {
    id: "REQ-240118-0003",
    createdAt: dayjs().subtract(2, "day").toISOString(),
    zone: "District 1",
    address: "25 Lê Thánh Tôn, Q1",
    citizen: { id: "CIT-03", name: "Trần Gia Huy", phone: "0912 888 777" },
    wasteType: "Metal",
    estimateKg: 8,
    notes: "Lon nhôm + sắt vụn ít.",
    photos: [],
    preferredFrom: dayjs().subtract(1, "day").hour(9).minute(0).toISOString(),
    preferredTo: dayjs().subtract(1, "day").hour(11).minute(0).toISOString(),
    status: "COMPLETED",
    priority: "LOW",
    assignedCollectorId: "COL-03",
    scheduledAt: dayjs().subtract(1, "day").hour(9).minute(30).toISOString(),
    etaMinutes: 22,
    actualKg: 7.6,
    receiptCode: "RC-778812",
    logs: [
      {
        at: dayjs().subtract(2, "day").format("HH:mm DD/MM/YYYY"),
        by: "CITIZEN",
        title: "Citizen tạo yêu cầu",
      },
      {
        at: dayjs()
          .subtract(2, "day")
          .add(1, "hour")
          .format("HH:mm DD/MM/YYYY"),
        by: "ENTERPRISE",
        title: "Enterprise xác nhận",
      },
      {
        at: dayjs().subtract(1, "day").hour(8).format("HH:mm DD/MM/YYYY"),
        by: "ENTERPRISE",
        title: "Gán collector",
        note: "COL-03 — Lê Văn C",
      },
      {
        at: dayjs().subtract(1, "day").hour(9).format("HH:mm DD/MM/YYYY"),
        by: "COLLECTOR",
        title: "Bắt đầu thu gom",
      },
      {
        at: dayjs().subtract(1, "day").hour(10).format("HH:mm DD/MM/YYYY"),
        by: "COLLECTOR",
        title: "Đã thu gom",
        note: "Cân thực tế 7.6kg",
      },
      {
        at: dayjs().subtract(1, "day").hour(11).format("HH:mm DD/MM/YYYY"),
        by: "ENTERPRISE",
        title: "Hoàn tất",
        note: "Biên nhận RC-778812",
      },
    ],
  },
];

/* ===================== Utils ===================== */
function formatTimeRange(fromISO: string, toISO: string) {
  const f = dayjs(fromISO);
  const t = dayjs(toISO);
  return `${f.format("HH:mm DD/MM")} → ${t.format("HH:mm DD/MM")}`;
}

function exportRequestsCSV(rows: PickupRequest[]) {
  const header = [
    "id",
    "createdAt",
    "status",
    "priority",
    "zone",
    "address",
    "citizenName",
    "citizenPhone",
    "wasteType",
    "estimateKg",
    "actualKg",
    "collectorId",
    "scheduledAt",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.createdAt,
        r.status,
        r.priority,
        r.zone,
        `"${r.address}"`,
        `"${r.citizen.name}"`,
        `"${r.citizen.phone}"`,
        r.wasteType,
        r.estimateKg,
        r.actualKg ?? "",
        r.assignedCollectorId ?? "",
        r.scheduledAt ?? "",
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enterprise-pickup-requests.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ===================== Status Meta ===================== */
const STATUS_META: Record<
  PickupStatus,
  {
    label: string;
    pill: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  NEW: {
    label: "Mới",
    pill: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: TimerReset,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    icon: BadgeCheck,
  },
  ASSIGNED: {
    label: "Đã gán",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    icon: Truck,
  },
  IN_PROGRESS: {
    label: "Đang thu gom",
    pill: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  COLLECTED: {
    label: "Đã thu gom",
    pill: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    icon: PackageCheck,
  },
  DELIVERED: {
    label: "Đã bàn giao",
    pill: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    icon: PackageCheck,
  },
  COMPLETED: {
    label: "Hoàn tất",
    pill: "bg-emerald-50 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-600",
    icon: BadgeCheck,
  },
  CANCELLED: {
    label: "Đã hủy",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    icon: Ban,
  },
  REJECTED: {
    label: "Từ chối",
    pill: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    icon: Ban,
  },
};

const STATUS_TABS: Array<{ key: "ALL" | PickupStatus; label: string }> = [
  { key: "ALL", label: "Tất cả" },
  { key: "NEW", label: "Mới" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "ASSIGNED", label: "Đã gán" },
  { key: "IN_PROGRESS", label: "Đang thu gom" },
  { key: "COLLECTED", label: "Đã thu gom" },
  { key: "COMPLETED", label: "Hoàn tất" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "REJECTED", label: "Từ chối" },
];

/* ===================== Domain Logic: Allowed transitions ===================== */
function canTransition(from: PickupStatus, to: PickupStatus) {
  const allowed: Record<PickupStatus, PickupStatus[]> = {
    NEW: ["CONFIRMED", "REJECTED", "CANCELLED"],
    CONFIRMED: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COLLECTED", "CANCELLED"],
    COLLECTED: ["DELIVERED", "COMPLETED"],
    DELIVERED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    REJECTED: [],
  };
  return allowed[from].includes(to);
}

/* ===================== Drawer ===================== */
function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[130] h-dvh w-full max-w-[520px] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div className="min-w-0">{title}</div>
              <button
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer ? (
              <div className="px-5 py-4 border-t border-slate-200 bg-white/80 backdrop-blur">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ===================== Page ===================== */
export default function EnterprisePickupRequestsPage() {
  const [requests, setRequests] = useState<PickupRequest[]>(MOCK_REQUESTS);

  // Filters
  const [tab, setTab] = useState<"ALL" | PickupStatus>("ALL");
  const [q, setQ] = useState("");
  const [zone, setZone] = useState<Zone | "ALL">("ALL");
  const [waste, setWaste] = useState<WasteType | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  // Drawer
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(
    () => requests.find((r) => r.id === activeId) ?? null,
    [requests, activeId],
  );

  // ===== Derived: filtered =====
  const filtered = useMemo(() => {
    return requests
      .filter((r) => (tab === "ALL" ? true : r.status === tab))
      .filter((r) => (zone === "ALL" ? true : r.zone === zone))
      .filter((r) => (waste === "ALL" ? true : r.wasteType === waste))
      .filter((r) => (priority === "ALL" ? true : r.priority === priority))
      .filter((r) => {
        if (!q.trim()) return true;
        const s = q.trim().toLowerCase();
        return (
          r.id.toLowerCase().includes(s) ||
          r.address.toLowerCase().includes(s) ||
          r.citizen.name.toLowerCase().includes(s) ||
          r.citizen.phone.toLowerCase().includes(s)
        );
      })
      .filter((r) => {
        const [from, to] = dateRange;
        if (!from && !to) return true;
        const d = dayjs(r.createdAt);
        if (from && d.isBefore(from.startOf("day"))) return false;
        if (to && d.isAfter(to.endOf("day"))) return false;
        return true;
      })
      .sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      );
  }, [requests, tab, zone, waste, priority, q, dateRange]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = useMemo(
    () => filtered.length > 0 && selectedIds.length === filtered.length,
    [filtered.length, selectedIds.length],
  );

  // ===== KPI =====
  const kpi = useMemo(() => {
    const total = requests.length;
    const waiting = requests.filter((r) => r.status === "NEW").length;
    const doing = requests.filter(
      (r) => r.status === "IN_PROGRESS" || r.status === "ASSIGNED",
    ).length;

    // SLA mock: NEW/CONFIRMED older than 12h = overdue
    const overdue = requests.filter(
      (r) =>
        (r.status === "NEW" || r.status === "CONFIRMED") &&
        dayjs().diff(dayjs(r.createdAt), "hour") > 12,
    ).length;

    return { total, waiting, doing, overdue };
  }, [requests]);

  // ===== Helpers: update state =====
  function pushLog(reqId: string, log: StatusLog) {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, logs: [...r.logs, log] } : r)),
    );
  }

  function updateRequest(reqId: string, patch: Partial<PickupRequest>) {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, ...patch } : r)),
    );
  }

  function transition(reqId: string, next: PickupStatus, note?: string) {
    const r = requests.find((x) => x.id === reqId);
    if (!r) return;

    if (!canTransition(r.status, next)) {
      alert(
        `Không thể chuyển trạng thái từ "${STATUS_META[r.status].label}" → "${STATUS_META[next].label}"`,
      );
      return;
    }

    updateRequest(reqId, { status: next });

    pushLog(reqId, {
      at: dayjs().format("HH:mm DD/MM/YYYY"),
      by: "ENTERPRISE",
      title: `Chuyển trạng thái → ${STATUS_META[next].label}`,
      note,
    });
  }

  function assignCollector(reqId: string, collectorId: string) {
    const col = COLLECTORS.find((c) => c.id === collectorId);
    updateRequest(reqId, {
      assignedCollectorId: collectorId,
      status: "ASSIGNED",
      scheduledAt: dayjs().add(2, "hour").toISOString(),
      etaMinutes: 35,
    });
    pushLog(reqId, {
      at: dayjs().format("HH:mm DD/MM/YYYY"),
      by: "ENTERPRISE",
      title: "Gán collector",
      note: `${collectorId} — ${col?.name ?? "Unknown"}`,
    });
  }

  function bulkExport() {
    exportRequestsCSV(filtered.filter((r) => selectedIds.includes(r.id)));
  }

  function clearFilters() {
    setTab("ALL");
    setQ("");
    setZone("ALL");
    setWaste("ALL");
    setPriority("ALL");
    setDateRange([dayjs().subtract(7, "day"), dayjs()]);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* ===== Sticky top card ===== */}
        <div className="sticky top-4 z-30">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Title */}
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5">
                    <Truck className="h-5 w-5 text-emerald-700" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                      Yêu cầu thu gom
                    </h1>
                    <p className="text-sm text-slate-600">
                      Nhận yêu cầu từ citizen, duyệt – gán collector – theo dõi
                      – chốt biên nhận.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Tổng: {formatNumber(kpi.total)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Mới: {formatNumber(kpi.waiting)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Đang xử lý: {formatNumber(kpi.doing)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        SLA trễ: {formatNumber(kpi.overdue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 lg:items-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportRequestsCSV(filtered)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-sm"
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                    Xuất CSV
                  </button>

                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    type="button"
                  >
                    <Filter className="h-4 w-4" />
                    Reset lọc
                  </button>
                </div>

                {/* Bulk action */}
                {selectedIds.length > 0 ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <span className="text-sm font-semibold text-emerald-900">
                      Đã chọn {selectedIds.length}
                    </span>
                    <button
                      onClick={bulkExport}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                      type="button"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="p-2 rounded-xl hover:bg-emerald-100 transition-colors"
                      type="button"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4 text-emerald-900" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-col gap-3">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((t) => {
                  const activeTab = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cx(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold border transition-all",
                        activeTab
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      )}
                      type="button"
                    >
                      {t.key !== "ALL" ? (
                        <span
                          className={cx(
                            "h-2 w-2 rounded-full",
                            STATUS_META[t.key].dot,
                          )}
                        />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo mã yêu cầu, tên citizen, SĐT, địa chỉ..."
                    className={cx(
                      "w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-2.5",
                      "text-sm font-semibold text-slate-900 placeholder:text-slate-400",
                      "shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300",
                    )}
                  />
                </div>

                {/* Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Date range wrapper pill */}
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
                      value={dateRange}
                      onChange={setDateRange}
                      className={cx(
                        "!border-0 !shadow-none !bg-transparent !p-0 hover:!bg-transparent",
                      )}
                    />
                  </div>

                  <Dropdown<Zone | "ALL">
                    label="Khu vực"
                    icon={MapPin}
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

                  <Dropdown<WasteType | "ALL">
                    label="Loại rác"
                    icon={Filter}
                    value={waste}
                    onChange={setWaste}
                    options={[
                      { value: "ALL", label: "Tất cả" },
                      { value: "Plastic", label: "Nhựa" },
                      { value: "Paper", label: "Giấy" },
                      { value: "Metal", label: "Kim loại" },
                      { value: "Organic", label: "Hữu cơ" },
                      { value: "Other", label: "Khác" },
                    ]}
                  />

                  <Dropdown<Priority | "ALL">
                    label="Ưu tiên"
                    icon={ChevronRight}
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: "ALL", label: "Tất cả" },
                      { value: "HIGH", label: "Ưu tiên cao" },
                      { value: "NORMAL", label: "Bình thường" },
                      { value: "LOW", label: "Ưu tiên thấp" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Table card ===== */}
        <Card className="overflow-hidden" hover={false}>
          <div className="p-4 sm:p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-slate-900">
                Danh sách yêu cầu
              </p>
              <p className="text-sm text-slate-600">
                Click vào một dòng để xem chi tiết, xử lý trạng thái, gán
                collector, chốt biên nhận.
              </p>
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Kết quả:{" "}
              <span className="text-emerald-700">
                {formatNumber(filtered.length)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedIds(filtered.map((r) => r.id));
                        else setSelectedIds([]);
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Loại rác</th>
                  <th className="px-4 py-3">Khung giờ</th>
                  <th className="px-4 py-3">Ưu tiên</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">SLA</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => {
                  const meta = STATUS_META[r.status];
                  const overdue =
                    (r.status === "NEW" || r.status === "CONFIRMED") &&
                    dayjs().diff(dayjs(r.createdAt), "hour") > 12;

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                      onClick={() => setActiveId(r.id)}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedIds((p) => [...p, r.id]);
                            else
                              setSelectedIds((p) =>
                                p.filter((x) => x !== r.id),
                              );
                          }}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.id}
                        </div>
                        <div className="text-xs text-slate-500">
                          Tạo lúc {dayjs(r.createdAt).format("HH:mm DD/MM")}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {r.citizen.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.citizen.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-semibold">{r.zone}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {r.address}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-semibold">{r.wasteType}</div>
                        <div className="text-xs text-slate-500">
                          Ước tính {formatNumber(r.estimateKg)} kg
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatTimeRange(r.preferredFrom, r.preferredTo)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cx(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border",
                            r.priority === "HIGH"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : r.priority === "LOW"
                                ? "bg-slate-50 text-slate-700 border-slate-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200",
                          )}
                        >
                          {r.priority === "HIGH"
                            ? "Cao"
                            : r.priority === "LOW"
                              ? "Thấp"
                              : "Bình thường"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border",
                            meta.pill,
                          )}
                        >
                          <span
                            className={cx("h-2 w-2 rounded-full", meta.dot)}
                          />
                          {meta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {overdue ? (
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border bg-rose-50 text-rose-800 border-rose-200">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Trễ xử lý
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Đạt</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                          Xem <ChevronRight className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Không có yêu cầu phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Tip: lọc <span className="font-semibold text-slate-900">Mới</span>{" "}
              để xử lý nhanh, tránh SLA trễ.
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Enterprise view</span>
            </span>
          </div>
        </Card>
      </div>

      {/* ===== Drawer detail ===== */}
      <Drawer
        open={!!active}
        onClose={() => setActiveId(null)}
        title={
          active ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  {React.createElement(STATUS_META[active.status].icon, {
                    className: "h-5 w-5 text-emerald-700",
                  })}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-500">
                    Yêu cầu
                  </div>
                  <div className="text-lg font-bold text-slate-900 truncate">
                    {active.id}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border",
                    STATUS_META[active.status].pill,
                  )}
                >
                  <span
                    className={cx(
                      "h-2 w-2 rounded-full",
                      STATUS_META[active.status].dot,
                    )}
                  />
                  {STATUS_META[active.status].label}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                  <UserCircle2 className="h-4 w-4" />
                  {active.citizen.name}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                  <MapPin className="h-4 w-4" />
                  {active.zone}
                </span>
              </div>
            </div>
          ) : null
        }
        footer={
          active ? (
            <div className="flex flex-wrap gap-2">
              {/* Actions depend on status */}
              {active.status === "NEW" ? (
                <>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "CONFIRMED",
                        "Xác nhận yêu cầu và cho phép gán collector",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    type="button"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Xác nhận
                  </button>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "REJECTED",
                        "Không nằm trong vùng/loại rác không nhận",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
                    type="button"
                  >
                    <Ban className="h-4 w-4" />
                    Từ chối
                  </button>
                </>
              ) : null}

              {active.status === "CONFIRMED" ? (
                <>
                  <button
                    onClick={() => {
                      const best = COLLECTORS.filter(
                        (c) => c.zone === active.zone,
                      ).sort((a, b) => a.activeJobs - b.activeJobs)[0];
                      assignCollector(active.id, best?.id ?? COLLECTORS[0].id);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    type="button"
                  >
                    <Truck className="h-4 w-4" />
                    Gán collector
                  </button>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "CANCELLED",
                        "Hủy do thiếu nhân lực",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Hủy
                  </button>
                </>
              ) : null}

              {active.status === "ASSIGNED" ? (
                <>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "IN_PROGRESS",
                        "Collector bắt đầu thu gom",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    type="button"
                  >
                    <Clock className="h-4 w-4" />
                    Bắt đầu
                  </button>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "CANCELLED",
                        "Collector bận / đổi lịch",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Hủy
                  </button>
                </>
              ) : null}

              {active.status === "IN_PROGRESS" ? (
                <>
                  <button
                    onClick={() => {
                      updateRequest(active.id, {
                        actualKg: Math.max(
                          1,
                          Math.round(active.estimateKg * 0.92 * 10) / 10,
                        ),
                      });
                      transition(
                        active.id,
                        "COLLECTED",
                        "Cân tại chỗ + chụp ảnh minh chứng",
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    type="button"
                  >
                    <PackageCheck className="h-4 w-4" />
                    Đã thu gom
                  </button>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "CANCELLED",
                        "Citizen không có mặt / không liên hệ được",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Hủy
                  </button>
                </>
              ) : null}

              {active.status === "COLLECTED" ? (
                <>
                  <button
                    onClick={() =>
                      transition(
                        active.id,
                        "DELIVERED",
                        "Bàn giao về điểm tập kết",
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                    type="button"
                  >
                    Bàn giao
                  </button>
                  <button
                    onClick={() => {
                      updateRequest(active.id, {
                        receiptCode: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
                      });
                      transition(
                        active.id,
                        "COMPLETED",
                        "Chốt biên nhận + ghi nhận CO₂ ước tính",
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    type="button"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Hoàn tất
                  </button>
                </>
              ) : null}

              {active.status === "DELIVERED" ? (
                <button
                  onClick={() => {
                    updateRequest(active.id, {
                      receiptCode: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
                    });
                    transition(
                      active.id,
                      "COMPLETED",
                      "Đã xử lý xong tại nhà máy / điểm tập kết",
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  type="button"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Hoàn tất
                </button>
              ) : null}

              <button
                onClick={() => exportRequestsCSV([active])}
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                type="button"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          ) : null
        }
      >
        {active ? (
          <div className="space-y-5">
            {/* Summary */}
            <Card className="p-4 bg-slate-50" hover={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    Khung giờ mong muốn
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {formatTimeRange(active.preferredFrom, active.preferredTo)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    Loại rác / ước tính
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {active.wasteType} · {formatNumber(active.estimateKg)} kg
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    Địa chỉ
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {active.address}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    Collector
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {active.assignedCollectorId
                      ? `${active.assignedCollectorId} — ${
                          COLLECTORS.find(
                            (c) => c.id === active.assignedCollectorId,
                          )?.name ?? "Unknown"
                        }`
                      : "Chưa gán"}
                  </div>
                  {active.scheduledAt ? (
                    <div className="mt-1 text-xs text-slate-600">
                      Lịch: {dayjs(active.scheduledAt).format("HH:mm DD/MM")} ·
                      ETA {active.etaMinutes ?? "-"} phút
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            {/* Assignment */}
            <Card className="p-4" hover={false}>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Gán collector
                </div>
                <div className="text-sm text-slate-600">
                  Gợi ý theo khu vực + ít job đang chạy + on-time rate.
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                {COLLECTORS.filter((c) => c.zone === active.zone).length ===
                0 ? (
                  <div className="text-sm text-slate-500">
                    Không có collector trong khu vực này (demo).
                  </div>
                ) : (
                  COLLECTORS.filter((c) => c.zone === active.zone)
                    .sort((a, b) => a.activeJobs - b.activeJobs)
                    .map((c) => {
                      const selected = active.assignedCollectorId === c.id;
                      return (
                        <button
                          key={c.id}
                          className={cx(
                            "w-full rounded-2xl border p-3 text-left transition-all",
                            selected
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                          )}
                          onClick={() => assignCollector(active.id, c.id)}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {c.id} — {c.name}
                              </div>
                              <div className="text-xs text-slate-600 mt-1">
                                On-time {c.onTimeRate}% · Job đang chạy{" "}
                                {c.activeJobs}
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                              Chọn <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </Card>

            {/* Proof / Receipt */}
            <Card className="p-4" hover={false}>
              <div className="text-sm font-bold text-slate-900">
                Biên nhận & khối lượng
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Khối lượng thực tế
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {active.actualKg != null
                      ? `${formatNumber(active.actualKg)} kg`
                      : "Chưa có"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gợi ý: cập nhật khi trạng thái “Đã thu gom”.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Mã biên nhận
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {active.receiptCode ?? "Chưa có"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Sinh tự động khi “Hoàn tất”.
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4" hover={false}>
              <div className="text-sm font-bold text-slate-900">
                Ghi chú citizen
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {active.notes ?? "Không có ghi chú."}
              </p>
            </Card>

            {/* Timeline */}
            <Card className="p-4" hover={false}>
              <div className="text-sm font-bold text-slate-900">
                Timeline xử lý
              </div>
              <div className="mt-3 space-y-3">
                {active.logs.map((l, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {l.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {l.at} · {l.by}
                      </div>
                      {l.note ? (
                        <div className="text-sm text-slate-700 mt-1">
                          {l.note}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
