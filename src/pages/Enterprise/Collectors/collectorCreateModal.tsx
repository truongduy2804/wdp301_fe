import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Mail, Phone, User, X } from "lucide-react";

import type { CollectorWorkingHours } from "@/redux/api/enterprise/collectors/types";
import WorkingHoursEditor from "./WorkingHoursEditor";
import {
  DAY_ORDER,
  createDefaultWorkingHours,
  normalizeWorkingHoursForSubmit,
  type WorkingHoursFormValue,
} from "@/utils/collectorWorkingHours";

type FormValues = {
  email: string;
  fullName: string;
  phone: string;
  workingHours: CollectorWorkingHours;
};

type Props = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
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
    <div className={["space-y-2", className].filter(Boolean).join(" ")}>
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

const fieldWrapBase = "relative rounded-2xl border bg-white transition-colors";
const fieldWrapOk =
  "border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400";
const fieldWrapErr =
  "border-slate-300 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400";
const fieldInputBase =
  "h-11 w-full rounded-2xl bg-transparent pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
const fieldIconBase =
  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

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
  const [workingHours, setWorkingHours] = useState<WorkingHoursFormValue>(() =>
    createDefaultWorkingHours(),
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
    setWorkingHours(createDefaultWorkingHours());
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
      workingHours: normalizeWorkingHoursForSubmit(workingHours),
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
                  <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
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
                              setErrors((prev) => ({
                                ...prev,
                                email: undefined,
                              }));
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
                              setErrors((prev) => ({
                                ...prev,
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
                              setErrors((prev) => ({
                                ...prev,
                                phone: undefined,
                              }));
                            }
                          }}
                          className={fieldInputBase}
                          placeholder="0987654321"
                        />
                      </div>
                    </FormField>
                  </div>
                </div>

                <WorkingHoursEditor
                  value={workingHours}
                  disabled={submitting}
                  error={errors.workingHours}
                  onChange={(next) => {
                    setWorkingHours(next);
                    if (errors.workingHours) {
                      setErrors((prev) => ({
                        ...prev,
                        workingHours: undefined,
                      }));
                    }
                  }}
                />
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
