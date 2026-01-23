import React, { memo } from "react";
import { Link } from "react-router-dom";
import { SiGoogleplay, SiAppstore, SiVisa, SiPaypal } from "react-icons/si";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  CreditCard,
} from "lucide-react";
import endPoint from "@/router/endPoint";

const socials = [
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Youtube, label: "Youtube", href: "#" },
  { Icon: Twitter, label: "Twitter", href: "#" },
];

const quickLinks = [
  { label: "Trang chủ", to: endPoint.HOMEPAGE },
  { label: "Đặt lịch thu gom", to: "/pickup" },
  { label: "Điểm tái chế", to: "/recycle-points" },
  { label: "Giới thiệu", to: "/about" },
  { label: "Liên hệ", to: "/contact" },
];

const legalLinks = [
  { label: "Điều khoản dịch vụ", to: "/terms" },
  { label: "Chính sách bảo mật", to: "/privacy" },
];

const services = [
  { label: "Đặt lịch thu gom theo khu vực", to: "/pickup" },
  { label: "Tìm điểm tái chế gần bạn", to: "/recycle-points" },
  { label: "Theo dõi lịch sử yêu cầu", to: "/history" },
  { label: "Hỗ trợ doanh nghiệp tái chế", to: "/enterprise" },
];

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-300">
      {/* Top */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div>
            <Link
              to={endPoint.HOMEPAGE}
              className="inline-flex items-center gap-2"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Green<span className="text-emerald-400">Link</span>
              </span>
            </Link>

            <p className="mt-3 text-sm sm:text-[0.95rem] text-slate-400 leading-relaxed max-w-sm">
              Nền tảng kết nối thu gom – tái chế theo khu vực. Giúp người dân
              đặt lịch nhanh, theo dõi minh bạch và góp phần giảm rác thải.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-emerald-500/10 hover:ring-emerald-400/30 transition"
                >
                  <Icon className="w-5 h-5 text-slate-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">
              Liên kết nhanh
            </h4>

            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center text-slate-400 hover:text-emerald-300 transition
                               underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <h5 className="text-sm font-semibold text-white/90 mb-2">
                Pháp lý
              </h5>
              <ul className="space-y-2 text-sm">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="inline-flex items-center text-slate-400 hover:text-emerald-300 transition
                                 underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              {services.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center text-slate-400 hover:text-emerald-300 transition
                               underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* tiny note */}
            <div className="mt-4 rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Mẹo: Nếu không thấy email xác nhận, hãy kiểm tra mục Spam/Quảng
                cáo.
              </p>
            </div>
          </div>

          {/* App */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">
              Tải ứng dụng
            </h4>
            <p className="text-sm text-slate-400 mb-3 leading-relaxed">
              Tải ứng dụng để đặt lịch thu gom nhanh hơn và theo dõi trạng thái
              theo thời gian thực.
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href="#"
                className="group flex items-center justify-center gap-2 rounded-2xl
                           bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600
                           text-white px-4 py-2.5 font-semibold shadow-md
                           hover:brightness-95 transition"
              >
                <SiAppstore className="w-5 h-5" />
                <span className="text-sm">
                  Tải về <span className="font-extrabold">App Store</span>
                </span>
              </a>

              <a
                href="#"
                className="group flex items-center justify-center gap-2 rounded-2xl
                           border border-emerald-400/30 bg-white/5 text-white px-4 py-2.5 font-semibold
                           hover:bg-emerald-500/10 hover:border-emerald-300/50 transition"
              >
                <SiGoogleplay className="w-5 h-5 text-emerald-300" />
                <span className="text-sm">
                  Tải về <span className="font-extrabold">Google Play</span>
                </span>
              </a>
            </div>

            {/* payment icons */}
            <div className="mt-4 flex items-center gap-3 text-slate-300/80">
              <SiVisa className="w-6 h-6 hover:text-white transition cursor-pointer" />
              <SiPaypal className="w-6 h-6 hover:text-white transition cursor-pointer" />
              <CreditCard className="w-6 h-6 hover:text-white transition cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
            © 2025 GreenLink. Tất cả quyền được bảo lưu.
          </p>

          <div className="text-xs text-slate-500 text-center">
            Vì một Việt Nam xanh – sạch – bền vững 🌿
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
