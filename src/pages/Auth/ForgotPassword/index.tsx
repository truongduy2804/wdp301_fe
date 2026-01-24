import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiClock,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";

import { CustomTextInput } from "@/components/ui/Form_Input";
import LoadingSpinner from "@/components/ui/loadingSpinner";

interface ForgotPasswordProps {
  toggleView?: () => void;
  onEmailSent?: (email: string) => void;
  onResendEmail?: (email: string) => void;
}

const validateEmail = (email: string): string | null => {
  if (!email) return "Email là bắt buộc";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Định dạng email không hợp lệ";
  return null;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  toggleView,
  onEmailSent,
  onResendEmail,
}) => {
  const [step, setStep] = useState<"input" | "sent">("input");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // force rerun animation even if same error
  const [shakeKey, setShakeKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCountdown = () => {
    clearTimer();
    setCanResend(false);
    setCountdown(60);

    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const err = validateEmail(email);
    if (err) return triggerError(err);

    setIsLoading(true);
    setError(null);

    window.setTimeout(() => {
      setIsLoading(false);
      setStep("sent");
      onEmailSent?.(email);
      startCountdown();
    }, 650);
  };

  const handleResend = () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setError(null);

    window.setTimeout(() => {
      setIsLoading(false);
      onResendEmail?.(email);
      startCountdown();
    }, 650);
  };

  return (
    <div className="w-full">
      {/* ✅ Title + subtitle + line giống Login/Register */}
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Quên mật khẩu
        </h2>
        <p className="mt-1 text-slate-700">
          Nhập email đã đăng ký để nhận liên kết đặt lại.
        </p>
        <div className="mx-auto mt-4 h-px w-20 bg-emerald-200/80" />
      </div>

      {/* ✅ Error outside + shake giống Login/Register */}
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

      <AnimatePresence mode="wait">
        {step === "input" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <CustomTextInput
                  label="Email"
                  name="email"
                  icon={FiMail as any}
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  error={error || undefined}
                  showErrorText={false}
                />
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
                    Đang gửi...
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Gửi liên kết
                    <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                )}
              </button>

              {/* Note box giống style clean */}
              <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="leading-relaxed">
                  Liên kết sẽ được gửi tới email của bạn. Hãy kiểm tra cả mục
                  Spam/Quảng cáo nếu chưa thấy.
                </p>
              </div>

              <p className="text-center text-sm text-slate-600">
                Bạn đã nhớ mật khẩu?{" "}
                <button
                  type="button"
                  onClick={toggleView}
                  className="font-semibold text-emerald-700 hover:underline hover:brightness-75 underline-offset-4"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-emerald-100">
                  <FiCheck className="h-5 w-5 text-emerald-700" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    Đã gửi liên kết khôi phục
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Email nhận liên kết:
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-emerald-700">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Kiểm tra hộp thư
                    </p>
                    <p className="text-sm text-slate-600">
                      Nếu không thấy, hãy kiểm tra mục Spam/Quảng cáo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiClock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Thời gian hiệu lực
                    </p>
                    <p className="text-sm text-slate-600">
                      Liên kết có thể hết hạn sau một khoảng thời gian để đảm
                      bảo bảo mật.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={[
                  "w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                  canResend && !isLoading
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border border-slate-300 border-t-transparent" />
                    Đang gửi...
                  </span>
                ) : canResend ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <FiRefreshCw className="h-4 w-4" />
                    Gửi lại email
                  </span>
                ) : (
                  <span>Gửi lại sau {countdown}s</span>
                )}
              </button>

              <button
                type="button"
                onClick={toggleView}
                className="
                  group w-full rounded-2xl py-3 font-semibold text-white shadow-md transition
                  bg-emerald-600
                  hover:brightness-90 hover:shadow-lg
                  active:brightness-70
                  focus:outline-none focus:ring-4 focus:ring-emerald-300/40
                "
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Quay lại đăng nhập
                  <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
