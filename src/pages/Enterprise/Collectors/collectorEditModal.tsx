import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Camera,
  Mail,
  Phone,
  User,
  X,
  ZoomIn,
} from "lucide-react";

import type { Collector } from "@/redux/api/enterprise/collectors/types";

type CollectorLike = Collector & {
  user?: {
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    avatar?: string | null;
  };
  avatar?: string | null;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
};

type FormValues = {
  fullName: string;
  phone: string;
  avatar?: File | null;
};

type Props = {
  open: boolean;
  initial?: CollectorLike | null;
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

function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;

  const origin =
    (import.meta as any).env?.VITE_API_ORIGIN ||
    (import.meta as any).env?.VITE_BACKEND_URL ||
    "";

  if (!origin) return avatar;
  const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${origin}${path}`;
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

const inputBase =
  "w-full h-11 rounded-xl border bg-white pl-10 pr-3 text-sm outline-none transition";
const inputOk =
  "border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 ";
const inputErr =
  "border-slate-300 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 ";

export default function CollectorEditModal({
  open,
  initial,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const reduceMotion = useReducedMotion();

  const initialEmail = initial?.user?.email ?? initial?.email ?? "";
  const initialFullName = initial?.user?.fullName ?? initial?.fullName ?? "";
  const initialPhone = initial?.user?.phone ?? initial?.phone ?? "";
  const existingAvatarUrl = useMemo(
    () => resolveAvatarUrl(initial?.user?.avatar ?? initial?.avatar ?? null),
    [initial?.user?.avatar, initial?.avatar],
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    avatar?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setFullName(initialFullName);
    setPhone(initialPhone);
    setAvatarFile(null);
    setAvatarName("");
    setAvatarPreview("");
    setZoomOpen(false);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  }, [open, initialFullName, initialPhone]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const displayAvatar = avatarPreview || existingAvatarUrl;

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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const okTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!okTypes.includes(f.type)) {
      setErrors((p) => ({ ...p, avatar: "Chỉ hỗ trợ png/jpg/jpeg/webp" }));
      e.target.value = "";
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, avatar: "Ảnh quá lớn (tối đa 5MB)" }));
      e.target.value = "";
      return;
    }

    setErrors((p) => ({ ...p, avatar: undefined }));
    setAvatarFile(f);
    setAvatarName(f.name);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Vui lòng nhập họ và tên";
    if (!phone.trim()) next.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(phone.trim())) {
      next.phone = "Sai định dạng số điện thoại";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearSelectedAvatar = () => {
    setAvatarFile(null);
    setAvatarName("");
    setAvatarPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      avatar: avatarFile || undefined,
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
            className="fixed left-1/2 top-1/2 flex max-h-[calc(100vh-3rem)] w-[calc(100vw-1.5rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl  shadow-2xl"
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
                    Cập nhật nhân sự thu gom
                  </h2>
                  <p className="text-sm text-emerald-50">
                    Thay đổi họ tên, số điện thoại và ảnh đại diện
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar bg-white px-6 py-6">
              <div className="space-y-5">
                <FormField label="Email" icon={Mail}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={initialEmail}
                      disabled
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-500"
                    />
                  </div>
                </FormField>

                <FormField
                  label="Họ và tên"
                  icon={User}
                  required
                  error={errors.fullName}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) {
                          setErrors((p) => ({ ...p, fullName: undefined }));
                        }
                      }}
                      className={[
                        inputBase,
                        errors.fullName ? inputErr : inputOk,
                      ].join(" ")}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Số điện thoại"
                  icon={Phone}
                  required
                  error={errors.phone}
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          setErrors((p) => ({ ...p, phone: undefined }));
                        }
                      }}
                      className={[
                        inputBase,
                        errors.phone ? inputErr : inputOk,
                      ].join(" ")}
                    />
                  </div>
                </FormField>

                <FormField label="Avatar" icon={Camera} error={errors.avatar}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {avatarFile
                          ? "Đổi ảnh khác"
                          : existingAvatarUrl
                            ? "Thay ảnh"
                            : "Chọn ảnh"}
                      </button>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleFile}
                      />

                      <div className="truncate text-sm text-slate-600">
                        {avatarFile
                          ? `Đã chọn: ${avatarName}`
                          : existingAvatarUrl
                            ? "Đang dùng ảnh hiện tại"
                            : "Chưa chọn ảnh"}
                      </div>

                      {avatarFile ? (
                        <button
                          type="button"
                          onClick={clearSelectedAvatar}
                          className="ml-auto rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                          Bỏ chọn
                        </button>
                      ) : null}
                    </div>

                    {displayAvatar ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <button
                          type="button"
                          onClick={() => setZoomOpen(true)}
                          className="group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-emerald-300"
                        >
                          <img
                            src={displayAvatar}
                            alt="avatar preview"
                            className="h-40 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 opacity-0 transition group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1">
                              <ZoomIn className="h-4 w-4" />
                              Xem lớn
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </FormField>
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
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {zoomOpen && displayAvatar ? (
              <motion.div
                className="fixed inset-0 z-[1700] bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setZoomOpen(false)}
              >
                <div
                  className="fixed left-1/2 top-1/2 w-[calc(100vw-1.5rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-800">
                      Xem ảnh
                    </div>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                      onClick={() => setZoomOpen(false)}
                      type="button"
                    >
                      <X className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>
                  <div className="bg-black">
                    <img
                      src={displayAvatar}
                      alt="zoom"
                      className="max-h-[calc(100vh-8rem)] w-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
