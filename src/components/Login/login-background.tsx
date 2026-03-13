import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Card } from "@/components/ui/card/card";
import {
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginBackground() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-glow">
                <Leaf className="w-8 h-8 text-white animate-float" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">GreenPoint</h1>
                <p className="text-gray-600 text-sm">
                  Thu gom rác chuyên nghiệp
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className="flex items-start gap-4 animate-fade-in-up hover:translate-x-2 transition-transform duration-300"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="bg-emerald-100 rounded-lg p-3 flex-shrink-0 hover:bg-emerald-200 transition-colors duration-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Dịch vụ tin cậy
                </h3>
                <p className="text-gray-600 text-sm">
                  Hơn 10 năm phục vụ cộng đồng bảo vệ môi trường
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 animate-fade-in-up hover:translate-x-2 transition-transform duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0 hover:bg-blue-200 transition-colors duration-300">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Bảo mật hàng đầu
                </h3>
                <p className="text-gray-600 text-sm">
                  Dữ liệu của bạn được mã hóa và bảo vệ an toàn
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 animate-fade-in-up hover:translate-x-2 transition-transform duration-300"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-green-100 rounded-lg p-3 flex-shrink-0 hover:bg-green-200 transition-colors duration-300">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Bảo vệ môi trường
                </h3>
                <p className="text-gray-600 text-sm">
                  Cùng nhau xây dựng một tương lai xanh
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="animate-slide-in-right"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="border-0 shadow-2xl bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
            <div className="p-8 sm:p-10">
              <div
                className="mb-8 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Đăng nhập
                </h2>
                <p className="text-gray-500 text-base">
                  Vào hệ thống quản lý dịch vụ của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div
                  className="space-y-2 animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 group-hover:text-emerald-500 transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:shadow-md transition-all duration-300 rounded-lg font-medium text-gray-900 group-hover:bg-gray-100"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div
                  className="space-y-2 animate-fade-in-up"
                  style={{ animationDelay: "0.5s" }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 group-hover:text-emerald-500 transition-colors duration-300" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:shadow-md transition-all duration-300 rounded-lg font-medium text-gray-900 group-hover:bg-gray-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div
                  className="flex items-center justify-between text-sm animate-fade-in-up"
                  style={{ animationDelay: "0.6s" }}
                >
                  <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors duration-300">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-emerald-600 border-gray-300 cursor-pointer"
                    />
                    <span className="text-gray-600">Nhớ mật khẩu</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-all duration-300 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 animate-fade-in-up"
                  style={{ animationDelay: "0.7s" }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Đăng nhập
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div
                className="my-8 flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                <span className="text-xs text-gray-500 font-medium">hoặc</span>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
              </div>

              {/* Social Login Buttons */}
              <div
                className="grid grid-cols-2 gap-3 animate-fade-in-up"
                style={{ animationDelay: "0.9s" }}
              >
                <Button
                  variant="outline"
                  className="h-11 rounded-lg border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 bg-white text-gray-700 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-lg border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 bg-white text-gray-700 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
              </div>

              {/* Sign Up Link */}
              <div
                className="mt-8 pt-8 border-t border-gray-200 text-center animate-fade-in-up"
                style={{ animationDelay: "1s" }}
              >
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-all duration-300 hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </Card>

          {/* Footer Trust Badge */}
          <div className="mt-6 text-center text-xs text-gray-600 animate-pulse-slow">
            <p>Bảo vệ môi trường bắt đầu từ việc quản lý rác thải hiệu quả</p>
          </div>
        </div>
      </div>
    </div>
  );
}
