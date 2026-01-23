import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { BadgeCheck, Users, Truck, Factory } from "lucide-react";

const Stat = ({
  icon: Icon,
  label,
  value,
  suffix = "",
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
}) => {
  const mv = useMotionValue(0);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Icon className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-600">{label}</div>
          <motion.div className="text-2xl font-extrabold text-slate-900">
            <motion.span>{mv}</motion.span>
            {suffix}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const CommunitySection = () => {
  return (
    <section className="pb-12 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Minh bạch • Theo dõi được • Thưởng xứng đáng
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Người dân báo cáo — doanh nghiệp tiếp nhận — đơn vị thu gom thực
              hiện — hệ thống ghi nhận & thưởng điểm. Tất cả hiển thị rõ ràng
              theo trạng thái.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <BadgeCheck className="h-4 w-4" />
            Dữ liệu demo (chưa API) • UI chuẩn landing
          </div>
        </div>

        <motion.div
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {[
            {
              icon: Users,
              label: "Người dùng tham gia",
              value: 12840,
              suffix: "+",
            },
            { icon: Truck, label: "Lượt thu gom", value: 3240, suffix: "+" },
            { icon: Factory, label: "Đối tác tái chế", value: 86, suffix: "+" },
            {
              icon: BadgeCheck,
              label: "Báo cáo hợp lệ",
              value: 9750,
              suffix: "+",
            },
          ].map((s, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Stat {...s} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
