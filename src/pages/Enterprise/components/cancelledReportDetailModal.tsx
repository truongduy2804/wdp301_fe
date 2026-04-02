import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Clock3,
  FileText,
  Images,
  Leaf,
  MapPin,
  Phone,
  ShieldAlert,
  Truck,
  User,
  X,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type { CancelledEnterpriseReport } from "@/redux/api/enterprise/reports/types";

import TagPill from "./tagPill";
import {
  formatReportDateTime,
  getCancellationActorClasses,
  getCancellationActorLabel,
  getCancellationReason,
  getCancelledStageClasses,
  getCancelledStageLabel,
  sumWasteWeight,
} from "./cancelledReportUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  report: CancelledEnterpriseReport | null;
};

function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);
}

function FallbackAvatar({ name }: { name?: string | null }) {
  const initials = useMemo(() => {
    const text = (name ?? "").trim();
    if (!text) return "U";

    return text
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .filter(Boolean)
      .join("");
  }, [name]);

  return (
    <div className="grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-100">
      <span className="text-sm font-semibold text-slate-700">{initials}</span>
    </div>
  );
}

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return <FallbackAvatar name={name} />;
  }

  return (
    <img
      src={src}
      alt={name ?? "avatar"}
      className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-100 object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

function PersonBlock({
  avatar,
  name,
  phone,
  subtitle,
}: {
  avatar?: string | null;
  name?: string | null;
  phone?: string | null;
  subtitle?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={avatar} name={name} />

      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-slate-900">
          {name ?? "Không rõ"}
        </div>

        {subtitle ? (
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {subtitle}
          </div>
        ) : null}

        <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
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
        </div>
      </div>
    </div>
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
        "flex min-h-0 flex-col",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-slate-50">
              {icon}
            </span>
          ) : null}
          <div className="truncate font-semibold text-slate-900">{title}</div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="min-h-0 flex-1 p-4">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function WasteRow({
  wasteType,
  weightKg,
}: {
  wasteType: string;
  weightKg: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
      <TagPill kind="wasteType" value={wasteType} className="!px-2.5 !py-1" />
      <span className="tabular-nums text-sm font-semibold text-emerald-700">
        {weightKg} kg
      </span>
    </div>
  );
}

function StatusMetaPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function CancelledReportDetailModal({
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const osmEmbedUrl = useMemo(() => {
    if (report?.latitude == null || report?.longitude == null) return null;

    const delta = 0.004;
    const bbox = [
      report.longitude - delta,
      report.latitude - delta,
      report.longitude + delta,
      report.latitude + delta,
    ].join(",");

    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox,
    )}&layer=mapnik&marker=${report.latitude},${report.longitude}`;
  }, [report?.latitude, report?.longitude]);

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

  const cancellationReason = report ? getCancellationReason(report) : "—";
  const collectorInfo = report?.cancelDetails?.collectorInfo ?? null;
  const collectorLogs = report?.cancelDetails?.collectorLogs ?? [];
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          onClick={(event) => {
            if (event.target === overlayRef.current) onClose();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="
              fixed inset-x-4 top-[3vh] bottom-[3vh]
              mx-auto flex max-w-5xl flex-col overflow-hidden
              rounded-3xl bg-white shadow-2xl ring-1 ring-black/5
              sm:inset-x-6 md:inset-x-10
            "
          >
            <div className="border-b bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-lg font-semibold text-white sm:text-xl">
                      Chi tiết đơn đã hủy {report?.id ? `#${report.id}` : ""}
                    </h2>
                    <TagPill kind="reportStatus" value="CANCELLED" />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-50">
                    <span className="truncate">{report?.address ?? "—"}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20"
                  onClick={onClose}
                  aria-label="Đóng"
                  type="button"
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-6">
              {loading ? (
                <div className="grid min-h-[60vh] place-items-center">
                  <LoadingSpinner color="blue" size="10" />
                </div>
              ) : !report ? (
                <div className="py-12 text-center text-slate-500">
                  Không có dữ liệu.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <SectionCard
                      className="lg:col-span-8"
                      title="Tóm tắt hủy đơn"
                      icon={<Clock3 className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <InfoRow
                          icon={<Clock3 className="h-4 w-4" />}
                          label="Tạo lúc"
                          value={formatReportDateTime(report.createdAt)}
                        />
                        <InfoRow
                          icon={<AlertTriangle className="h-4 w-4" />}
                          label="Hủy lúc"
                          value={
                            <span className="text-rose-700">
                              {formatReportDateTime(report.cancelledAt)}
                            </span>
                          }
                        />
                        <InfoRow
                          icon={<ShieldAlert className="h-4 w-4" />}
                          label="Hủy bởi"
                          value={
                            <StatusMetaPill
                              label={getCancellationActorLabel(report.cancelBy)}
                              className={getCancellationActorClasses(
                                report.cancelBy,
                              )}
                            />
                          }
                        />
                        <InfoRow
                          icon={<Truck className="h-4 w-4" />}
                          label="Trạng thái trước khi hủy"
                          value={
                            <StatusMetaPill
                              label={getCancelledStageLabel(report.type)}
                              className={getCancelledStageClasses(report.type)}
                            />
                          }
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      className="lg:col-span-4"
                      title="Người tạo đơn"
                      icon={<User className="h-4 w-4 text-indigo-700" />}
                    >
                      <PersonBlock
                        avatar={report.citizen?.avatar ?? null}
                        name={report.citizen?.fullName ?? null}
                        phone={report.citizen?.phone ?? null}
                        subtitle="Người dân"
                      />
                    </SectionCard>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <SectionCard
                      title="Thông tin đơn"
                      icon={<MapPin className="h-4 w-4 text-emerald-700" />}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        <InfoRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Địa chỉ"
                          value={
                            <span className="break-words font-semibold leading-relaxed text-slate-800">
                              {report.address ?? "—"}
                            </span>
                          }
                        />
                        <InfoRow
                          icon={<FileText className="h-4 w-4" />}
                          label="Mô tả"
                          value={
                            <span className="whitespace-pre-wrap break-words font-semibold leading-relaxed text-slate-800">
                              {report.description || "—"}
                            </span>
                          }
                        />
                        <InfoRow
                          icon={<Leaf className="h-4 w-4" />}
                          label="Tổng khối lượng khai báo"
                          value={`${sumWasteWeight(report.wasteItems)} kg`}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Lý do hủy"
                      icon={<AlertTriangle className="h-4 w-4 text-rose-700" />}
                    >
                      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                          Thông tin chính
                        </div>
                        <div className="mt-2 text-sm font-semibold leading-7 text-slate-800">
                          {cancellationReason}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoRow
                          icon={<ShieldAlert className="h-4 w-4" />}
                          label="Bên thực hiện hủy"
                          value={getCancellationActorLabel(report.cancelBy)}
                        />
                        <InfoRow
                          icon={<Truck className="h-4 w-4" />}
                          label="Bối cảnh hủy"
                          value={getCancelledStageLabel(report.type)}
                        />
                      </div>
                    </SectionCard>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <SectionCard
                      title="Danh sách rác"
                      icon={<Leaf className="h-4 w-4 text-emerald-700" />}
                    >
                      {report.wasteItems?.length ? (
                        <div className="grid grid-cols-1 gap-2">
                          {report.wasteItems.map((item, index) => (
                            <WasteRow
                              key={`${item.wasteType}-${index}`}
                              wasteType={item.wasteType}
                              weightKg={item.weightKg}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">—</div>
                      )}
                    </SectionCard>

                    <SectionCard
                      title="Hình ảnh báo cáo"
                      icon={<Images className="h-4 w-4 text-indigo-700" />}
                    >
                      {report.images?.length ? (
                        <div className="custom-scrollbar grid max-h-72 grid-cols-2 gap-3 overflow-auto pr-1">
                          {report.images.map((url, index) => (
                            <button
                              key={`${url}-${index}`}
                              type="button"
                              onClick={() => setPreviewImage(url)}
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`cancelled-report-${report.id}-${index}`}
                                loading="lazy"
                                decoding="async"
                                className="h-[150px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500">Không có hình ảnh.</div>
                      )}
                    </SectionCard>
                  </div>

                  {collectorInfo || collectorLogs.length ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <SectionCard
                        title="Nhân viên liên quan"
                        icon={<Truck className="h-4 w-4 text-indigo-700" />}
                      >
                        {collectorInfo ? (
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                                Nhân viên thu gom được nhắc đến trong hủy đơn
                              </div>
                              <PersonBlock
                                avatar={collectorInfo.avatar ?? null}
                                name={collectorInfo.fullName ?? null}
                                phone={collectorInfo.phone ?? null}
                                subtitle={
                                  collectorInfo.employeeCode
                                    ? `Mã NV: ${collectorInfo.employeeCode}`
                                    : "Nhân viên thu gom"
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            Không có thông tin nhân viên thu gom đi kèm.
                          </div>
                        )}
                      </SectionCard>

                      <SectionCard
                        title="Nhật ký hủy từ nhân viên"
                        icon={<FileText className="h-4 w-4 text-rose-700" />}
                      >
                        {collectorLogs.length ? (
                          <div className="custom-scrollbar max-h-[360px] space-y-3 overflow-auto pr-1">
                            {collectorLogs.map((log, index) => (
                              <div
                                key={`collector-log-${index}`}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-sm font-semibold text-slate-900">
                                    Nhật ký #{index + 1}
                                  </div>
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {(log.images ?? []).length} ảnh
                                  </span>
                                </div>

                                <div className="mt-2 text-sm leading-7 text-slate-700">
                                  {log.reason?.trim() ||
                                    "Không có mô tả chi tiết."}
                                </div>

                                {log.images?.length ? (
                                  <div className="mt-3 grid grid-cols-2 gap-3">
                                    {log.images.map((image, imageIndex) => (
                                      <button
                                        key={`${image}-${imageIndex}`}
                                        type="button"
                                        onClick={() => setPreviewImage(image)}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                      >
                                        <img
                                          src={image}
                                          alt={`collector-log-${index}-${imageIndex}`}
                                          loading="lazy"
                                          decoding="async"
                                          className="h-[132px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            Không có nhật ký xử lý từ nhân viên thu gom.
                          </div>
                        )}
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
                            title="cancelled-report-map"
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

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
              <button
                onClick={onClose}
                className="
                  rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2
                  font-semibold text-white transition hover:scale-[1.02] hover:brightness-95
                "
                type="button"
              >
                Đóng
              </button>
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
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
