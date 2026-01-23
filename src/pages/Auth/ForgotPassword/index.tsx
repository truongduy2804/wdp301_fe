// pages/Auth/ForgotPassword.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { LuRecycle, LuLeaf, LuSparkles } from "react-icons/lu";
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

  // ✅ trigger shake again even if same error text
  const [errorTick, setErrorTick] = useState(0);

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const err = validateEmail(email);
    if (err) {
      setError(err);
      setErrorTick((t) => t + 1); // ✅ force rerun animation
      return;
    }

    setIsLoading(true);
    setError(null);

    // DEMO only
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

    // DEMO only
    window.setTimeout(() => {
      setIsLoading(false);
      onResendEmail?.(email);
      startCountdown();
    }, 650);
  };

  return (
    <div className="flex items-center justify-center p-2">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm sm:max-w-[460px]"
      >
        <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white/80 shadow-xl backdrop-blur">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5">
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-lime-600 shadow-md">
                    <LuRecycle className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow">
                    <LuSparkles className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>

                <div>
                  <h1 className="text-lg font-extrabold text-slate-900">
                    ECONET
                  </h1>
                  <p className="text-xs text-slate-600">
                    Kết nối thu gom • tái chế • theo khu vực
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <LuLeaf className="h-3.5 w-3.5" />
                An toàn & nhanh
              </span>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-100">
                Khôi phục tài khoản
              </span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800 ring-1 ring-green-100">
                Email xác minh
              </span>
              <span className="rounded-full bg-lime-50 px-3 py-1 text-xs font-medium text-lime-800 ring-1 ring-lime-100">
                Bảo mật
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {step === "input" ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                      Khôi phục mật khẩu
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <CustomTextInput
                      label="Email"
                      name="email"
                      icon={FiMail}
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      error={error || undefined}
                      hideErrorText // ✅ IMPORTANT: không render lỗi bên trong input
                    />

                    {/* ✅ OUTSIDE ERROR + SHAKE */}
                    {error && (
                      <div
                        key={`${error}-${errorTick}`} // ✅ force shake again
                        className="flex items-center gap-2 text-red-600 animate-shake"
                      >
                        <FiAlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading}
                    className="
                      w-full rounded-xl py-3 font-semibold text-white shadow-md transition
                      bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600
                      hover:brightness-95 hover:shadow-lg
                      disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400
                      disabled:cursor-not-allowed
                      focus:outline-none focus:ring-4 focus:ring-emerald-300/40
                    "
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <LoadingSpinner color="white" size="5" inline />
                        <span>Đang gửi...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        <FiMail className="h-5 w-5" />
                        <span>Gửi liên kết khôi phục</span>
                      </span>
                    )}
                  </button>

                  <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
                    <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      Liên kết khôi phục sẽ được gửi tới email của bạn. Hãy kiểm
                      tra cả mục Spam/Quảng cáo nếu chưa thấy.
                    </span>
                  </div>

                  <p className="text-center text-sm text-slate-700">
                    Bạn đã nhớ mật khẩu?{" "}
                    <button
                      type="button"
                      onClick={toggleView}
                      className="font-medium text-emerald-700 hover:brightness-75 hover:underline"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5 text-center"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                    <FiCheck className="h-7 w-7 text-emerald-700" />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                      Đã gửi liên kết!
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Hướng dẫn đặt lại mật khẩu đã được gửi đến:
                    </p>
                    <p className="mt-1 break-all text-[0.98rem] font-semibold text-emerald-700">
                      {email}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
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
                            Liên kết có thể hết hạn sau một khoảng thời gian để
                            đảm bảo bảo mật.
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
                        "w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                        canResend && !isLoading
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border border-slate-300 border-t-transparent" />
                          <span>Đang gửi...</span>
                        </span>
                      ) : canResend ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <FiRefreshCw className="h-4 w-4" />
                          <span>Gửi lại email</span>
                        </span>
                      ) : (
                        <span>Gửi lại sau {countdown}s</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleView}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 py-3 font-semibold text-white shadow-md transition hover:brightness-95 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300/40"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 pb-5 text-xs text-slate-600">
            <LuLeaf className="h-4 w-4 text-emerald-700" />
            Nền tảng kết nối thu gom – tái chế theo khu vực
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
