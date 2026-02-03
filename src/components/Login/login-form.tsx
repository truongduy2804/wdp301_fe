"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Leaf, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Card } from "@/components/ui/card/card";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
      {/* Left Section - Brand Info */}
      <div
        className="hidden lg:flex flex-col justify-center animate-slide-in-right"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Leaf className="w-10 h-10 text-emerald-600 animate-float" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-700">
                GreenPoint
              </h1>
              <p className="text-sm text-gray-600">Bảo vệ Môi Trường</p>
            </div>
          </div>

          {/* Main Description */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Quản lý rác thải thông minh
            </h2>
            <p className="text-lg text-gray-600">
              Giải pháp thu gom rác tiên tiến để bảo vệ hành tinh chúng ta
            </p>
          </div>

          {/* Trust Badges */}
          <div className="space-y-4">
            {[
              {
                icon: Leaf,
                title: "Bảo vệ Môi trường",
                desc: "Giải pháp xanh 100%",
              },
              { icon: Lock, title: "Bảo mật Dữ liệu", desc: "Mã hóa đầu cuối" },
              {
                icon: Mail,
                title: "Tin cậy & Minh bạch",
                desc: "Dịch vụ uy tín",
              },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 hover:translate-y-[-2px] cursor-default animate-fade-in-up"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="flex-shrink-0">
                  <badge.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{badge.title}</p>
                  <p className="text-sm text-gray-600 pl-4">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div
        className="flex flex-col justify-center animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <Card
          className="p-8 shadow-2xl border-0 bg-white"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-gray-900">Đăng nhập</h3>
              <p className="text-gray-500">Tiếp tục với tài khoản của bạn</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div
                className="space-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 h-11"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div
                className="space-y-2 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div
                className="flex items-center gap-2 animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ghi nhớ tôi
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 animate-fade-in-up mt-2"
                style={{ animationDelay: "0.6s" }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div
              className="relative my-6 animate-fade-in-up"
              style={{ animationDelay: "0.7s" }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div
              className="grid grid-cols-2 gap-3 animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-10 transition-all duration-300 hover:animate-bounce-soft bg-transparent"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-10 transition-all duration-300 hover:animate-bounce-soft bg-transparent"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
            </div>

            {/* Footer */}
            <div
              className="text-center pt-4 animate-pulse-light animate-fade-in-up"
              style={{ animationDelay: "0.9s" }}
            >
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <a
                  href="#"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
