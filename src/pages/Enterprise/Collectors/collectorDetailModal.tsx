import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Mail,
  Phone,
  CalendarClock,
  X,
  User,
  ShieldCheck,
  AlertCircle,
  BadgeCheck,
  Zap,
  ChevronRight,
} from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type { Collector } from "@/redux/api/enterprise/collectors/types";

/* ─── Types ─── */

type WorkingHourItem = {
  start?: string;
  end?: string;
  active?: boolean;
};

type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type WorkingHours = Partial<Record<DayKey, WorkingHourItem>>;

type CollectorDetailData = Collector & {
  employeeCode?: string | null;
  trustScore?: number | null;
  skipCount?: number | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  workingHours?: WorkingHours;
  user?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
  };
  status?: {
    availability?: string | null;
    updatedAt?: string | null;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  detail: CollectorDetailData | null;
};

/* ─── Constants ─── */

const DAY_ORDER: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_LABELS: Record<DayKey, string> = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
};

/* ─── Helpers ─── */

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  if (!d.isValid()) return "—";
  return `${d.format("HH:mm")} · ${d.format("DD/MM/YYYY")}`;
}

function formatCollectorStatus(status?: string | null) {
  const key = String(status ?? "")
    .trim()
    .toUpperCase();

  if (key === "ONLINE_AVAILABLE" || key === "AVAILABLE")
    return "Đang hoạt động";
  if (key === "ONLINE_BUSY" || key === "ON_TASK") return "Đang làm việc";
  if (key === "OFFLINE") return "Ngoại tuyến";
  return "Không rõ";
}

function getStatusConfig(status?: string | null) {
  const key = String(status ?? "")
    .trim()
    .toUpperCase();

  if (key === "ONLINE_AVAILABLE" || key === "AVAILABLE") {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
    };
  }

  if (key === "ONLINE_BUSY" || key === "ON_TASK") {
    return {
      dot: "bg-amber-400",
      text: "text-amber-700",
      border: "border-amber-200",
      bg: "bg-amber-50",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-600",
    border: "border-slate-200",
    bg: "bg-slate-100",
  };
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

/* ─── Sub-components ─── */

const Avatar = React.memo(function Avatar({
  src,
  name,
}: {
  src?: string | null;
  name?: string | null;
}) {
  const [broken, setBroken] = useState(false);

  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "CL";
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .filter(Boolean)
      .join("");
  }, [name]);

  if (!src || broken) {
    return (
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-emerald-600 text-[22px] font-semibold text-white shadow-md ring-4 ring-slate-50">
        {initials}
      </div>
    );
  }

  return (
    <div className="h-[72px] w-[72px] rounded-2xl shadow-sm ring-4 ring-slate-50">
      <img
        src={src}
        alt={name ?? "Avatar"}
        className="h-full w-full rounded-2xl object-cover"
        onError={() => setBroken(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});

const StatCard = React.memo(function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  accent: "emerald" | "blue" | "amber" | "teal" | "red";
}) {
  const accentMap = {
    emerald: {
      num: "text-emerald-700",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    red: {
      num: "text-red-700",
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
    blue: {
      num: "text-sky-700",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    amber: {
      num: "text-amber-700",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    teal: {
      num: "text-teal-700",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  } as const;

  const a = accentMap[accent];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:bg-slate-100">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase text-slate-700">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-xl ${a.iconBg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${a.iconColor}`} />
        </div>
      </div>
      <div className={`mt-3 text-[26px] font-semibold tracking-tight ${a.num}`}>
        {value}
      </div>
    </div>
  );
});

const InfoRow = React.memo(function InfoRow({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="group flex items-center gap-4 bg-white px-3 py-3 transition-colors duration-150 hover:bg-slate-50">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-blue-400">
        <Icon className="h-4 w-4 text-emerald-600 group-hover:text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[12px] font-semibold uppercase text-slate-700">
          {label}
        </div>
        <div
          className={`truncate text-sm font-medium ${
            accent ? "text-emerald-700" : "text-slate-800"
          }`}
        >
          {value}
        </div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
});

const SectionHeader = React.memo(function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: any;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600">
        <Icon className="h-3.5 w-3.5 text-slate-50" />
      </div>
      <h3 className="text-[12px] font-semibold uppercase text-slate-800">
        {title}
      </h3>
      <div className="h-[1px] flex-1 bg-slate-200" />
    </div>
  );
});

/* ─── Main Modal ─── */

export default function CollectorDetailModal({
  open,
  onClose,
  loading = false,
  detail,
}: Props) {
  useLockBodyScroll(open);

  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const orderedWorkingHours = useMemo(() => {
    const working: WorkingHours = detail?.workingHours ?? {};

    return DAY_ORDER.map((day) => ({
      key: day,
      label: DAY_LABELS[day],
      data: working[day] ?? { active: false, start: "00:00", end: "00:00" },
    }));
  }, [detail?.workingHours]);
  console.log("detail,", detail);
  const profile = useMemo(
    () => ({
      fullName: detail?.user?.fullName ?? "—",
      email: detail?.user?.email ?? "—",
      phone: detail?.user?.phone ?? "—",
      avatar: detail?.user?.avatar ?? null,
      employeeCode: detail?.employeeCode ?? "—",
      availability: detail?.status ?? null,
      trustScore: detail?.trustScore ?? 0,
      skipCount: detail?.skipCount ?? 0,
      createdAt: detail?.createdAt ?? null,
      updatedAt: detail?.updatedAt ?? null,
      statusUpdatedAt: detail?.status?.updatedAt ?? null,
    }),
    [detail],
  );

  const statusCfg = useMemo(
    () => getStatusConfig(profile.availability),
    [profile.availability],
  );

  const overlayVariants = useMemo<Variants>(() => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.14 },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.12 },
      },
    };
  }, [reduceMotion]);

  const panelVariants = useMemo<Variants>(() => {
    if (reduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      hidden: { opacity: 0, y: 10, scale: 0.985 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      },
      exit: {
        opacity: 0,
        y: 6,
        scale: 0.99,
        transition: {
          duration: 0.12,
          ease: [0.4, 0, 1, 1] as const,
        },
      },
    };
  }, [reduceMotion]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait" initial={false}>
      {open && (
        <motion.div
          ref={overlayRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          className="fixed inset-0 z-[99999] bg-slate-900/45 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            variants={panelVariants}
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết collector"
            className="fixed inset-x-3 top-[2vh] bottom-[2vh] mx-auto flex max-w-5xl flex-col overflow-hidden rounded-lg bg-slate-100 shadow-2xl shadow-slate-300/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="relative shrink-0 bg-emerald-600 px-6 py-6 sm:px-8">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-[0.98]"
                  aria-label="Đóng"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 pr-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <User className="h-6 w-6 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
                      {detail?.id
                        ? `Collector #${detail.id}`
                        : "Chi tiết collector"}
                    </h2>
                    <p className="text-sm text-emerald-50">
                      Hiển thị thông tin hồ sơ, trạng thái và lịch làm việc của
                      collector
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center px-6 py-24 sm:px-8">
                    <div className="flex flex-col items-center gap-3">
                      <LoadingSpinner color="blue" size="10" />
                      <span className="text-[14px] font-semibold uppercase text-slate-700">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </div>
                ) : !detail ? (
                  <div className="flex flex-col items-center justify-center px-6 py-24 sm:px-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
                      <AlertCircle className="h-7 w-7 text-slate-500" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Không có dữ liệu collector
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative px-6 pb-6 pt-6 sm:px-8">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:gap-8">
                          <div className="flex items-start gap-4">
                            <Avatar
                              src={profile.avatar}
                              name={profile.fullName}
                            />

                            <div className="min-w-0 pt-0.5">
                              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                                {profile.fullName}
                              </h2>

                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                                >
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span
                                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${statusCfg.dot}`}
                                    />
                                    <span
                                      className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusCfg.dot}`}
                                    />
                                  </span>
                                  {formatCollectorStatus(profile.availability)}
                                </span>
                              </div>

                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">
                                <Zap className="h-3 w-3 text-slate-500" />
                                <span className="font-sans text-[11px] font-semibold text-slate-600">
                                  {profile.employeeCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard
                              label="Điểm uy tín"
                              value={profile.trustScore}
                              icon={ShieldCheck}
                              accent="red"
                            />

                            <StatCard
                              label="Đơn đã bỏ qua"
                              value={profile.skipCount}
                              icon={AlertCircle}
                              accent="blue"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 px-6 pb-8 sm:px-8">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <SectionHeader
                            title="Thông tin liên hệ"
                            icon={User}
                          />
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <InfoRow
                              icon={Mail}
                              label="Email"
                              value={profile.email}
                            />
                            <div className="mx-3 h-px bg-slate-200" />
                            <InfoRow
                              icon={Phone}
                              label="Điện thoại"
                              value={profile.phone}
                            />
                            <div className="mx-3 h-px bg-slate-200" />
                            <InfoRow
                              icon={BadgeCheck}
                              label="Mã nhân sự"
                              value={profile.employeeCode}
                              accent
                            />
                          </div>
                        </div>

                        <div>
                          <SectionHeader
                            title="Mốc thời gian"
                            icon={CalendarClock}
                          />
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <InfoRow
                              icon={CalendarClock}
                              label="Tạo hồ sơ"
                              value={formatDateTime(profile.createdAt)}
                            />
                            <div className="mx-3 h-px bg-slate-200" />
                            <InfoRow
                              icon={CalendarClock}
                              label="Cập nhật hồ sơ"
                              value={formatDateTime(profile.updatedAt)}
                            />
                            {/* <div className="mx-3 h-px bg-slate-200" />
                            <InfoRow
                              icon={CalendarClock}
                              label="Cập nhật trạng thái"
                              value={formatDateTime(profile.statusUpdatedAt)}
                            /> */}
                          </div>
                        </div>
                      </div>

                      <div>
                        <SectionHeader
                          title="Lịch làm việc"
                          icon={CalendarClock}
                        />
                        <div className="grid grid-cols-7 gap-2">
                          {orderedWorkingHours.map((item, i) => {
                            const active = Boolean(item.data?.active);

                            return (
                              <motion.div
                                key={item.key}
                                initial={
                                  reduceMotion ? false : { opacity: 0, y: 4 }
                                }
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: reduceMotion ? 0 : i * 0.025,
                                  duration: 0.18,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className={`flex flex-col items-center rounded-2xl border px-1 py-3 transition-colors duration-200 ${
                                  active
                                    ? "border-emerald-200 bg-emerald-50 hover:brightness-95"
                                    : "border-slate-200 bg-white text-slate-400"
                                }`}
                              >
                                <span
                                  className={`text-[14px] font-semibold uppercase tracking-wider ${
                                    active
                                      ? "text-emerald-800"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {item.label}
                                </span>

                                {active ? (
                                  <div className="mt-2 flex flex-col items-center gap-0.5">
                                    <span className="font-sans text-[14px] font-semibold text-slate-700">
                                      {item.data?.start ?? "--:--"}
                                    </span>
                                    <span className="h-3 w-px bg-slate-300" />
                                    <span className="font-sans text-[14px] font-semibold text-slate-700">
                                      {item.data?.end ?? "--:--"}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="mt-2 text-[14px] font-medium text-slate-500">
                                    Nghỉ
                                  </span>
                                )}

                                {active && (
                                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] active:bg-emerald-800"
                    type="button"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
