import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  ClipboardCheck,
  Recycle,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Báo cáo",
    desc: "Chụp ảnh + mô tả + chọn loại rác.",
  },
  {
    icon: MapPin,
    title: "Xác minh khu vực",
    desc: "GPS định vị, gợi ý tuyến & đơn vị xử lý.",
  },
  {
    icon: ClipboardCheck,
    title: "Thu gom",
    desc: "Accepted → Assigned → Collected, cập nhật minh chứng.",
  },
  {
    icon: Recycle,
    title: "Tái chế & thưởng",
    desc: "Báo cáo hợp lệ + phân loại đúng sẽ nhận điểm thưởng.",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Quy trình vận hành rõ ràng
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Đơn giản cho người dân — tối ưu cho doanh nghiệp & đơn vị thu gom.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {steps.map((s, idx) => (
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
                className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                    <s.icon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {idx + 1}. {s.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{s.desc}</div>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                    <ArrowRight className="h-5 w-5 text-emerald-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
            Gợi ý: hãy chọn đúng loại rác (nhựa/giấy/kim loại/hữu cơ/khác) để
            tăng điểm và giảm thời gian xác minh.
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
