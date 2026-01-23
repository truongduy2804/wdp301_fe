import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Radar, ShieldCheck } from "lucide-react";

const pins = [
  { x: "18%", y: "35%", label: "Quận 1", level: "High" },
  { x: "55%", y: "28%", label: "Quận 3", level: "Medium" },
  { x: "72%", y: "58%", label: "Quận 7", level: "High" },
  { x: "38%", y: "68%", label: "Thủ Đức", level: "Medium" },
];

const MapSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Phủ theo khu vực, tối ưu tuyến thu gom
            </h2>
            <p className="mt-2 text-slate-600">
              Bản đồ khu vực giúp doanh nghiệp/đơn vị thu gom phân tuyến hợp lý,
              giảm chồng chéo và tăng tốc xử lý báo cáo.
            </p>

            <div className="mt-6 space-y-3">
              {[
                {
                  icon: Radar,
                  title: "Gợi ý tuyến theo điểm báo cáo",
                  desc: "Tập trung khu vực nóng, ưu tiên điểm báo cáo hợp lệ.",
                },
                {
                  icon: Navigation,
                  title: "Định vị GPS chuẩn",
                  desc: "Giảm sai lệch địa chỉ — dễ triển khai thu gom thực tế.",
                },
                {
                  icon: ShieldCheck,
                  title: "Minh bạch theo trạng thái",
                  desc: "Mỗi điểm có trạng thái & lịch sử xử lý rõ ràng.",
                },
              ].map((it, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                      <it.icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900">
                        {it.title}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {it.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map mock */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-xl overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.25) 1px, transparent 0)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-900">
                    Bản đồ khu vực (UI demo)
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    Coverage
                  </span>
                </div>

                <div className="mt-5 relative h-[320px] sm:h-[360px] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 border border-slate-200 overflow-hidden">
                  {/* soft roads */}
                  <div className="absolute inset-0 opacity-60">
                    <div className="absolute left-8 top-10 h-[2px] w-[70%] bg-slate-200 rotate-[10deg]" />
                    <div className="absolute left-0 top-44 h-[2px] w-[100%] bg-slate-200 rotate-[-5deg]" />
                    <div className="absolute left-20 top-72 h-[2px] w-[60%] bg-slate-200 rotate-[18deg]" />
                    <div className="absolute left-28 top-16 h-[2px] w-[55%] bg-slate-200 rotate-[70deg]" />
                    <div className="absolute left-64 top-8 h-[2px] w-[55%] bg-slate-200 rotate-[95deg]" />
                  </div>

                  {/* pins */}
                  {pins.map((p, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute"
                      style={{ left: p.x, top: p.y }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 16,
                        delay: 0.05 * idx,
                      }}
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: idx * 0.15,
                        }}
                        className="relative"
                      >
                        <div className="absolute -inset-3 rounded-full bg-emerald-400/20 blur-md" />
                        <div className="relative flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-md ring-1 ring-slate-200">
                          <MapPin className="h-4 w-4 text-emerald-700" />
                          <div className="leading-tight">
                            <div className="text-xs font-extrabold text-slate-900">
                              {p.label}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-600">
                              Priority:{" "}
                              <span className="text-emerald-700">
                                {p.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { k: "Avg response", v: "12–24h" },
                    { k: "Route optimization", v: "Enabled" },
                    { k: "Verified reports", v: "High" },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="text-slate-500 font-semibold">{m.k}</div>
                      <div className="text-slate-900 font-extrabold mt-0.5">
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
