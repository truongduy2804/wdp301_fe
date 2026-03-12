// AccountProfileUpsertModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  easeOut,
} from "framer-motion";
import {
  AlertCircle,
  Camera,
  Mail,
  Phone,
  User,
  X,
  ZoomIn,
} from "lucide-react";

type Profile = {
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  avatar?: string | null; // BE trả "avatar" (path hoặc url)
};

type FormValues = {
  fullName: string;
  phone: string;
  avatarFile?: File; // ✅ chỉ gửi khi có file mới
};

type Props = {
  open: boolean;
  initial?: Profile | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

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

function isValidPhone(phone: string) {
  return /^0\d{9}$/.test(phone);
}

function toRoleVi(role?: string | null) {
  const r = (role ?? "").toUpperCase();
  if (r.includes("ADMIN")) return "Quản trị viên";
  if (r.includes("ENTERPRISE")) return "Doanh nghiệp";
  if (r.includes("COLLECTOR")) return "Thu gom";
  if (r.includes("CITIZEN")) return "Người dân";
  return role ?? "—";
}

function toStatusVi(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s.includes("ACTIVE")) return "Đang hoạt động";
  if (s.includes("INACTIVE")) return "Không hoạt động";
  if (s.includes("BLOCK")) return "Bị khóa";
  if (s.includes("PENDING")) return "Chờ duyệt";
  return status ?? "—";
}

// ✅ resolve avatar url (giống page)
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

// (Bạn bảo bỏ focus thì mình để hover đẹp + không “ring focus”)
const inputBase =
  "w-full h-11 rounded-xl border bg-white pl-10 pr-3 text-sm outline-none ";
const inputOk =
  "border-slate-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 ";
const inputErr =
  "border-slate-300 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 ";

export default function AccountProfileUpsertModal({
  open,
  initial,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  useLockBodyScroll(open);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  // ESC đóng modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [zoomOpen, setZoomOpen] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    avatar?: string;
  }>({});

  // ✅ avatar sẵn có (từ BE) dùng khi edit
  const existingAvatarUrl = useMemo(
    () => resolveAvatarUrl(initial?.avatar ?? null),
    [initial?.avatar],
  );

  // ✅ url hiển thị: ưu tiên ảnh mới, fallback ảnh cũ
  const displayAvatar = avatarPreview || existingAvatarUrl;

  useEffect(() => {
    if (!open) return;

    setFullName(initial?.fullName ?? "");
    setPhone(initial?.phone ?? "");

    // reset file mới mỗi lần mở modal
    setAvatarFile(null);
    setAvatarName("");
    setAvatarPreview("");
    setZoomOpen(false);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  }, [open, initial]);

  // preview url cho file mới
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Vui lòng nhập họ và tên";

    if (!phone.trim()) next.phone = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(phone.trim()))
      next.phone = "Sai định dạng (0xxxxxxxxx)";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePick = () => fileRef.current?.click();

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

  // ✅ “Bỏ chọn” chỉ bỏ file mới, quay về avatar cũ (nếu có)
  const clearSelectedAvatar = () => {
    setAvatarFile(null);
    setAvatarName("");
    setAvatarPreview("");
    setZoomOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // ✅ chỉ gửi avatarFile khi có file mới
    const payload: FormValues = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      ...(avatarFile ? { avatarFile } : {}),
    };

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
      zoom: {
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
      zoomImg: {
        hidden: { opacity: 0, scale: 0.98, y: 8 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: reduceMotion ? 0.1 : 0.16, ease: easeOut },
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: 8,
          transition: { duration: reduceMotion ? 0.08 : 0.12 },
        },
      },
    };
  }, [reduceMotion]);

  const roleVi = toRoleVi(initial?.role ?? null);
  const statusVi = toStatusVi(initial?.status ?? null);

  const hasExistingAvatar = !!existingAvatarUrl;
  const hasNewAvatar = !!avatarPreview;

  // ✅ label nút theo logic UI
  const pickBtnLabel = hasNewAvatar
    ? "Đổi ảnh khác"
    : hasExistingAvatar
      ? "Thay ảnh"
      : "Chọn ảnh";

  const subtitle = hasNewAvatar
    ? `Đã chọn: ${avatarName || "ảnh mới"}`
    : hasExistingAvatar
      ? "Đang dùng ảnh hiện tại"
      : "Chưa chọn ảnh";

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
          <motion.div
            variants={variants.panel}
            role="dialog"
            aria-modal="true"
            className="
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[calc(100vw-2rem)] sm:w-[580px] max-w-[520px]
              max-h-[calc(100vh-5rem)]
              flex flex-col overflow-hidden
              rounded-2xl  shadow-2xl
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
                    Cập nhật hồ sơ
                  </h2>
                  <p className="text-sm text-emerald-50">
                    Thay đổi họ tên, số điện thoại và avatar
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 bg-white">
              <div className="space-y-5">
                <FormField label="Email" icon={Mail}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={initial?.email ?? ""}
                      disabled
                      className="
                        w-full h-11 rounded-xl border border-slate-200 bg-slate-50
                        pl-10 pr-3 text-sm text-slate-500
                      "
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
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName)
                          setErrors((p) => ({ ...p, fullName: undefined }));
                      }}
                      placeholder="Nguyễn Văn A"
                      disabled={submitting}
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
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone)
                          setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="0xxxxxxxxx"
                      disabled={submitting}
                      className={[
                        inputBase,
                        errors.phone ? inputErr : inputOk,
                      ].join(" ")}
                    />
                  </div>
                </FormField>

                {/* ✅ Avatar: có sẵn thì show preview + “Thay ảnh” */}
                <FormField label="Avatar" icon={Camera} error={errors.avatar}>
                  <div className="space-y-3">
                    {/* actions row */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePick}
                        disabled={submitting}
                        className="
                          px-4 py-2 rounded-xl font-semibold
                          text-slate-700 bg-white border border-slate-200
                          hover:bg-slate-50 hover:border-blue-400
                          active:scale-[0.98]
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition
                        "
                      >
                        {pickBtnLabel}
                      </button>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleFile}
                      />

                      <div className="text-sm text-slate-600 truncate">
                        {hasNewAvatar ? (
                          <>
                            Đã chọn:{" "}
                            <span className="font-semibold">{avatarName}</span>
                          </>
                        ) : (
                          <span
                            className={
                              hasExistingAvatar ? "" : "text-slate-400"
                            }
                          >
                            {subtitle}
                          </span>
                        )}
                      </div>

                      {/* chỉ hiện khi đang chọn ảnh mới */}
                      {avatarFile ? (
                        <button
                          type="button"
                          onClick={clearSelectedAvatar}
                          disabled={submitting}
                          className="
                            ml-auto px-3 py-2 rounded-xl text-sm font-semibold
                            text-rose-600 border border-rose-200 bg-rose-50
                            hover:bg-rose-100
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition
                          "
                        >
                          Bỏ chọn
                        </button>
                      ) : null}
                    </div>

                    {/* ✅ Preview (cả ảnh cũ hoặc ảnh mới) + zoom */}
                    {displayAvatar ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <button
                          type="button"
                          onClick={() => setZoomOpen(true)}
                          className="
                            group relative w-full overflow-hidden rounded-xl
                            border border-slate-200 bg-slate-50
                            hover:border-emerald-300 hover:shadow-sm transition
                          "
                          aria-label="Xem ảnh lớn"
                        >
                          <img
                            src={displayAvatar}
                            alt="avatar preview"
                            className="h-40 w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition" />
                          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                            <ZoomIn className="h-4 w-4" />
                            Xem lớn
                          </div>

                          {!hasNewAvatar && hasExistingAvatar ? (
                            <div className="absolute left-3 top-3 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white">
                              Ảnh hiện tại
                            </div>
                          ) : null}

                          {hasNewAvatar ? (
                            <div className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                              Ảnh mới
                            </div>
                          ) : null}
                        </button>
                      </div>
                    ) : null}

                    <p className="text-xs text-slate-400">
                      png/jpg/webp · tối đa 5MB · multipart field{" "}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-emerald-600">
                        avatar
                      </code>
                    </p>
                  </div>
                </FormField>

                {(initial?.role || initial?.status) && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      Thông tin hệ thống
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {initial?.role ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-100">
                          {roleVi}
                        </span>
                      ) : null}
                      {initial?.status ? (
                        <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold ring-1 ring-slate-200">
                          {statusVi}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-white px-6 sm:px-8 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="
                  px-5 py-2 rounded-xl font-semibold  hover:scale-[1.05]
                  text-slate-700 bg-white border border-slate-200
                  hover:bg-slate-50 hover:border-slate-300
                  active:scale-[0.98]
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
                  px-6 py-2 rounded-xl font-semibold text-white  hover:scale-[1.02]
                  bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition
                "
                type="button"
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </motion.div>

          {/* Zoom overlay */}
          <AnimatePresence>
            {zoomOpen && displayAvatar ? (
              <motion.div
                className="fixed inset-0 z-[1700] bg-black/70"
                variants={variants.zoom}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setZoomOpen(false)}
              >
                <motion.div
                  className="
                    fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[calc(100vw-1.5rem)] max-w-[720px]
                    max-h-[calc(100vh-4rem)]
                    rounded-2xl overflow-hidden bg-white
                    shadow-2xl
                  "
                  variants={variants.zoomImg}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div className="text-sm font-semibold text-slate-800">
                      Xem ảnh
                    </div>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
                      onClick={() => setZoomOpen(false)}
                      aria-label="Đóng"
                      type="button"
                    >
                      <X className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="bg-black">
                    <img
                      src={displayAvatar}
                      alt="zoom"
                      className="w-full max-h-[calc(100vh-8rem)] object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
