import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  ClipboardList,
  Award,
  BarChart3,
  MessageSquareWarning,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Báo cáo nhanh (ảnh + mô tả)",
    desc: "Chụp ảnh hiện trạng, thêm mô tả — giúp xác minh rõ ràng & xử lý đúng.",
  },
  {
    icon: MapPin,
    title: "GPS theo khu vực",
    desc: "Định vị điểm cần thu gom — tự gợi ý khu vực & tuyến xử lý phù hợp.",
  },
  {
    icon: ClipboardList,
    title: "Theo dõi trạng thái minh bạch",
    desc: "Pending → Accepted → Assigned → Collected. Mọi bước đều có log.",
  },
  {
    icon: Award,
    title: "Điểm thưởng khi phân loại đúng",
    desc: "Chọn loại rác khi báo cáo — báo cáo hợp lệ được cộng điểm thưởng.",
  },
  {
    icon: BarChart3,
    title: "Lịch sử điểm & bảng xếp hạng",
    desc: "Xem lịch sử điểm theo tháng/khu vực, tạo động lực cộng đồng.",
  },
  {
    icon: MessageSquareWarning,
    title: "Phản hồi & khiếu nại",
    desc: "Gửi phản hồi nếu thu gom sai cam kết — hỗ trợ xử lý minh bạch.",
  },
];

const HighLightSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tính năng cốt lõi cho{" "}
            <span className="text-emerald-700">Citizen</span>
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Tối ưu cho việc báo cáo, theo dõi thu gom và khuyến khích phân loại
            tại nguồn.
          </p>
        </div>

        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              className="group rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 group-hover:bg-emerald-100 transition">
                  <f.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    {f.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HighLightSection;
