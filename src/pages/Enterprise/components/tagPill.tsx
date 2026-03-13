import React from "react";

type Kind = "reportStatus" | "wasteType" | "collectorStatus";

type Props = {
  kind: Kind;
  value: string;
  className?: string;
};

function cn(...a: Array<string | undefined | false | null>) {
  return a.filter(Boolean).join(" ");
}

const REPORT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: {
    label: "Chờ duyệt",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },

  ACCEPTED: {
    label: "Đã duyệt",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  APPROVED: {
    label: "Đã duyệt",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  REJECTED: {
    label: "Từ chối",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },

  EXPIRED: {
    label: "Hết hạn",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },

  CANCELLED: {
    label: "Đã huỷ",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },

  WAITING: {
    label: "Chờ xử lý",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },

  ASSIGNED: {
    label: "Đã phân công",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },

  ON_THE_WAY: {
    label: "Đang đến",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  WAITING_CUSTOMER: {
    label: "Đang chờ khách",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },

  COLLECTED: {
    label: "Đã thu gom",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  COMPLETED: {
    label: "Hoàn thành",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  COLLECTOR_PENDING: {
    label: "Chờ nhân viên xác nhận",
    cls: "bg-amber-50 text-amber-800 border-amber-300",
  },
};

const WASTE_TYPE: Record<string, { label: string; cls: string }> = {
  ORGANIC: {
    label: "Rác hữu cơ",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RECYCLABLE: {
    label: "Rác tái chế",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  HAZARDOUS: {
    label: "Rác nguy hại",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const COLLECTOR_STATUS: Record<string, { label: string; cls: string }> = {
  ONLINE_AVAILABLE: {
    label: "Sẵn sàng",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ONLINE_BUSY: {
    label: "Đang bận",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  OFFLINE: {
    label: "Ngoại tuyến",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },

  AVAILABLE: {
    label: "Sẵn sàng",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ON_TASK: {
    label: "Đang bận",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export default function TagPill({ kind, value, className }: Props) {
  const raw = String(value ?? "");
  const key = raw.trim().toUpperCase();

  const meta =
    kind === "reportStatus"
      ? REPORT_STATUS[key]
      : kind === "wasteType"
        ? WASTE_TYPE[key]
        : COLLECTOR_STATUS[key];

  const label = meta?.label ?? raw;
  const cls = meta?.cls ?? "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-bold",
        cls,
        className,
      )}
      title={label}
    >
      {label}
    </span>
  );
}
