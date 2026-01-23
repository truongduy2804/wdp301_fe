import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Recycle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 shadow-xl"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-4 w-4" />
                  Bắt đầu cùng ECONET
                </div>
                <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                  Sẵn sàng biến báo cáo của bạn thành hành động thu gom?
                </h3>
                <p className="mt-2 text-white/90">
                  Báo cáo rác/tái chế theo khu vực, theo dõi trạng thái minh
                  bạch và nhận điểm thưởng khi phân loại đúng.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/auth/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-extrabold text-emerald-800 shadow-sm hover:bg-emerald-50 transition"
                >
                  <Recycle className="h-5 w-5" />
                  Tạo báo cáo ngay
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/enterprise"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/15 transition"
                >
                  Trở thành đối tác doanh nghiệp
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-xs text-slate-500">
          * Nội dung demo landing page (chưa tích hợp API). Bạn có thể gắn dữ
          liệu thật sau.
        </div>
      </div>
    </section>
  );
};

export default CTASection;
