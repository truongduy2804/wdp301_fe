import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  easeOut,
  easeIn,
} from "framer-motion";
import {
  Mail,
  Phone,
  Building2,
  CalendarClock,
  X,
  User,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type { Collector } from "@/redux/api/enterprise/collectors/types";
import TagPill from "../components/tagPill";

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  detail: Collector | null;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.format("HH:mm")} • ${d.format("DD/MM/YYYY")}`;
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
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-emerald-100">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? "Avatar"}
      className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-emerald-100"
      onError={() => setBroken(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  icon?: any;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl p-5 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-md group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <TrendingUp
            className={`w-4 h-4 ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                  ? "text-red-500 rotate-180"
                  : "text-gray-400"
            }`}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-base text-gray-900 break-words">{value}</div>
      </div>
    </div>
  );
}

export default function CollectorDetailModal({
  open,
  onClose,
  loading,
  detail,
}: Props) {
  useLockBodyScroll(open);

  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // portal safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const variants = useMemo(() => {
    const d = reduceMotion ? 0.08 : 0.14;
    return {
      overlay: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: d } },
        exit: { opacity: 0, transition: { duration: d } },
      },
      panel: {
        hidden: { opacity: 0, y: 10, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: d, ease: easeOut },
        },
        exit: {
          opacity: 0,
          y: 10,
          scale: 0.985,
          transition: { duration: d, ease: easeIn },
        },
      },
    };
  }, [reduceMotion]);

  const stats = (detail as any)?.statistics ?? null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants.overlay}
          className="fixed inset-0 z-[99999] bg-black/45"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed inset-x-4 sm:inset-x-6 md:inset-x-10
              top-[4vh] bottom-[4vh]
              mx-auto max-w-2xl
              flex flex-col overflow-hidden
              rounded-md  bg-white shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scroll container (nội dung dài -> scroll ở đây) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Header with gradient background */}
              <div className="relative bg-emerald-600 px-8 pt-8 pb-24">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white">
                      {detail
                        ? `Collector #${detail.id}`
                        : "Chi tiết collector"}
                    </span>
                  </div>

                  {/* Giữ như UI cũ của bạn (nếu TagPill signature khác thì thay lại theo component của bạn) */}
                  {detail?.status ? (
                    <TagPill
                      kind="collectorStatus"
                      value={
                        (detail as any).status === "AVAILABLE"
                          ? "Sẵn sàng"
                          : (detail as any).status === "ON_TASK"
                            ? "Đang làm"
                            : "default"
                      }
                    />
                  ) : null}
                </div>
              </div>

              {/* Profile section overlapping header */}
              <div className="relative px-8 -mt-16 pb-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-start gap-6">
                    <Avatar
                      src={(detail as any)?.avatar ?? null}
                      name={detail?.fullName ?? null}
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {detail?.fullName ?? "—"}
                      </h2>
                      {(detail as any)?.enterpriseName && (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {(detail as any).enterpriseName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner color="blue" size="10" />
                </div>
              ) : !detail ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <p className="text-lg">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="px-8 pb-8 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        Thông tin liên hệ
                      </h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <InfoRow
                        icon={Mail}
                        label="Email"
                        value={detail.email || "—"}
                      />
                      <InfoRow
                        icon={Phone}
                        label="Số điện thoại"
                        value={detail.phone || "—"}
                      />
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-emerald-600" />
                        </div>
                        Thông tin hệ thống
                      </h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <InfoRow
                        icon={Building2}
                        label="Doanh nghiệp"
                        value={(detail as any)?.enterpriseName ?? "—"}
                      />
                      <InfoRow
                        icon={CalendarClock}
                        label="Thời gian tạo"
                        value={formatDateTime(
                          (detail as any)?.createdAt ?? null,
                        )}
                      />
                      <InfoRow
                        icon={CalendarClock}
                        label="Cập nhật trạng thái"
                        value={formatDateTime(
                          (detail as any)?.statusUpdatedAt ?? null,
                        )}
                      />
                    </div>
                  </div>

                  {/* Statistics (để đúng API của bạn: totalAssignments/completedAssignments/pendingAssignments) */}
                  {stats ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Thống kê hoạt động
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard
                          label="Tổng nhiệm vụ"
                          value={stats.totalAssignments ?? 0}
                          icon={CheckCircle2}
                          trend="neutral"
                        />
                        <StatCard
                          label="Hoàn thành"
                          value={stats.completedAssignments ?? 0}
                          icon={CheckCircle2}
                          trend="up"
                        />
                        <StatCard
                          label="Đang chờ"
                          value={stats.pendingAssignments ?? 0}
                          icon={CheckCircle2}
                          trend="neutral"
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Footer */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:brightness-90 transition-all duration-200 shadow-emerald-500/30  hover:scale-105"
                      type="button"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
