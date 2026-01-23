import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const BannerSection = () => {
  return (
    <section className="relative pt-12 sm:pt-14 pb-12 sm:pb-16">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-[-140px] h-[320px] w-[320px] rounded-full bg-lime-200/25 blur-3xl" />
      <div className="pointer-events-none absolute top-20 left-[-140px] h-[320px] w-[320px] rounded-full bg-teal-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 backdrop-blur px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              ECONET • Nền tảng thu gom & tái chế theo khu vực
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900"
            >
              Biến{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 bg-clip-text text-transparent">
                báo cáo rác
              </span>{" "}
              thành hành động thu gom & tái chế{" "}
              <span className="underline decoration-emerald-300/70 underline-offset-8">
                minh bạch
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl"
            >
              ECONET kết nối <b>người dân</b>, <b>đơn vị thu gom</b> và{" "}
              <b>doanh nghiệp tái chế</b> để xử lý rác đúng quy trình. Báo cáo
              nhanh (ảnh + GPS), theo dõi trạng thái, nhận điểm thưởng khi phân
              loại đúng.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/auth/login"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 px-5 py-3 font-semibold text-white shadow-md hover:brightness-95 transition"
              >
                Bắt đầu báo cáo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/recycle-points"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-white transition"
              >
                <MapPin className="h-4 w-4 text-emerald-700" />
                Xem điểm tái chế
              </Link>
            </motion.div>

            {/* chips */}
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Recycle, text: "Phân loại tại nguồn" },
                { icon: ShieldCheck, text: "Trạng thái minh bạch" },
                { icon: MapPin, text: "GPS theo khu vực" },
              ].map((c, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100"
                >
                  <c.icon className="h-3.5 w-3.5" />
                  {c.text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="relative rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-xl overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.25) 1px, transparent 0)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">
                    Demo trạng thái báo cáo
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    Live-like UI
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: "Rác tái chế: Nhựa/giấy",
                      sub: "Khu vực: Phường 7 • GPS chuẩn",
                      status: "Accepted",
                      color: "emerald",
                    },
                    {
                      title: "Rác cồng kềnh",
                      sub: "Khu vực: Phường 2 • Có ảnh đính kèm",
                      status: "Assigned",
                      color: "teal",
                    },
                    {
                      title: "Rác sinh hoạt",
                      sub: "Khu vực: Phường 5 • Cần thu gom",
                      status: "Pending",
                      color: "slate",
                    },
                  ].map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.08 }}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {r.title}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {r.sub}
                          </div>
                        </div>
                        <span
                          className={[
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                            r.color === "emerald" &&
                              "bg-emerald-50 text-emerald-800 ring-emerald-100",
                            r.color === "teal" &&
                              "bg-teal-50 text-teal-800 ring-teal-100",
                            r.color === "slate" &&
                              "bg-slate-50 text-slate-700 ring-slate-200",
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500"
                          initial={{ width: "20%" }}
                          animate={{
                            width: i === 0 ? "78%" : i === 1 ? "60%" : "35%",
                          }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900">
                  Tip: Phân loại đúng giúp tăng điểm thưởng & ưu tiên xử lý
                  nhanh.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
