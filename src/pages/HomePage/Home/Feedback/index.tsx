import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck } from "lucide-react";

const reviews = [
  {
    name: "Thảo My (Citizen)",
    quote:
      "Mình báo cáo rác tái chế ngay trên app, theo dõi trạng thái rõ ràng. Có điểm thưởng nên cả nhà chịu khó phân loại hơn.",
    meta: "Khu vực: Phường 7",
  },
  {
    name: "EcoPartner (Enterprise)",
    quote:
      "Tập trung báo cáo theo khu vực giúp tối ưu tuyến thu gom. Dữ liệu rõ ràng giúp kiểm soát hiệu suất & chất lượng.",
    meta: "Đối tác tái chế",
  },
  {
    name: "Tổ thu gom A (Collector)",
    quote:
      "Nhận nhiệm vụ rõ ràng, cập nhật thu gom đơn giản. Ít bị trùng tuyến, dễ hoàn thành theo lịch phân công.",
    meta: "Collector team",
  },
];

const FeedbackSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Người dùng nói gì về ECONET
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Trải nghiệm ưu tiên sự rõ ràng, tin cậy và động lực cộng đồng.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            Review demo • UI landing
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
                delay: idx * 0.05,
              }}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="h-5 w-5 text-emerald-300" />
              </div>

              <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                “{r.quote}”
              </p>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="text-sm font-extrabold text-slate-900">
                  {r.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{r.meta}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
