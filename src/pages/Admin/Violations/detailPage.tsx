// detailPage.tsx  – Chi tiết Vi phạm Báo cáo
import dayjs from "dayjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    AlertTriangle,
    Loader2,
    Clock,
    Eye,
    FileText,
    Images,
    MapPin,
    ShieldBan,
    User,
    Lock,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";

import type {
    FakeReportViolationDetail,
    FakeReportViolator,
} from "@/api/types/violation.types";

/** ===== Helpers ===== */
function formatInlineDateTime(iso?: string | null) {
    if (!iso) return "—";
    const d = dayjs(iso);
    return `${d.format("HH:mm")} • ${d.format("DD/MM/YYYY")}`;
}

function wasteTypeLabel(type: string) {
    switch (type) {
        case "ORGANIC":
            return "Rác hữu cơ";
        case "RECYCLABLE":
            return "Rác tái chế";
        case "HAZARDOUS":
            return "Rác nguy hại";
        default:
            return type;
    }
}

/** Lock scroll khi modal mở */
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

/** ===== Props ===== */
type Props = {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    details: FakeReportViolationDetail[];
    violator: FakeReportViolator | null;
    onBanUser?: () => void;
    isBanning?: boolean;
};

export default function ViolationDetailModal({
    open,
    onClose,
    loading,
    details,
    violator,
    onBanUser,
    isBanning = false,
}: Props) {
    useLockBodyScroll(open);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

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

    const variants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: reduceMotion ? 0.08 : 0.14 },
        },
        exit: {
            opacity: 0,
            transition: { duration: reduceMotion ? 0.08 : 0.1 },
        },
    }), [reduceMotion]);

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
              top-[3vh] bottom-[3vh]
              mx-auto max-w-5xl
              flex flex-col overflow-hidden
              rounded-2xl bg-emerald-600 shadow-2xl
            "
                    >
                        {/* HEADER */}
                        <div className="border-b border-emerald-500 px-5 py-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="m-0 text-lg sm:text-xl font-extrabold text-white">
                                            Chi tiết Vi phạm
                                            {violator ? ` · ${violator.fullName}` : ""}
                                        </h2>
                                        {violator && (
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${violator.status === "BANNED"
                                                    ? "bg-rose-100 border-rose-300 text-rose-800"
                                                    : "bg-emerald-100 border-emerald-300 text-emerald-800"
                                                    }`}
                                            >
                                                {violator.status === "BANNED" ? "Bị khóa" : "Hoạt động"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-sm text-emerald-100">
                                        <span>
                                            {violator?.email ?? "—"} · {details.length} bản ghi vi phạm
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="grid h-9 w-9 place-items-center rounded-md hover:bg-emerald-500"
                                    onClick={onClose}
                                    aria-label="Đóng"
                                    type="button"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-slate-50">
                            {loading ? (
                                <div className="min-h-[40vh] grid place-items-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                                        <p className="text-sm text-slate-500 font-medium">Đang tải bản ghi vi phạm...</p>
                                    </div>
                                </div>
                            ) : details.length === 0 ? (
                                <div className="min-h-[40vh] grid place-items-center text-center">
                                    <div>
                                        <ShieldBan className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">Không có dữ liệu vi phạm chi tiết.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Violator summary card */}
                                    {violator && (
                                        <SectionCard
                                            title="Thông tin người vi phạm"
                                            icon={<User className="h-4 w-4 text-indigo-700" />}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 flex-shrink-0 rounded-full bg-emerald-100 border border-slate-200 overflow-hidden shadow-sm">
                                                    {violator.avatar ? (
                                                        <img src={violator.avatar} className="h-full w-full object-cover" alt={violator.fullName} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-emerald-700 font-bold text-xl">
                                                            {violator.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-extrabold text-slate-900 text-base">{violator.fullName}</div>
                                                    <div className="text-sm text-slate-500 mt-0.5">{violator.email}</div>
                                                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-0.5 text-xs font-bold text-rose-700">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        {violator.violationCount} lần vi phạm
                                                    </div>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Detail records */}
                                    {details.map((item, idx) => (
                                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                            {/* Record header */}
                                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
                                                        LOG #{idx + 1} · ID {item.id}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        <Clock className="inline h-3 w-3 mr-1" />
                                                        {formatInlineDateTime(item.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                                {/* Left: Collector Evidence */}
                                                <SectionCard
                                                    title={`Bằng chứng từ ${item.reporter.role === 'COLLECTOR' ? 'Tài xế' : item.reporter.role}`}
                                                    icon={<ShieldBan className="h-4 w-4 text-rose-600" />}
                                                >
                                                    <div className="space-y-3 text-sm">
                                                        <InfoRow
                                                            icon={<User className="h-4 w-4" />}
                                                            label="Người báo cáo"
                                                            value={
                                                                <span className="font-semibold text-slate-800">
                                                                    {item.reporter.fullName}
                                                                    <span className="ml-1 text-slate-400 font-normal">({item.reporter.email})</span>
                                                                </span>
                                                            }
                                                        />
                                                        <InfoRow
                                                            icon={<FileText className="h-4 w-4" />}
                                                            label="Lý do từ Tài xế"
                                                            value={
                                                                <span className={`font-semibold ${item.collectorReason ? "text-rose-600" : "text-slate-500 italic"}`}>
                                                                    {item.collectorReason || "Không có"}
                                                                </span>
                                                            }
                                                        />
                                                        {item.collectorEvidence?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
                                                                    <Images className="inline h-3.5 w-3.5 mr-1" />
                                                                    Ảnh bằng chứng ({item.collectorEvidence.length})
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {item.collectorEvidence.map((img, i) => (
                                                                        <button
                                                                            key={i}
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(img)}
                                                                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                                                        >
                                                                            <img
                                                                                src={img}
                                                                                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                                                                alt={`Evidence ${i + 1}`}
                                                                            />
                                                                            <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </SectionCard>

                                                {/* Right: Original Report */}
                                                <SectionCard
                                                    title={`Báo cáo gốc #${item.originalReport.id}`}
                                                    icon={<Eye className="h-4 w-4 text-slate-600" />}
                                                >
                                                    <div className="space-y-3 text-sm">
                                                        <InfoRow
                                                            icon={<MapPin className="h-4 w-4" />}
                                                            label="Địa chỉ"
                                                            value={<span className="font-semibold text-slate-800">{item.originalReport.address || "—"}</span>}
                                                        />
                                                        <InfoRow
                                                            icon={<FileText className="h-4 w-4" />}
                                                            label="Mô tả của người dân"
                                                            value={
                                                                <span className="italic text-slate-700">
                                                                    „{item.originalReport.citizenDescription || "Không có"}"
                                                                </span>
                                                            }
                                                        />

                                                        {item.originalReport.estimatedWaste?.length > 0 && (
                                                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Rác ước tính</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.originalReport.estimatedWaste.map((w, i) => (
                                                                        <span key={i} className="px-2.5 py-0.5 bg-white border border-slate-200 text-[11px] rounded-full font-semibold text-slate-700">
                                                                            {wasteTypeLabel(w.type)}: {w.weight}kg
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.originalReport.citizenImages?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
                                                                    <Images className="inline h-3.5 w-3.5 mr-1" />
                                                                    Ảnh từ người dân ({item.originalReport.citizenImages.length})
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {item.originalReport.citizenImages.map((img, i) => (
                                                                        <button
                                                                            key={i}
                                                                            type="button"
                                                                            onClick={() => setPreviewImage(img)}
                                                                            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 opacity-90 hover:opacity-100"
                                                                        >
                                                                            <img
                                                                                src={img}
                                                                                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                                                                alt={`Citizen ${i + 1}`}
                                                                            />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </SectionCard>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
                            {violator && (
                                <button
                                    onClick={onBanUser}
                                    disabled={violator.status === "BANNED" || isBanning}
                                    className={[
                                        "inline-flex h-9 items-center justify-center gap-1 rounded-xl border px-3 text-sm font-medium transition",
                                        violator.status === "BANNED"
                                            ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                            : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300",
                                        isBanning ? "opacity-70 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    type="button"
                                >
                                    {isBanning ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang khóa...
                                        </span>
                                    ) : violator.status === "BANNED" ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Lock className="h-4 w-4" />
                                            Tài khoản đã bị khóa
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1">
                                            <Lock className="h-4 w-4" />
                                            Khóa tài khoản
                                        </span>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2 font-extrabold text-white hover:brightness-90 transition"
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
            <div className="p-4">{children}</div>
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                {props.icon}
                {props.label}
            </div>
            <div className="text-sm">{props.value}</div>
        </div>
    );
}
