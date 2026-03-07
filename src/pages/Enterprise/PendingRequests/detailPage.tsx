// detailPage.tsx
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
  ExternalLink,
  AlertTriangle,
  FileText,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type {
  WaitingReportDetail,
  EnterpriseReport,
} from "@/redux/api/enterprise/reports/types";

import TagPill from "../components/tagPill";

import { getLocationNamesFromCodes } from "@/utils/helpers";

/** ===== Helpers ===== */
function toMs(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatInlineDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
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

/** Chỉ tick khi modal mở */
function useNowWhenOpen(open: boolean, intervalMs = 1000) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (!open) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [open, intervalMs]);
  return nowMs;
}

/** Lock scroll */
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

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371; // km
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

/** Reverse geocode bằng OSM Nominatim */
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

/** ===== Location name cache ===== */
type LocationNames = Awaited<ReturnType<typeof getLocationNamesFromCodes>>;
const locationNameCache = new Map<string, LocationNames>();

async function getLocationNamesCached(
  provinceCode?: string,
  districtCode?: string,
  wardCode?: string,
) {
  const key = [provinceCode || "", districtCode || "", wardCode || ""].join(
    "|",
  );
  const cached = locationNameCache.get(key);
  if (cached) return cached;

  const res = await getLocationNamesFromCodes(
    provinceCode,
    districtCode,
    wardCode,
  );
  locationNameCache.set(key, res);
  return res;
}

/** ===== Props ===== */
type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  detail: WaitingReportDetail | null;
  meta: EnterpriseReport | null;
};

export default function ReportDetailModal({
  open,
  onClose,
  loading,
  detail,
  meta,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const nowMs = useNowWhenOpen(open, 1000);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!open) setReady(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const report = detail?.report ?? null;

  const expMs = toMs(meta?.expiredAt);
  const leftMs = expMs ? expMs - nowMs : null;
  const expired = leftMs != null && leftMs <= 0;

  const lat = report?.latitude ?? null;
  const lng = report?.longitude ?? null;

  const googleMapUrl = useMemo(() => {
    if (lat == null || lng == null) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }, [lat, lng]);

  const osmEmbedUrl = useMemo(() => {
    if (lat == null || lng == null) return null;
    const d = 0.004;
    const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox,
    )}&layer=mapnik&marker=${lat},${lng}`;
  }, [lat, lng]);

  /** ===== Status code (expired override) ===== */
  const statusCode = useMemo(() => {
    const raw = (report as any)?.status ?? (meta as any)?.status ?? "PENDING";
    if (expired) return "EXPIRED";
    return typeof raw === "string" ? raw : "PENDING";
  }, [report, meta, expired]);

  const isApproved = useMemo(() => {
    const s = String(statusCode || "").toUpperCase();
    return ["APPROVED", "ACCEPTED", "DONE", "COMPLETED"].includes(s);
  }, [statusCode]);

  /** ===== Distance from current location (fallback) ===== */
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setGeoErr(null);

    if (!navigator.geolocation) {
      setGeoErr("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeoErr("Không lấy được vị trí hiện tại (bị chặn quyền)."),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 },
    );
  }, [open]);

  const distanceKmFallback = useMemo(() => {
    if (!myPos || lat == null || lng == null) return null;
    const km = haversineKm(myPos.lat, myPos.lng, lat, lng);
    return Number.isFinite(km) ? km : null;
  }, [myPos, lat, lng]);

  const apiDistanceKm = (detail as any)?.distanceKm as number | undefined;

  const displayDistance = useMemo(() => {
    const km =
      typeof apiDistanceKm === "number"
        ? apiDistanceKm
        : typeof distanceKmFallback === "number"
          ? distanceKmFallback
          : null;
    return formatKm(km);
  }, [apiDistanceKm, distanceKmFallback]);

  /** ===== Reverse geocode ===== */
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

  /** ===== Area names from codes ===== */
  const [areaNames, setAreaNames] = useState<LocationNames | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!report) return;

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
  }, [
    open,
    report?.provinceCode,
    report?.districtCode,
    report?.wardCode,
    report,
  ]);

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className="fixed inset-0 z-[1400] bg-black/45"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose?.();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="
              fixed inset-x-4 sm:inset-x-6 md:inset-x-10
              top-[3vh] bottom-[3vh] sm:top-[6vh] sm:bottom-[6vh]
              mx-auto max-w-5xl
              flex flex-col overflow-hidden
              rounded-2xl border border-slate-200 bg-white shadow-2xl
            "
          >
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-lg sm:text-xl font-extrabold text-slate-900">
                      Chi tiết đơn{" "}
                      {report ? `#${report.id}` : meta?.id ? `#${meta.id}` : ""}
                    </h2>

                    <TagPill kind="reportStatus" value={statusCode} />
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <span className="truncate">
                      {geoName ?? report?.address ?? meta?.address ?? "—"}
                    </span>

                    {googleMapUrl ? (
                      <a
                        href={googleMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Maps
                      </a>
                    ) : null}
                  </div>
                </div>

                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md hover:bg-gray-100 "
                  onClick={onClose}
                  aria-label="Đóng"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* BODY */}
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
                  {!ready ? <ReadyOnce onReady={() => setReady(true)} /> : null}

                  {/* Top grid (layout mới) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-stretch">
                    {/* Left: Summary */}
                    <SectionCard
                      className="lg:col-span-8 h-full"
                      title="Tóm tắt"
                      icon={<Clock className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[1.75fr_1.75fr_1.5fr] gap-3">
                        <InfoRow
                          icon={<Clock className="h-4 w-4" />}
                          label="Tạo lúc"
                          value={formatInlineDateTime(report.createdAt)}
                        />

                        <InfoRow
                          icon={<Clock className="h-4 w-4" />}
                          label="Hết hạn lúc"
                          value={
                            expMs
                              ? `${dayjs(expMs).format("HH:mm")} • ${dayjs(expMs).format("DD/MM/YYYY")}`
                              : "—"
                          }
                        />

                        <InfoRow
                          icon={<Ruler className="h-4 w-4" />}
                          label="Khoảng cách"
                          value={displayDistance}
                        />

                        {!isApproved ? (
                          <div className="md:col-span-3">
                            <div
                              className={`
              rounded-2xl border px-4 py-3
              ${
                leftMs == null
                  ? "border-slate-200 bg-white"
                  : expired
                    ? "border-slate-200 bg-white"
                    : "border-rose-200 bg-rose-50"
              }
            `}
                            >
                              {leftMs == null ? (
                                <div className="text-sm font-extrabold text-slate-700">
                                  —
                                </div>
                              ) : expired ? (
                                <div className="text-sm font-extrabold text-slate-500">
                                  Đơn đã hết hạn
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-bold text-slate-700">
                                    Đơn hết hạn sau
                                  </div>
                                  <div className="tabular-nums text-lg font-extrabold text-rose-700">
                                    {formatCountdown(leftMs)}
                                  </div>
                                </div>
                              )}

                              {geoErr ? (
                                <div className="mt-2 flex items-start gap-2 text-xs text-amber-700">
                                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                                  <span>{geoErr}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </SectionCard>

                    {/* Right: Citizen (cao ngang bên trái) */}
                    <SectionCard
                      className="lg:col-span-4 h-full"
                      title="Người tạo đơn"
                      icon={<User className="h-4 w-4 text-indigo-700" />}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={(citizen as any)?.avatar ?? null}
                          name={(citizen as any)?.fullName ?? null}
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">
                            {(citizen as any)?.fullName ?? "—"}
                          </div>
                          <div className="mt-1 flex flex-col gap-1 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {(citizen as any)?.phone ? (
                                <a
                                  className="font-semibold text-slate-700 hover:underline"
                                  href={`tel:${(citizen as any).phone}`}
                                >
                                  {(citizen as any).phone}
                                </a>
                              ) : (
                                "—"
                              )}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {(citizen as any)?.email ? (
                                <a
                                  className="font-semibold text-slate-700 hover:underline"
                                  href={`mailto:${(citizen as any).email}`}
                                >
                                  {(citizen as any).email}
                                </a>
                              ) : (
                                "—"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                  {/* Details (2-1-2) */}
                  <div className="mt-4 grid grid-cols-1 gap-4 items-stretch lg:grid-cols-[1.75fr_1.5fr_1.75fr]">
                    {/* Thông tin đơn (2) */}
                    <SectionCard
                      className="h-full"
                      title="Thông tin đơn"
                      icon={<MapPin className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        <InfoRow
                          icon={<Leaf className="h-4 w-4" />}
                          label="Khu vực"
                          value={
                            areaNames?.fullAddress ? (
                              <span className="font-semibold text-slate-800 break-words">
                                {areaNames.fullAddress}
                              </span>
                            ) : (
                              <span className="text-slate-500 tabular-nums">
                                {report.provinceCode}-{report.districtCode}-
                                {report.wardCode}
                              </span>
                            )
                          }
                        />

                        <InfoRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Địa chỉ"
                          value={
                            <span className="font-semibold text-slate-800 leading-relaxed break-words">
                              {report.address ??
                                geoName ??
                                meta?.address ??
                                "—"}
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

                    {/* Danh sách rác (1) */}
                    <SectionCard
                      className=" h-full"
                      title="Danh sách rác"
                      icon={<Leaf className="h-4 w-4 text-emerald-700" />}
                    >
                      {report.wasteItems?.length ? (
                        <div className="grid grid-cols-1 gap-2">
                          {report.wasteItems.map((w, idx) => (
                            <div
                              key={`${w.wasteType}-${idx}`}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between"
                            >
                              <TagPill
                                kind="wasteType"
                                value={w.wasteType as any}
                                className="!px-2.5 !py-1"
                              />
                              <span className="tabular-nums text-sm font-extrabold text-emerald-700">
                                {w.weightKg} kg
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>

                    {/* Hình ảnh (2) */}
                    <SectionCard
                      className="h-full"
                      title="Hình ảnh"
                      icon={<Images className="h-4 w-4 text-indigo-700" />}
                    >
                      {report.images?.length ? (
                        <div
                          className={[
                            "grid gap-3 overflow-auto custom-scrollbar pr-1",
                            "max-h-60",
                            report.images.length === 1
                              ? "grid-cols-1"
                              : report.images.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2",
                          ].join(" ")}
                        >
                          {report.images.map((url, i) => (
                            <a
                              key={`${url}-${i}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`report-${report.id}-${i}`}
                                loading="lazy"
                                decoding="async"
                                className={[
                                  "w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]",
                                  report.images.length === 1 ? "h-50" : "h-30",
                                ].join(" ")}
                              />
                              <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>
                  </div>

                  {/* Map full width */}
                  <div className="mt-4">
                    <SectionCard
                      title="Bản đồ"
                      icon={<MapPin className="h-4 w-4 text-emerald-700" />}
                      right={
                        googleMapUrl ? (
                          <a
                            href={googleMapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700 hover:underline"
                          >
                            <MapPin className="h-4 w-4" />
                            Mở Google Maps
                          </a>
                        ) : null
                      }
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

            {/* FOOTER */}
            <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="
                  rounded-xl border border-slate-200 bg-white px-4 py-2
                  font-extrabold text-slate-700
                  hover:bg-slate-50 active:scale-[0.98] transition
                "
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Render once to mark ready */
function ReadyOnce({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

/* ===================== UI atoms ===================== */
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
          <div className="font-extrabold text-slate-900 truncate">{title}</div>
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
      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
        <span className="text-slate-500">{props.icon}</span>
        {props.label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">
        {props.value}
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string | null }) {
  const [broken, setBroken] = useState(false);

  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).slice(0, 2);
    return parts
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("");
  }, [name]);

  if (!src || broken) {
    return (
      <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-100 grid place-items-center">
        <span className="text-sm font-extrabold text-slate-700">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? "avatar"}
      className="h-12 w-12 rounded-2xl border border-slate-200 object-cover bg-slate-100"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
