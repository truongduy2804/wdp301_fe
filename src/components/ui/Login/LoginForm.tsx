"use client";

import type React from "react";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { Card } from "../card/card";
import { Button } from "../button/button";
import { Input } from "../input/input";

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
      console.log("Login:", { email, password });
    }, 2000);
  };

  return (
    <div
      className="w-full max-w-md flex flex-col justify-center animate-fade-in-up "
      style={{ animationDelay: "0.2s" }}
    >
      <div className="animated-border">
        <Card
          className="p-8 shadow-2xl border-0 bg-white relative z-10"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
        >
          <div className="space-y-6">
            {/* Header */}
            <div
              className="space-y-2 text-center animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="text-3xl font-extrabold text-gray-900">
                Đăng nhập
              </h3>
              <p className="text-gray-600 font-medium">
                Chào mừng bạn đến với GreenPoint
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div
                className="space-y-2 animate-fade-in-up group"
                style={{ animationDelay: "0.3s" }}
              >
                <label className="block text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors duration-300">
                  Email
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-emerald-500 transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 h-11 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div
                className="space-y-2 animate-fade-in-up group"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors duration-300">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-300 hover:scale-105"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-emerald-500 transition-colors duration-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 h-11 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-all duration-300 hover:scale-110 active:scale-95"
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
                className="flex items-center gap-2 animate-fade-in-up group"
                style={{ animationDelay: "0.5s" }}
              >
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer hover:scale-110 transition-transform duration-300"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer group-hover:text-emerald-600 font-medium transition-colors duration-300"
                >
                  Ghi nhớ tôi
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 active:scale-95 animate-fade-in-up mt-2 hover:scale-[1.02] transform"
                style={{ animationDelay: "0.6s" }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span className="animate-pulse">Đang xử lý...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Đăng nhập
                    <span className="animate-bounce-soft">→</span>
                  </span>
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
                <span className="px-3 bg-white text-gray-500 font-medium">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 hover:border-blue-300 h-11 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 font-semibold group"
              >
                <Chrome className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-blue-600 transition-colors duration-300">
                  Google
                </span>
              </Button>
            </div>

            {/* Footer */}
            <div
              className="text-center pt-4 animate-fade-in-up"
              style={{ animationDelay: "0.9s" }}
            >
              <p className="text-gray-600 font-medium">
                Chưa có tài khoản?{" "}
                <a
                  href="#"
                  className="text-emerald-600 hover:text-emerald-700 font-bold transition-all duration-300 hover:underline hover:scale-105 inline-block"
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
