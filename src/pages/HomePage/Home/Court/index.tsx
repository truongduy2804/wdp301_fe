import React from "react";
import { motion } from "framer-motion";
import { User, Factory, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  {
    icon: User,
    title: "Người dân (Citizen)",
    badge: "Báo cáo & nhận thưởng",
    points: [
      "Báo cáo rác/tái chế (ảnh + GPS + mô tả)",
      "Theo dõi trạng thái: Pending/Accepted/Assigned/Collected",
      "Chọn loại rác khi tạo báo cáo (phân loại tại nguồn)",
      "Nhận điểm thưởng & xem bảng xếp hạng khu vực",
      "Gửi phản hồi/khiếu nại khi thu gom không đúng cam kết",
    ],
    cta: { label: "Bắt đầu báo cáo", to: "/auth/login" },
  },
  {
    icon: Factory,
    title: "Doanh nghiệp tái chế",
    badge: "Tiếp nhận & xử lý",
    points: [
      "Tiếp nhận báo cáo theo khu vực & loại rác",
      "Tối ưu tuyến thu gom & năng lực xử lý",
      "Thiết lập quy tắc thưởng/điểm cho cộng đồng",
      "Báo cáo thống kê (khối lượng, loại rác, hiệu suất)",
      "Quản trị đối tác thu gom & lịch trình",
    ],
    cta: { label: "Đăng ký doanh nghiệp", to: "/enterprise" },
  },
  {
    icon: Truck,
    title: "Đơn vị thu gom (Collector)",
    badge: "Nhận nhiệm vụ",
    points: [
      "Nhận phân công theo tuyến & thời gian",
      "Cập nhật tiến độ thu gom tại hiện trường",
      "Minh chứng thu gom (ảnh/ghi chú)",
      "Giảm chồng chéo xử lý nhờ trạng thái rõ ràng",
      "Tăng hiệu suất nhờ gợi ý tuyến theo khu vực",
    ],
    cta: { label: "Xem nhiệm vụ", to: "/collector" },
  },
];

const CourtSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ECONET dành cho ai?
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Một hệ sinh thái đủ 3 bên: Citizen — Enterprise — Collector. Kết nối
            theo khu vực, vận hành minh bạch.
          </p>
        </div>

        <motion.div
          className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {cards.map((c, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                      <c.icon className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {c.title}
                      </div>
                      <div className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        {c.badge}
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {c.points.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Link
                    to={c.cta.to}
                    className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                  >
                    {c.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 opacity-40" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CourtSection;
