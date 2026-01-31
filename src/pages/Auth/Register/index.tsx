import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-toastify";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  CustomTextInput,
  CustomPasswordInput,
} from "@/components/ui/Form_Input";

import { useSignupMutation } from "@/redux/api/auth/authApi";

interface RegisterProps {
  toggleView: () => void; // -> login
}

const validateEmail = (email: string) => {
  if (!email) return "Email là bắt buộc";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return "Định dạng email không hợp lệ";
  return null;
};

const validatePhone = (phone: string) => {
  if (!phone) return "Số điện thoại là bắt buộc";
  const re = /^[0-9+]{8,15}$/; // đơn giản: 8-15 ký tự, cho phép +
  if (!re.test(phone)) return "Số điện thoại không hợp lệ";
  return null;
};

function getApiErrorMessage(err: any): string {
  return err?.data?.message || err?.error || err?.message || "Đăng ký thất bại";
}

const Register: React.FC<RegisterProps> = ({ toggleView }) => {
  const [signupApi, { isLoading }] = useSignupMutation();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // ✅ theo Swagger
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerError = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    if (!fullname.trim()) return triggerError("Họ và tên là bắt buộc");
    const eErr = validateEmail(email);
    if (eErr) return triggerError(eErr);
    const pErr = validatePhone(phone);
    if (pErr) return triggerError(pErr);

    if (!password) return triggerError("Mật khẩu là bắt buộc");
    if (password.length < 6) return triggerError("Mật khẩu tối thiểu 6 ký tự");
    if (confirm !== password)
      return triggerError("Xác nhận mật khẩu không khớp");
    if (!agree) return triggerError("Bạn cần đồng ý Điều khoản & Chính sách");

    setError(null);

    try {
      await signupApi({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullname.trim(),
        phone: phone.trim(),
      }).unwrap();

      toast.success("Đăng ký thành công! Hãy đăng nhập.", { autoClose: 1600 });
      toggleView();
    } catch (err: any) {
      triggerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký
        </h2>
        <p className="mt-1 text-slate-700">
          Tạo tài khoản để bắt đầu <span className="ml-1">🌿</span>
        </p>
        <div className="mx-auto mt-4 h-px w-20 bg-emerald-200/80" />
      </div>

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
            showErrorText={false}
          />

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
            showErrorText={false}
          />

          <CustomTextInput
            label="Số điện thoại"
            name="phone"
            icon={FiPhone as any}
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            autoComplete="tel"
            showErrorText={false}
          />

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
            showErrorText={false}
          />

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
            showErrorText={false}
          />

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
