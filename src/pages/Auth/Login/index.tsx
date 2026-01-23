import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaFacebookF,
  FaApple,
  FaGoogle,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { LuLeaf, LuRecycle, LuShieldCheck, LuSparkles } from "react-icons/lu";
import {
  CustomTextInput,
  CustomPasswordInput,
} from "@/components/ui/Form_Input";

interface LoginProps {
  toggleView?: () => void;
  onForgotPassword?: () => void;
}

const Login: React.FC<LoginProps> = ({ toggleView, onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, remember });
  };

  return (
    <div className="flex items-center justify-center px-3 py-3 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-green-100 bg-white/85 shadow-lg sm:shadow-xl backdrop-blur">
          {/* Header */}
          <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 shadow-md">
                    <LuRecycle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow">
                    <LuSparkles className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>

                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                    ECONET
                  </h1>
                  <p className="text-[11px] sm:text-xs text-gray-600">
                    Kết nối người dân • thu gom • tái chế theo khu vực
                  </p>
                </div>
              </div>
              <span className="hidden sm:flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800 leading-none">
                <LuLeaf className="h-3.5 w-3.5 shrink-0" />
                <span className="flex items-center">Sống xanh</span>
              </span>
            </div>

            {/* chips */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-emerald-800 ring-1 ring-emerald-100">
                Đặt lịch thu gom
              </span>
              <span className="rounded-full bg-green-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-green-800 ring-1 ring-green-100">
                Điểm tái chế
              </span>
              <span className="rounded-full bg-lime-50 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-lime-800 ring-1 ring-lime-100">
                Kết nối doanh nghiệp
              </span>
            </div>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4"
          >
            <div className="text-center">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Đăng nhập
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Theo dõi yêu cầu thu gom và hoạt động tái chế của bạn.
              </p>
            </div>

            <div className="space-y-3">
              <CustomTextInput
                label="Email"
                name="email"
                icon={FaEnvelope}
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <CustomPasswordInput
                label="Mật khẩu"
                name="password"
                icon={FaLock}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-[13px] sm:text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-green-300 text-emerald-600 focus:ring-emerald-500"
                />
                Ghi nhớ đăng nhập
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="font-medium text-emerald-700 hover:text-emerald-600 hover:underline hover:brightness-75"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="
                w-full rounded-xl py-3 text-sm sm:text-base font-semibold text-white shadow-md transition
                bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600
                hover:brightness-95 hover:shadow-lg
                focus:outline-none focus:ring-4 focus:ring-emerald-300/40
              "
            >
              Đăng nhập
            </button>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[12px] sm:text-xs text-emerald-900">
              <LuShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              <span>
                Dữ liệu dùng để kết nối dịch vụ môi trường. Bạn có thể cập nhật
                hồ sơ sau.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-green-100" />
              <span className="text-xs font-medium text-gray-500">Hoặc</span>
              <div className="h-px flex-1 bg-green-100" />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Facebook */}
              <button className="flex h-9 items-center justify-center rounded-lg bg-[#1877F2] text-white hover:bg-[#166FE5] transition">
                <FaFacebookF className="text-lg" />
              </button>

              {/* Google */}
              <button className="flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-neutral-50 transition">
                <FcGoogle className="text-xl" />
              </button>

              {/* Apple */}
              <button className="flex h-9 items-center justify-center rounded-lg bg-black text-white hover:bg-neutral-800 transition">
                <FaApple className="text-lg" />
              </button>
            </div>

            <p className="text-center text-sm text-gray-700">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={toggleView}
                className="font-medium text-emerald-700 hover:brightness-75 hover:underline"
              >
                Đăng ký ngay
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
