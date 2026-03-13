import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

import { Dropdown, cx } from "@/components/ui/page/componentUI";

type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type WorkingHourItem = {
  start?: string;
  end?: string;
  active: boolean;
};

type WorkingHours = Record<DayKey, WorkingHourItem>;

type FormValues = {
  email: string;
  fullName: string;
  phone: string;
  workingHours: WorkingHours;
};

type Props = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

type ShiftValue = "MORNING" | "AFTERNOON" | "FULL_DAY" | "EVENING";

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

const SHIFT_OPTIONS: {
  value: ShiftValue;
  label: string;
  start: string;
  end: string;
  active: boolean;
}[] = [
  {
    value: "FULL_DAY",
    label: "08:00 - 17:00",
    start: "08:00",
    end: "17:00",
    active: true,
  },
  {
    value: "MORNING",
    label: "08:00 - 12:00",
    start: "08:00",
    end: "12:00",
    active: true,
  },
  {
    value: "AFTERNOON",
    label: "13:00 - 17:00",
    start: "13:00",
    end: "17:00",
    active: true,
  },
  {
    value: "EVENING",
    label: "18:00 - 22:00",
    start: "18:00",
    end: "22:00",
    active: true,
  },
];

const SHIFT_MAP: Record<ShiftValue, WorkingHourItem> = {
  MORNING: { start: "08:00", end: "12:00", active: true },
  AFTERNOON: { start: "13:00", end: "17:00", active: true },
  FULL_DAY: { start: "08:00", end: "17:00", active: true },
  EVENING: { start: "18:00", end: "22:00", active: true },
};

const DEFAULT_WORKING_HOURS: WorkingHours = {
  Monday: { start: "08:00", end: "17:00", active: true },
  Tuesday: { start: "08:00", end: "17:00", active: true },
  Wednesday: { start: "08:00", end: "17:00", active: true },
  Thursday: { start: "08:00", end: "17:00", active: true },
  Friday: { start: "08:00", end: "17:00", active: true },
  Saturday: { start: "08:00", end: "17:00", active: true },
  Sunday: { start: "08:00", end: "17:00", active: true },
};

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

function isValidPhone(phone: string) {
  return /^0\d{9,10}$/.test(phone);
}

function FormField({
  label,
  icon: Icon,
  required,
  children,
  error,
  className,
}: {
  label: string;
  icon: any;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cx("space-y-2", className)}>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100">
          <Icon className="h-3 w-3 text-emerald-700" />
        </div>
        {label}
        {required ? <span className="text-rose-600">*</span> : null}
      </label>

      {children}

      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ===== input style mới ===== */
const fieldWrapBase = "relative rounded-2xl border bg-white transition-colors";

const fieldWrapOk =
  "border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 ";

const fieldWrapErr =
  "border-slate-300 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 ";

const fieldInputBase =
  "w-full h-11 rounded-2xl bg-transparent pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";

const fieldIconBase =
  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

function getShiftValue(item: WorkingHourItem): ShiftValue {
  const found = SHIFT_OPTIONS.find(
    (s) => s.start === item.start && s.end === item.end && item.active === true,
  );
  return found?.value ?? "FULL_DAY";
}

function WorkingDayCard({
  day,
  value,
  disabled,
  onToggle,
  onChangeShift,
}: {
  day: DayKey;
  value: WorkingHourItem;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
  onChangeShift: (value: ShiftValue) => void;
}) {
  const isOff = !value.active;
  const shift = getShiftValue(value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {DAY_LABELS[day]}
          </div>
          <div className="text-xs text-slate-500">
            {isOff ? "Đang tắt ngày làm việc" : "Chọn theo ca cố định"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => !disabled && onToggle(!value.active)}
          className={cx(
            "relative h-6 w-11 rounded-full transition",
            value.active ? "bg-blue-500" : "bg-slate-300",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <span
            className={cx(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
              value.active ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
      </div>

      <Dropdown<ShiftValue>
        icon={Clock3}
        label="Ca"
        value={shift}
        options={SHIFT_OPTIONS.map((s) => ({
          value: s.value,
          label: s.label,
        }))}
        onChange={onChangeShift}
        minWidth={220}
        className={cx((disabled || isOff) && "pointer-events-none opacity-50")}
      />
    </div>
  );
}

export default function CollectorCreateModal({
  open,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    DEFAULT_WORKING_HOURS,
  );

  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    phone?: string;
    workingHours?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setFullName("");
    setPhone("");
    setWorkingHours(DEFAULT_WORKING_HOURS);
    setErrors({});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  const variants = useMemo(
    () => ({
      overlay: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
        exit: {
          opacity: 0,
          transition: { duration: reduceMotion ? 0.08 : 0.1 },
        },
      },
      panel: {
        hidden: { opacity: 0, y: 8, scale: 0.992 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: reduceMotion ? 0.08 : 0.14 },
        },
        exit: {
          opacity: 0,
          y: 8,
          scale: 0.992,
          transition: { duration: reduceMotion ? 0.08 : 0.1 },
        },
      },
    }),
    [reduceMotion],
  );

  const updateDay = (day: DayKey, next: Partial<WorkingHourItem>) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...next,
      },
    }));

    if (errors.workingHours) {
      setErrors((prev) => ({ ...prev, workingHours: undefined }));
    }
  };

  const normalizePayloadWorkingHours = (data: WorkingHours): WorkingHours => {
    const result = {} as WorkingHours;

    DAY_ORDER.forEach((day) => {
      const item = data[day];

      if (!item.active) {
        result[day] = { active: false };
        return;
      }

      result[day] = {
        active: true,
        start: item.start,
        end: item.end,
      };
    });

    return result;
  };

  const validate = () => {
    const next: typeof errors = {};

    if (!email.trim()) next.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Email không hợp lệ";
    }

    if (!fullName.trim()) next.fullName = "Vui lòng nhập họ và tên";

    if (!phone.trim()) next.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(phone.trim())) {
      next.phone = "Sai định dạng số điện thoại";
    }

    const hasActive = DAY_ORDER.some((day) => workingHours[day].active);
    if (!hasActive) {
      next.workingHours = "Cần chọn ít nhất 1 ngày làm việc";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      email: email.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      workingHours: normalizePayloadWorkingHours(workingHours),
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1600] bg-black/35"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === overlayRef.current && !submitting) onClose();
          }}
        >
          <motion.div
            variants={variants.panel}
            className="fixed left-1/2 top-1/2 flex max-h-[calc(100vh-3rem)] w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-emerald-600 px-6 py-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-60"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                    Tạo nhân sự thu gom
                  </h2>
                  <p className="text-sm text-emerald-50">
                    Nhập thông tin cơ bản và cấu hình lịch làm việc
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar bg-slate-100 px-6 py-6">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                      <User className="h-4 w-4 text-emerald-700" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Thông tin tạo mới
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Email"
                      icon={Mail}
                      required
                      error={errors.email}
                      className="md:col-span-2"
                    >
                      <div
                        className={[
                          fieldWrapBase,
                          errors.email ? fieldWrapErr : fieldWrapOk,
                        ].join(" ")}
                      >
                        <Mail className={fieldIconBase} />
                        <input
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) {
                              setErrors((p) => ({ ...p, email: undefined }));
                            }
                          }}
                          className={fieldInputBase}
                          placeholder="collector@example.com"
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Họ và tên"
                      icon={User}
                      required
                      error={errors.fullName}
                    >
                      <div
                        className={[
                          fieldWrapBase,
                          errors.fullName ? fieldWrapErr : fieldWrapOk,
                        ].join(" ")}
                      >
                        <User className={fieldIconBase} />
                        <input
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) {
                              setErrors((p) => ({
                                ...p,
                                fullName: undefined,
                              }));
                            }
                          }}
                          className={fieldInputBase}
                          placeholder="Nguyễn Văn Thu Gom"
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Số điện thoại"
                      icon={Phone}
                      required
                      error={errors.phone}
                    >
                      <div
                        className={[
                          fieldWrapBase,
                          errors.phone ? fieldWrapErr : fieldWrapOk,
                        ].join(" ")}
                      >
                        <Phone className={fieldIconBase} />
                        <input
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) {
                              setErrors((p) => ({ ...p, phone: undefined }));
                            }
                          }}
                          className={fieldInputBase}
                          placeholder="0987654321"
                        />
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Lịch làm việc
                      </h3>
                      <p className="text-xs text-slate-500">
                        Chọn theo ca cố định cho từng ngày
                      </p>
                    </div>
                  </div>

                  {errors.workingHours ? (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.workingHours}</span>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    {DAY_ORDER.map((day) => (
                      <WorkingDayCard
                        key={day}
                        day={day}
                        value={workingHours[day]}
                        disabled={submitting}
                        onToggle={(checked) => {
                          if (!checked) {
                            updateDay(day, {
                              active: false,
                              start: undefined,
                              end: undefined,
                            });
                            return;
                          }

                          if (day === "Saturday") {
                            updateDay(day, SHIFT_MAP.MORNING);
                            return;
                          }

                          updateDay(day, SHIFT_MAP.FULL_DAY);
                        }}
                        onChangeShift={(next) => {
                          if (!workingHours[day].active) return;
                          updateDay(day, SHIFT_MAP[next]);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700"
                type="button"
              >
                {submitting ? "Đang tạo..." : "Tạo nhân sự"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
