import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Mail,
  Ruler,
  User,
  Clock,
  Images,
  Leaf,
  FileText,
  CheckCircle2,
  Truck,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type {
  AcceptedEnterpriseReport,
  EnterpriseReport,
} from "@/redux/api/enterprise/reports/types";
import TagPill from "../components/tagPill";
import { getLocationNamesFromCodes } from "@/utils/helpers";

type ReportDetailData = (AcceptedEnterpriseReport | EnterpriseReport) & {
  reportId?: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  description?: string | null;

  createdAt?: string | null;
  sentAt?: string | null;
  assignedAt?: string | null;
  completedAt?: string | null;

  provinceCode?: string | null;
  districtCode?: string | null;
  wardCode?: string | null;

  wasteItems?: Array<{
    wasteType?: string | null;
    weightKg?: number | null;
  }>;

  actualWasteItems?: Array<{
    wasteType?: string | null;
    weightKg?: number | null;
  }>;

  actualWeight?: number | null;
  accuracyBucket?: string | null;

  images?: string[];
  evidenceImages?: string[];

  citizen?: {
    id?: number | null;
    fullName?: string | null;
    phone?: string | null;
    email?: string | null;
    avatar?: string | null;
  } | null;

  collector?: {
    id?: number | null;
    employeeCode?: string | null;
    fullName?: string | null;
    phone?: string | null;
    avatar?: string | null;
  } | null;
};

const UNKNOWN_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
  <rect width="160" height="160" rx="24" fill="#F1F5F9"/>
  <circle cx="80" cy="58" r="26" fill="#94A3B8"/>
  <path d="M38 126c6-22 24-34 42-34s36 12 42 34" fill="#94A3B8"/>
  <text x="80" y="148" text-anchor="middle" font-size="14" font-family="Arial" fill="#475569">Unknown</text>
</svg>
`)}`;

function formatInlineDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  if (!d.isValid()) return "—";
  return `${d.format("HH:mm")} • ${d.format("DD/MM/YYYY")}`;
}

function formatKm(v: unknown): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  const isInt = Math.abs(v - Math.round(v)) < 1e-9;
  const nf = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: isInt ? 0 : 1,
    minimumFractionDigits: 0,
  });
  return `${nf.format(v)} km`;
}

function formatAccuracyBucket(v?: string | null) {
  const key = (v ?? "").toUpperCase();

  switch (key) {
    case "MATCH":
      return "Khớp";
    case "MODERATE":
      return "Tương đối chính xác";
    case "HEAVY":
      return "Chênh lệch nhiều";
    case "NULL":
    case "":
      return "Chưa đánh giá";
    default:
      return v ?? "—";
  }
}

function accuracyToneClass(v?: string | null) {
  const key = (v ?? "").toUpperCase();

  switch (key) {
    case "MATCH":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "MODERATE":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "HEAVY":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "NULL":
    case "":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function isCompletedStatus(status?: string | null) {
  return (
    String(status ?? "")
      .trim()
      .toUpperCase() === "COMPLETED"
  );
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa =
    s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * (s2 * s2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lng)}` +
    `&zoom=18&addressdetails=1`;

  const res = await fetch(url, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`reverse geocode failed: ${res.status}`);
  const json: any = await res.json();
  return (json?.display_name as string) || null;
}

function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);
}

function sumWaste(items?: Array<{ weightKg?: number | null }>) {
  return (items ?? []).reduce(
    (sum, item) => sum + Number(item.weightKg ?? 0),
    0,
  );
}

type LocationNames = Awaited<ReturnType<typeof getLocationNamesFromCodes>>;
const locationNameCache = new Map<string, LocationNames>();

async function getLocationNamesCached(
  provinceCode?: string | null,
  districtCode?: string | null,
  wardCode?: string | null,
) {
  const key = [provinceCode || "", districtCode || "", wardCode || ""].join(
    "|",
  );
  const cached = locationNameCache.get(key);
  if (cached) return cached;

  const res = await getLocationNamesFromCodes(
    provinceCode ?? undefined,
    districtCode ?? undefined,
    wardCode ?? undefined,
  );
  locationNameCache.set(key, res);
  return res;
}

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  report: ReportDetailData | null;
};

export default function ReportDetailModal({
  open,
  onClose,
  loading = false,
  report,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const lat = report?.latitude ?? null;
  const lng = report?.longitude ?? null;

  const osmEmbedUrl = useMemo(() => {
    if (lat == null || lng == null) return null;
    const d = 0.004;
    const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox,
    )}&layer=mapnik&marker=${lat},${lng}`;
  }, [lat, lng]);

  const statusCode = useMemo(() => {
    const raw = report?.status ?? "PENDING";
    return typeof raw === "string" ? raw : "PENDING";
  }, [report?.status]);

  const isCompleted = useMemo(
    () => isCompletedStatus(report?.status),
    [report?.status],
  );

  const hasActualReport = useMemo(() => {
    if (!isCompleted) return false;
    return (
      (report?.actualWasteItems?.length ?? 0) > 0 ||
      report?.actualWeight != null ||
      report?.accuracyBucket != null
    );
  }, [
    isCompleted,
    report?.actualWasteItems,
    report?.actualWeight,
    report?.accuracyBucket,
  ]);

  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setMyPos(null),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 },
    );
  }, [open]);

  const [geoName, setGeoName] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setGeoName(null);
    if (lat == null || lng == null) return;

    const controller = new AbortController();
    const t = window.setTimeout(() => {
      reverseGeocode(lat, lng, controller.signal)
        .then((name) => setGeoName(name))
        .catch(() => setGeoName(null));
    }, 250);

    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [open, lat, lng]);

  const [areaNames, setAreaNames] = useState<LocationNames | null>(null);

  useEffect(() => {
    if (!open || !report) return;

    const p = report.provinceCode;
    const d = report.districtCode;
    const w = report.wardCode;

    if (!p && !d && !w) {
      setAreaNames(null);
      return;
    }

    let cancelled = false;
    setAreaNames(null);

    getLocationNamesCached(p, d, w)
      .then((names) => {
        if (!cancelled) setAreaNames(names);
      })
      .catch(() => {
        if (!cancelled) setAreaNames(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, report]);

  const variants = useMemo(() => {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: reduceMotion ? 0.08 : 0.12 },
      },
      exit: {
        opacity: 0,
        transition: { duration: reduceMotion ? 0.08 : 0.12 },
      },
    };
  }, [reduceMotion]);

  const citizen = report?.citizen ?? null;
  const collector = report?.collector ?? null;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const shipperFeedbackImages = Array.isArray(report?.evidenceImages)
    ? report.evidenceImages
    : [];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className="fixed inset-0 z-[1400] bg-black/50 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="
              fixed inset-x-4 sm:inset-x-6 md:inset-x-10
              top-[3vh] bottom-[3vh]
              mx-auto max-w-4xl
              flex flex-col overflow-hidden
              rounded-3xl bg-white shadow-2xl ring-1 ring-black/5
            "
          >
            <div className="border-b bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-lg sm:text-xl font-semibold text-white">
                      Chi tiết đơn {report?.id ? `#${report.id}` : ""}
                    </h2>

                    <TagPill kind="reportStatus" value={statusCode} />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-50">
                    <span className="truncate">
                      {geoName ?? report?.address ?? "—"}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="relative group grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20"
                  onClick={onClose}
                  aria-label="Đóng"
                  type="button"
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-slate-50">
              {loading ? (
                <div className="min-h-[60vh] grid place-items-center">
                  <LoadingSpinner color="blue" size="10" />
                </div>
              ) : !report ? (
                <div className="py-12 text-center text-slate-500">
                  Không có dữ liệu.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <SectionCard
                      className="lg:col-span-8"
                      title="Tóm tắt"
                      icon={<Clock className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <InfoRow
                          icon={<Truck className="h-4 w-4" />}
                          label="Nhận xử lý lúc"
                          value={formatInlineDateTime(report.assignedAt)}
                        />
                        <InfoRow
                          icon={<CheckCircle2 className="h-4 w-4" />}
                          label="Hoàn tất lúc"
                          value={formatInlineDateTime(report.completedAt)}
                        />
                        <InfoRow
                          icon={<Ruler className="h-4 w-4" />}
                          label="Khoảng cách"
                          value={formatKm(report.distanceKm)}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      className="lg:col-span-4"
                      title="Người tạo đơn"
                      icon={<User className="h-4 w-4 text-indigo-700" />}
                    >
                      <PersonBlock
                        avatar={citizen?.avatar ?? null}
                        name={citizen?.fullName ?? null}
                        phone={citizen?.phone ?? null}
                      />
                    </SectionCard>
                  </div>

                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <SectionCard
                      title="Thông tin đơn"
                      icon={<MapPin className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        <InfoRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Địa chỉ"
                          value={
                            <span className="font-semibold text-slate-800 leading-relaxed break-words">
                              {report.address ?? geoName ?? "—"}
                            </span>
                          }
                        />

                        <InfoRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Mô tả"
                          value={
                            <span className="font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                              {report.description || "—"}
                            </span>
                          }
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Thông tin tài xế được gán"
                      icon={<Truck className="h-4 w-4 text-indigo-700" />}
                    >
                      {collector ? (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                              Đơn đã được gán cho tài xế
                            </div>

                            <PersonBlock
                              avatar={collector.avatar ?? null}
                              name={collector.fullName ?? null}
                              phone={collector.phone ?? null}
                            />
                          </div>

                          <InfoRow
                            icon={<User className="h-4 w-4" />}
                            label="Mã nhân viên"
                            value={collector.employeeCode ?? "—"}
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          Đơn này chưa được gán cho tài xế nào.
                        </div>
                      )}
                    </SectionCard>
                  </div>
                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <SectionCard
                      title="Danh sách rác khai báo"
                      icon={<Leaf className="h-4 w-4 text-emerald-700" />}
                    >
                      {report.wasteItems?.length ? (
                        <div className="grid grid-cols-1 gap-2">
                          {report.wasteItems.map((w, idx) => (
                            <WasteRow
                              key={`${w.wasteType}-${idx}`}
                              type={w.wasteType ?? "—"}
                              weightKg={w.weightKg ?? 0}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>

                    <SectionCard
                      title="Danh sách rác thực tế"
                      icon={<Leaf className="h-4 w-4 text-indigo-700" />}
                    >
                      {report.actualWasteItems?.length ? (
                        <div className="grid grid-cols-1 gap-2">
                          {report.actualWasteItems.map((w, idx) => (
                            <WasteRow
                              key={`${w.wasteType}-${idx}`}
                              type={w.wasteType ?? "—"}
                              weightKg={w.weightKg ?? 0}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>

                    <SectionCard
                      title="Hình ảnh người dân"
                      icon={<Images className="h-4 w-4 text-indigo-700" />}
                    >
                      {report.images?.length ? (
                        <div className="grid grid-cols-2 gap-3 overflow-auto custom-scrollbar pr-1 max-h-72">
                          {report.images.map((url, i) => (
                            <button
                              key={`${url}-${i}`}
                              type="button"
                              onClick={() => setPreviewImage(url)}
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`report-${report.id}-${i}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-[150px] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>

                    {isCompleted ? (
                      <SectionCard
                        title="Hình ảnh từ tài xế"
                        icon={<Images className="h-4 w-4 text-indigo-700" />}
                      >
                        {shipperFeedbackImages.length ? (
                          <div className="grid grid-cols-2 gap-3 overflow-auto custom-scrollbar pr-1 max-h-72">
                            {shipperFeedbackImages.map((url, i) => (
                              <button
                                key={`${url}-${i}`}
                                type="button"
                                onClick={() => setPreviewImage(url)}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                              >
                                <img
                                  src={url}
                                  alt={`shipper-feedback-${report?.id ?? "report"}-${i}`}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-[150px] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-500">Tài xế không cung cấp ảnh.</div>
                        )}
                      </SectionCard>
                    ) : null}
                  </div>

                  {hasActualReport ? (
                    <div className="mt-4">
                      <SectionCard
                        title="So sánh báo cáo công dân và kết quả từ tài xế"
                        icon={
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        }
                        right={
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              accuracyToneClass(report.accuracyBucket),
                            ].join(" ")}
                          >
                            {formatAccuracyBucket(report.accuracyBucket)}
                          </span>
                        }
                      >
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-slate-900">
                                Công dân khai báo
                              </div>
                              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Ban đầu
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {report.wasteItems?.length ? (
                                report.wasteItems.map((w, idx) => (
                                  <WasteCompareRow
                                    key={`declared-${w.wasteType}-${idx}`}
                                    type={w.wasteType ?? "—"}
                                    weightKg={w.weightKg ?? 0}
                                  />
                                ))
                              ) : (
                                <div className="text-sm text-slate-500">
                                  Không có dữ liệu
                                </div>
                              )}
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2">
                              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Tổng khối lượng khai báo
                              </div>
                              <div className="mt-1 text-base font-semibold text-slate-900">
                                {sumWaste(report.wasteItems)} kg
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-slate-900">
                                Tài xế xác nhận thực tế
                              </div>
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Thực tế
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              {report.actualWasteItems?.length ? (
                                report.actualWasteItems.map((w, idx) => (
                                  <WasteCompareRow
                                    key={`actual-${w.wasteType}-${idx}`}
                                    type={w.wasteType ?? "—"}
                                    weightKg={w.weightKg ?? 0}
                                  />
                                ))
                              ) : (
                                <div className="text-sm text-slate-500">
                                  Không có dữ liệu
                                </div>
                              )}
                            </div>

                            <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-3 py-2">
                              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Tổng khối lượng thực tế
                              </div>
                              <div className="mt-1 text-base font-semibold text-emerald-700">
                                {report.actualWeight ?? 0} kg
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Đánh giá tổng từ hệ thống
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                accuracyToneClass(report.accuracyBucket),
                              ].join(" ")}
                            >
                              {formatAccuracyBucket(report.accuracyBucket)}
                            </span>

                            {collector?.fullName ? (
                              <span className="text-sm text-slate-600">
                                Báo cáo xác nhận bởi{" "}
                                <span className="font-semibold text-slate-900">
                                  {collector.fullName}
                                </span>
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                            Hệ thống đối chiếu dữ liệu công dân khai báo với dữ
                            liệu thực tế do tài xế xác nhận sau khi hoàn thành
                            đơn.
                          </div>
                        </div>
                      </SectionCard>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <SectionCard
                      title="Bản đồ"
                      icon={<MapPin className="h-4 w-4 text-emerald-700" />}
                    >
                      {osmEmbedUrl ? (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <iframe
                            title="map"
                            src={osmEmbedUrl}
                            className="h-[360px] w-full"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="text-slate-500">Không có tọa độ.</div>
                      )}
                    </SectionCard>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="
                  rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2
                  font-semibold text-slate-100
                  hover:brightness-90 hover:scale-[1.02] transition
                "
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>

          {previewImage ? (
            <div
              className="fixed inset-0 z-[1600] bg-black/85 flex items-center justify-center p-4"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                alt="preview"
                className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SectionCard({
  title,
  icon,
  right,
  className,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        "flex flex-col min-h-0",
        className ?? "",
      ].join(" ")}
    >
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-slate-50">
              {icon}
            </span>
          ) : null}
          <div className="font-semibold text-slate-900 truncate">{title}</div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="p-4 flex-1 min-h-0">{children}</div>
    </div>
  );
}

function InfoRow(props: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-slate-500">{props.icon}</span>
        {props.label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {props.value}
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string | null }) {
  const [imgSrc, setImgSrc] = useState<string>(src || UNKNOWN_AVATAR);

  useEffect(() => {
    setImgSrc(src || UNKNOWN_AVATAR);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={name ?? "unknown-avatar"}
      className="h-14 w-14 rounded-2xl border border-slate-200 object-cover bg-slate-100 shadow-sm"
      loading="lazy"
      decoding="async"
      onError={() => setImgSrc(UNKNOWN_AVATAR)}
    />
  );
}

function PersonBlock({
  avatar,
  name,
  phone,
  email,
}: {
  avatar: string | null;
  name: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={avatar} name={name} />

      <div className="min-w-0">
        <div className="font-semibold text-slate-900 truncate">
          {name ?? "Không rõ"}
        </div>

        <div className="mt-1 flex flex-col gap-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {phone ? (
              <a
                className="font-semibold text-slate-700 hover:underline"
                href={`tel:${phone}`}
              >
                {phone}
              </a>
            ) : (
              "—"
            )}
          </span>

          {email !== undefined ? (
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {email ? (
                <a
                  className="font-semibold text-slate-700 hover:underline"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              ) : (
                "—"
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WasteRow({ type, weightKg }: { type: string; weightKg: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
      <TagPill kind="wasteType" value={type as any} className="!px-2.5 !py-1" />
      <span className="tabular-nums text-sm font-semibold text-emerald-700">
        {weightKg} kg
      </span>
    </div>
  );
}

function WasteCompareRow({
  type,
  weightKg,
}: {
  type: string;
  weightKg: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
      <TagPill kind="wasteType" value={type as any} className="!px-2.5 !py-1" />
      <span className="tabular-nums text-sm font-semibold text-slate-900">
        {weightKg} kg
      </span>
    </div>
  );
}
