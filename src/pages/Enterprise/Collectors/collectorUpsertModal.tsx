// CollectorUpsertModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, easeOut } from "framer-motion";
import { Input, Select } from "antd";
import { Mail, User, Phone, Activity, AlertCircle, X } from "lucide-react";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import type {
  Collector,
  CollectorStatus,
  CreateCollectorBody,
  UpdateCollectorBody,
} from "@/redux/api/enterprise/collectors/types";

type Mode = "create" | "edit";

type FormValues = CreateCollectorBody &
  UpdateCollectorBody & { status?: CollectorStatus };

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Collector | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

type StatusOpt = { value: CollectorStatus; label: string };

const STATUS_OPTIONS: StatusOpt[] = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "ON_TASK", label: "Đang làm" },
  { value: "OFFLINE", label: "Ngoại tuyến" },
];

/** ===== helpers ===== */
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

function FormField({
  label,
  icon: Icon,
  required,
  children,
  error,
}: {
  label: string;
  icon: any;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
          <Icon className="w-3 h-3 text-emerald-700" />
        </div>
        {label}
        {required ? <span className="text-rose-600">*</span> : null}
      </label>

      {children}

      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function CollectorUpsertModal({
  open,
  mode,
  initial,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isEdit = mode === "edit";

  // Esc đóng modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const title = useMemo(() => {
    if (!isEdit) return "Tạo collector";
    return initial ? `Cập nhật collector #${initial.id}` : "Cập nhật collector";
  }, [isEdit, initial]);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<CollectorStatus>("AVAILABLE");

  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    if (!open) return;

    if (isEdit && initial) {
      setEmail(initial.email ?? "");
      setFullName(initial.fullName ?? "");
      setPhone(initial.phone ?? "");
      setStatus(initial.status ?? "AVAILABLE");
    } else {
      setEmail("");
      setFullName("");
      setPhone("");
      setStatus("AVAILABLE");
    }

    setErrors({});
  }, [open, isEdit, initial]);

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!isEdit) {
      if (!email.trim()) next.email = "Vui lòng nhập email";
      else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        next.email = "Email không hợp lệ";
    }

    if (!fullName.trim()) next.fullName = "Vui lòng nhập họ tên";
    if (!phone.trim()) next.phone = "Vui lòng nhập số điện thoại";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: any = {
      fullName: fullName.trim(),
      phone: phone.trim(),
    };
    if (!isEdit) payload.email = email.trim();
    if (isEdit) payload.status = status;

    await onSubmit(payload);
  };

  const variants = useMemo(() => {
    return {
      overlay: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reduceMotion ? 0.08 : 0.14 },
        },
        exit: {
          opacity: 0,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
      },
      panel: {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: reduceMotion ? 0.1 : 0.16, ease: easeOut },
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: 10,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
      },
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[1600] bg-black/45"
          variants={variants.overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          {/* Panel: auto-height + max-height, không ép top/bottom => hết dư phần dưới */}
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[580px] max-w-[500px]
              max-h-[calc(100vh-5rem)]
              flex flex-col overflow-hidden
              rounded-2xl bg-white shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-emerald-600 px-6 sm:px-8 py-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="
                  absolute right-4 top-4 grid h-10 w-10 place-items-center
                  rounded-full bg-white/20 hover:bg-white/30 backdrop-blur
                  text-white transition active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                aria-label="Đóng"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {title}
                  </h2>
                  <p className="text-sm text-emerald-50">
                    {isEdit
                      ? "Cập nhật thông tin collector"
                      : "Thêm collector mới vào hệ thống"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body: chỉ phần này scroll khi dài */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6">
              <div className="space-y-5">
                {!isEdit ? (
                  <FormField
                    label="Email"
                    icon={Mail}
                    required
                    error={errors.email}
                  >
                    <Input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="collector@example.com"
                      size="large"
                      prefix={<Mail className="w-4 h-4 text-slate-400" />}
                      disabled={submitting}
                      status={errors.email ? "error" : ""}
                    />
                  </FormField>
                ) : null}

                <FormField
                  label="Họ tên"
                  icon={User}
                  required
                  error={errors.fullName}
                >
                  <Input
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName)
                        setErrors((p) => ({ ...p, fullName: undefined }));
                    }}
                    placeholder="Nguyễn Văn Collector"
                    size="large"
                    prefix={<User className="w-4 h-4 text-slate-400" />}
                    disabled={submitting}
                    status={errors.fullName ? "error" : ""}
                  />
                </FormField>

                <FormField
                  label="Số điện thoại"
                  icon={Phone}
                  required
                  error={errors.phone}
                >
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone)
                        setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="0901234567"
                    size="large"
                    prefix={<Phone className="w-4 h-4 text-slate-400" />}
                    disabled={submitting}
                    status={errors.phone ? "error" : ""}
                  />
                </FormField>

                {isEdit ? (
                  <FormField label="Trạng thái" icon={Activity}>
                    <Select
                      value={status}
                      onChange={(v) => setStatus(v)}
                      size="large"
                      disabled={submitting}
                      className="w-full"
                      // Fix z-index dropdown trong overlay
                      dropdownStyle={{ zIndex: 1700 }}
                      getPopupContainer={(trigger) =>
                        (trigger?.parentElement as HTMLElement) ?? document.body
                      }
                      options={STATUS_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: (
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                "w-2 h-2 rounded-full",
                                opt.value === "AVAILABLE"
                                  ? "bg-emerald-500"
                                  : opt.value === "ON_TASK"
                                    ? "bg-blue-500"
                                    : "bg-slate-400",
                              ].join(" ")}
                            />
                            {opt.label}
                          </div>
                        ),
                      }))}
                    />
                  </FormField>
                ) : null}

                {submitting ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <LoadingSpinner color="blue" size="5" inline />
                    <div>
                      <div className="text-sm font-semibold text-emerald-900">
                        Đang xử lý...
                      </div>
                      <div className="text-xs text-emerald-700">
                        Vui lòng chờ trong giây lát
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-white px-6 sm:px-8 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="
                  px-5 py-2 rounded-xl font-semibold
                  text-slate-700 bg-white border border-slate-200
                  hover:bg-slate-50 active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="
                  px-6 py-2 rounded-xl font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                {isEdit ? "Lưu thay đổi" : "Tạo collector"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
