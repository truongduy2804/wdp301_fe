import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import endPoint from "@/router/endPoint";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  CustomTextInput,
  CustomPasswordInput,
} from "@/components/ui/Form_Input";

interface LoginProps {
  toggleView: () => void;
  onForgotPassword: () => void;
}

type MockRole = "ADMIN" | "ENTERPRISE";

const normalize = (s: string) => s.trim().toLowerCase();

const isEmail = (value: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
};

//  Cho phép nhập "admin" / "enterprise" dù field là Email
const validateIdentifier = (value: string) => {
  if (!value) return "Email là bắt buộc";
  const v = normalize(value);

  if (v === "admin" || v === "enterprise") return null;
  if (isEmail(value)) return null;

  return "Định dạng email không hợp lệ";
};

const API_URL = import.meta.env.VITE_API_URL || "";

async function loginApi(identifier: string, password: string): Promise<{ token: string; role: string; roleId: number }> {
  // Đảm bảo URL kết thúc bằng /api/v1 nếu chưa có
  const cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const fullUrl = cleanBase.endsWith("/api/v1") ? `${cleanBase}/auth/login` : `${cleanBase}/api/v1/auth/login`;

  console.log("DEBUG: Calling Login API:", fullUrl);

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: identifier,
      password: password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Sai tài khoản hoặc mật khẩu");
  }

  const res = await response.json();
  console.log("DEBUG: Full Login Response (Fixed):", res);

  const data = res.data || {};
  const token = data.backendToken?.accessToken || res.accessToken || res.token || data.token;
  const role = data.user?.role?.name || data.user?.role || res.role || "ADMIN";
  const roleId = data.user?.roleId || data.user?.role?.id || res.roleId || 4;

  return {
    token,
    role,
    roleId,
  };
}

const Login: React.FC<LoginProps> = ({ toggleView, onForgotPassword }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(""); // thực tế: email/username
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const emailErr = useMemo(
    () => (error ? validateIdentifier(email) : null),
    [email, error],
  );

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
    toast.error(msg, { autoClose: 2000 });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    const idErr = validateIdentifier(email);
    if (idErr) return triggerError(idErr);
    if (!password) return triggerError("Mật khẩu là bắt buộc");

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginApi(email, password);
      console.log("DEBUG: Login Success Activity:", result);

      // PAUSE for debugging 401
      // alert("Đã nhận Token từ Backend. Kiểm tra Console trước khi nhấn OK để tiếp tục.");

      const store = remember ? localStorage : sessionStorage;
      store.setItem("mock_user", normalize(email)); // Giữ key cũ để tương thích
      store.setItem("mock_role", result.role);
      store.setItem("mock_role_id", String(result.roleId));
      store.setItem("econet_access_token", result.token);

      // Đồng bộ với LS_USER của mockAuthApi (nếu cần)
      store.setItem("econet_user", JSON.stringify({
        fullname: email.split("@")[0], // Tạm thời lấy từ email
        email: email,
        role: result.role,
      }));

      toast.success("Đăng nhập thành công!", { autoClose: 1400 });

      const target = result.role === "ADMIN" ? endPoint.ADMIN : endPoint.ENTERPRISE;
      navigate(target, { replace: true });
    } catch (err: any) {
      triggerError(err?.message ?? "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng nhập
        </h2>
        <p className="mt-1 text-slate-700">
          Chào mừng bạn quay trở lại! <span className="ml-1">🌱</span>
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
              label="Email"
              name="email"
              icon={FiMail as any}
              type="text" // ✅ cho phép admin/enterprise
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              error={error ? (emailErr ?? undefined) : undefined}
              showErrorText={false}
            />
          </div>

          <div className="space-y-1.5">
            <CustomPasswordInput
              label="Mật khẩu"
              name="password"
              icon={FiLock as any}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              error={
                error
                  ? !password
                    ? "Mật khẩu là bắt buộc"
                    : undefined
                  : undefined
              }
              showErrorText={false}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
              />
              Ghi nhớ đăng nhập
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-emerald-700 hover:underline hover:brightness-75 underline-offset-4"
            >
              Quên mật khẩu?
            </button>
          </div>
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
              Đang đăng nhập...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              Đăng nhập
              <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="my-3 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold text-slate-500">
            HOẶC TIẾP TỤC VỚI
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 font-semibold text-slate-700
                       hover:brightness-90 transition flex items-center justify-center gap-2"
            onClick={() =>
              toast.info("Demo: Social login chưa nối API", { autoClose: 1500 })
            }
          >
            <FcGoogle className="h-5 w-5" />
            Google
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 font-semibold text-slate-700
                        hover:brightness-90 transition flex items-center justify-center gap-2"
            onClick={() =>
              toast.info("Demo: Social login chưa nối API", { autoClose: 1500 })
            }
          >
            <FaFacebook className="h-5 w-5 text-[#1877F2]" />
            Facebook
          </button>
        </div>

        <p className="pt-2 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={toggleView}
            className="font-semibold text-emerald-700 hover:underline hover:brightness-75 underline-offset-4"
          >
            Đăng ký ngay
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
