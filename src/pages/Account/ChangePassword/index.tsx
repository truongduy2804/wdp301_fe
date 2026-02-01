// src/pages/Account/ChangePasswordPage.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import endPoint from "@/router/endPoint";
import LoadingSpinner from "@/components/ui/loadingSpinner";

import { useChangePasswordMutation } from "@/redux/api/account/profileApi";
import { useAppDispatch } from "@/redux/store/hooks";
import { logout as logoutAction } from "@/redux/feature/authSlice";
import { baseApi } from "@/redux/api/baseApi";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

function getErrorMessage(err: any): string {
  return (
    err?.data?.message ||
    err?.error ||
    err?.message ||
    "Đổi mật khẩu thất bại. Vui lòng thử lại."
  );
}

function getLocalePrefix(pathname: string) {
  const segs = (pathname || "/").split("/").filter(Boolean);
  const hasLocale = segs[0] === "vi" || segs[0] === "en";
  return hasLocale ? `/${segs[0]}` : "";
}

/* ================= Password strength ================= */

type StrengthLevel = "very_weak" | "weak" | "medium" | "strong" | "very_strong";

function strengthLabel(pw: string): {
  pct: number;
  level: StrengthLevel;
  text: string;
} {
  if (!pw) return { pct: 0, level: "very_weak", text: "—" };

  let score = 0;

  // length
  if (pw.length >= 6) score += 15;
  if (pw.length >= 8) score += 15;
  if (pw.length >= 10) score += 15;
  if (pw.length >= 14) score += 10;

  // variety
  if (/[a-z]/.test(pw)) score += 10;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;

  // penalty (too simple)
  if (/^(.)\1+$/.test(pw)) score = Math.min(score, 20);
  if (/^(123456|12345678|password|qwerty)$/i.test(pw)) score = 5;

  const pct = Math.max(0, Math.min(100, score));

  let level: StrengthLevel = "very_weak";
  let text = "Rất yếu";
  if (pct >= 85) {
    level = "very_strong";
    text = "Rất mạnh";
  } else if (pct >= 70) {
    level = "strong";
    text = "Mạnh";
  } else if (pct >= 45) {
    level = "medium";
    text = "Trung bình";
  } else if (pct >= 25) {
    level = "weak";
    text = "Yếu";
  }

  return { pct, level, text };
}

function StrengthMeter({ pw }: { pw: string }) {
  const s = useMemo(() => strengthLabel(pw), [pw]);

  const cfg = useMemo(() => {
    switch (s.level) {
      case "very_strong":
        return {
          pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
          bar: "from-emerald-500 via-emerald-400 to-teal-400",
          dot: "bg-emerald-500",
        };
      case "strong":
        return {
          pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
          bar: "from-emerald-500 to-lime-400",
          dot: "bg-emerald-500",
        };
      case "medium":
        return {
          pill: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
          bar: "from-amber-500 to-yellow-400",
          dot: "bg-amber-500",
        };
      case "weak":
        return {
          pill: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
          bar: "from-orange-500 to-amber-400",
          dot: "bg-orange-500",
        };
      default:
        return {
          pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
          bar: "from-rose-500 to-orange-400",
          dot: "bg-rose-500",
        };
    }
  }, [s.level]);

  const activeSeg = useMemo(() => {
    const pct = s.pct;
    if (pct >= 85) return 5;
    if (pct >= 70) return 4;
    if (pct >= 45) return 3;
    if (pct >= 25) return 2;
    return 1;
  }, [s.pct]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Độ mạnh mật khẩu
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cfg.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {pw ? s.text : "Chưa nhập"}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500">{s.pct}%</div>
      </div>

      {/* segmented bar */}
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const seg = i + 1;
          const on = pw && seg <= activeSeg;
          return (
            <div
              key={seg}
              className={[
                "h-2 rounded-full transition",
                on ? "bg-slate-900/10" : "bg-slate-200",
              ].join(" ")}
            >
              {on ? (
                <div
                  className={`h-full w-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* smooth progress (secondary) */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-300`}
          style={{ width: `${pw ? s.pct : 0}%` }}
        />
      </div>
    </div>
  );
}

function PasswordHints({ pw }: { pw: string }) {
  const rules = useMemo(() => {
    return [
      { ok: pw.length >= 8, text: "Ít nhất 8 ký tự" },
      { ok: /[A-Z]/.test(pw), text: "Có chữ hoa (A-Z)" },
      { ok: /[a-z]/.test(pw), text: "Có chữ thường (a-z)" },
      { ok: /[0-9]/.test(pw), text: "Có số (0-9)" },
      { ok: /[^A-Za-z0-9]/.test(pw), text: "Có ký tự đặc biệt (@ # ! ...)" },
    ];
  }, [pw]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-sm font-semibold text-slate-800">
        Gợi ý mật khẩu mạnh
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {rules.map((r) => (
          <div key={r.text} className="flex items-center gap-2">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full ring-1",
                r.ok
                  ? "bg-emerald-500 ring-emerald-200"
                  : "bg-slate-300 ring-slate-200",
              ].join(" ")}
            />
            <span
              className={[
                "text-xs font-semibold",
                r.ok ? "text-green-700" : "text-red-600",
              ].join(" ")}
            >
              {r.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Ví dụ:{" "}
        <span className="font-semibold text-slate-700">EcoNet@2026!</span>{" "}
        (tránh dùng thông tin dễ đoán như tên, ngày sinh).
      </div>
    </div>
  );
}

/* ================= UI: input ================= */

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  leftIcon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div
        className={[
          "relative rounded-2xl border border-slate-300 bg-white transition-colors",
          "hover:border-blue-200",
          "focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400",
          error
            ? "border-rose-300 hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-100"
            : "border-slate-200",
          disabled ? "bg-slate-50 opacity-80" : "",
        ].join(" ")}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {leftIcon}
        </div>

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="
            w-full h-11 pl-10 pr-12 rounded-2xl outline-none
            text-sm text-slate-800 placeholder:text-slate-400
            disabled:bg-slate-50 disabled:text-slate-500
          "
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl
                     text-slate-500 hover:bg-slate-100 transition disabled:opacity-60"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {error ? (
        <div className="text-xs font-semibold text-rose-600">{error}</div>
      ) : null}
    </div>
  );
}

/* ================= Page ================= */

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const localePrefix = getLocalePrefix(pathname);

  const dispatch = useAppDispatch();
  const [changePassword, m] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!currentPassword.trim())
      next.currentPassword = "Vui lòng nhập mật khẩu hiện tại";

    if (!newPassword.trim()) next.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (newPassword.trim().length < 6)
      next.newPassword = "Mật khẩu mới tối thiểu 6 ký tự";
    else if (newPassword.trim() === currentPassword.trim())
      next.newPassword = "Mật khẩu mới không được trùng mật khẩu hiện tại";

    if (!confirmPassword.trim())
      next.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (confirmPassword.trim() !== newPassword.trim())
      next.confirmPassword = "Xác nhận mật khẩu không khớp";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const forceLogoutToLogin = () => {
    // clear auth + cache
    dispatch(logoutAction());
    dispatch(baseApi.util.resetApiState());

    const loginUrl = `${localePrefix}${endPoint.AUTH}?view=login`;
    window.location.replace(loginUrl);
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      const res: any = await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      }).unwrap();

      toast.success(
        res?.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
      );

      // reset form (optional)
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});

      // bắt buộc đăng nhập lại sau đổi mật khẩu
      // delay nhẹ để user thấy toast
      setTimeout(() => {
        forceLogoutToLogin();
      }, 650);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isBusy = m.isLoading;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-xs">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500
                       hover:text-emerald-700 hover:border-emerald-300 hover:shadow-sm transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800">
              Đổi mật khẩu
            </div>
            <div className="text-xs text-slate-500">
              Bảo vệ tài khoản của bạn tốt hơn
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          {/* banner */}
          <div className="px-6 py-6 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black tracking-tight">
                  Cập nhật mật khẩu
                </div>
                <div className="text-sm text-white/85">
                  Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
                </div>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="px-6 py-6">
            <div className="grid gap-5">
              <PasswordInput
                label="Mật khẩu hiện tại"
                value={currentPassword}
                onChange={(v) => {
                  setCurrentPassword(v);
                  if (errors.currentPassword)
                    setErrors((p) => ({ ...p, currentPassword: undefined }));
                }}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isBusy}
                error={errors.currentPassword}
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <PasswordInput
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChange={(v) => {
                    setNewPassword(v);
                    if (errors.newPassword)
                      setErrors((p) => ({ ...p, newPassword: undefined }));
                  }}
                  placeholder="Tối thiểu 6 ký tự"
                  disabled={isBusy}
                  error={errors.newPassword}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                />

                <PasswordInput
                  label="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={isBusy}
                  error={errors.confirmPassword}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                />
              </div>

              {/* strength + hints */}
              <StrengthMeter pw={newPassword} />
              <PasswordHints pw={newPassword} />
            </div>
          </div>

          {/* footer */}
          <div className="border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isBusy}
              className="
                px-5 py-2 rounded-2xl font-semibold hover:scale-[1.05]
                text-slate-700 bg-white border border-slate-200
                hover:bg-slate-100  active:scale-[0.98] transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              Huỷ
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isBusy}
              className="
                px-6 py-2 rounded-2xl font-semibold text-white hover:scale-[1.02]
                bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                active:scale-[0.98] transition
                disabled:opacity-60 disabled:cursor-not-allowed
                inline-flex items-center gap-2
              "
            >
              {isBusy ? (
                <>
                  <LoadingSpinner color="white" size="5" inline />
                  Đang cập nhật...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
