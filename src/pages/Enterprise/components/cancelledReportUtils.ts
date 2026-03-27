import dayjs from "dayjs";

import type {
  CancelledEnterpriseReport,
  CollectorLog,
  WasteItem,
} from "@/redux/api/enterprise/reports/types";

export function formatReportDateTime(iso?: string | null) {
  if (!iso) return "—";

  const date = dayjs(iso);
  if (!date.isValid()) return "—";

  return `${date.format("HH:mm")} • ${date.format("DD/MM/YYYY")}`;
}

export function getCancellationActorLabel(actor?: string | null) {
  switch (
    String(actor ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "CITIZEN":
      return "Người dân";
    case "COLLECTOR":
      return "Nhân viên thu gom";
    case "ENTERPRISE":
      return "Doanh nghiệp";
    case "ADMIN":
    case "ADMINISTRATOR":
      return "Quản trị viên";
    case "SYSTEM":
      return "Hệ thống";
    default:
      return "Không rõ";
  }
}

export function getCancellationActorClasses(actor?: string | null) {
  switch (
    String(actor ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "CITIZEN":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "COLLECTOR":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "ENTERPRISE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ADMIN":
    case "ADMINISTRATOR":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "SYSTEM":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function getCancelledStageLabel(type?: string | null) {
  switch (
    String(type ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "WAS_WAITING":
      return "Đang chờ phản hồi";
    case "WAS_ACCEPTED":
      return "Đã nhận xử lý";
    case "WAS_IN_PROGRESS":
      return "Đang được xử lý";
    default:
      return "Không rõ giai đoạn";
  }
}

export function getCancelledStageClasses(type?: string | null) {
  switch (
    String(type ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "WAS_WAITING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "WAS_ACCEPTED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "WAS_IN_PROGRESS":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function getCancellationReason(report: CancelledEnterpriseReport) {
  const directReason = report.cancelDetails?.reason?.trim();
  if (directReason) return directReason;

  const collectorReason = (report.cancelDetails?.collectorLogs ?? [])
    .map((log) => log.reason?.trim())
    .find(Boolean);

  if (collectorReason) return collectorReason;

  const actor = getCancellationActorLabel(report.cancelBy);
  const stage = getCancelledStageLabel(report.type).toLowerCase();

  return `${actor} đã hủy đơn ở giai đoạn ${stage}.`;
}

export function sumWasteWeight(items?: WasteItem[]) {
  return (items ?? []).reduce(
    (sum, item) => sum + Number(item.weightKg ?? 0),
    0,
  );
}

export function countCollectorLogImages(logs?: CollectorLog[]) {
  return (logs ?? []).reduce(
    (sum, log) => sum + (Array.isArray(log.images) ? log.images.length : 0),
    0,
  );
}
