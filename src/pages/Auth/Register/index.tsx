import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  CustomTextInput,
  CustomPasswordInput,
} from "@/components/ui/Form_Input";

interface RegisterProps {
  toggleView: () => void; // -> login
}

const validateEmail = (email: string) => {
  if (!email) return "Email là bắt buộc";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return "Định dạng email không hợp lệ";
  return null;
};

const Register: React.FC<RegisterProps> = ({ toggleView }) => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!fullname.trim()) return triggerError("Họ và tên là bắt buộc");
    const eErr = validateEmail(email);
    if (eErr) return triggerError(eErr);
    if (!password) return triggerError("Mật khẩu là bắt buộc");
    if (password.length < 6) return triggerError("Mật khẩu tối thiểu 6 ký tự");
    if (confirm !== password)
      return triggerError("Xác nhận mật khẩu không khớp");
    if (!agree) return triggerError("Bạn cần đồng ý Điều khoản & Chính sách");

    setIsLoading(true);
    setError(null);

    window.setTimeout(() => {
      setIsLoading(false);
      toggleView();
    }, 800);
  };

  return (
    <div className="w-full">
      {/* ✅ Title + subtitle + line giống Login */}
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký
        </h2>
        <p className="mt-1 text-slate-700">
          Tạo tài khoản để bắt đầu đóng góp cho khu vực của bạn{" "}
          <span className="ml-1">🌿</span>
        </p>
        <div className="mx-auto mt-4 h-px w-20 bg-emerald-200/80" />
      </div>

      {/* Error outside + shake */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={`err-${shakeKey}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              x: [0, -10, 10, -8, 8, -6, 6, 0],
            }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          >
            <div className="flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Có lỗi xảy ra</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <CustomTextInput
              label="Họ và tên"
              name="fullname"
              icon={FiUser as any}
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                setError(null);
              }}
              autoComplete="name"
              error={
                error
                  ? !fullname.trim()
                    ? "Họ và tên là bắt buộc"
                    : undefined
                  : undefined
              }
              showErrorText={false}
            />
          </div>

          <div className="space-y-1.5">
            <CustomTextInput
              label="Email"
              name="email"
              icon={FiMail as any}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoComplete="username"
              error={error ? (validateEmail(email) ?? undefined) : undefined}
              showErrorText={false}
            />
          </div>

          <div className="space-y-1.5">
            <CustomPasswordInput
              label="Mật khẩu"
              name="password"
              icon={FiLock as any}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="new-password"
              error={
                error
                  ? !password
                    ? "Mật khẩu là bắt buộc"
                    : password.length < 6
                      ? "Mật khẩu tối thiểu 6 ký tự"
                      : undefined
                  : undefined
              }
              showErrorText={false}
            />
          </div>

          <div className="space-y-1.5">
            <CustomPasswordInput
              label="Xác nhận mật khẩu"
              name="confirm"
              icon={FiLock as any}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              autoComplete="new-password"
              error={
                error
                  ? confirm !== password
                    ? "Xác nhận mật khẩu không khớp"
                    : undefined
                  : undefined
              }
              showErrorText={false}
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-700 select-none pt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-200"
            />
            <span>
              Tôi đồng ý với{" "}
              <span className="font-medium hover:brightness-75 hover:underline text-emerald-700">
                Điều khoản
              </span>{" "}
              và{" "}
              <span className="font-medium hover:brightness-75 hover:underline text-emerald-700">
                Chính sách
              </span>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="
    group w-full rounded-2xl py-3 font-semibold text-white shadow-md transition
    bg-emerald-600
    hover:brightness-90 hover:shadow-lg
    active:brightness-70
    disabled:opacity-70 disabled:cursor-not-allowed
    focus:outline-none focus:ring-4 focus:ring-emerald-300/40
  "
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner color="white" size="5" inline />
              Đang tạo tài khoản...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              Tạo tài khoản
              <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          )}
        </button>

        <p className="pt-2 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={toggleView}
            className="font-semibold text-emerald-700 hover:underline hover:brightness-75 underline-offset-4"
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
