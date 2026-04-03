import React, {
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Leaf,
  MapPin,
  TrendingUp,
  Award,
  Truck,
  Smartphone,
  Recycle,
  Sparkles,
  Users,
  Package,
} from "lucide-react";
import BrandMarks from "@/components/ui/BrandMark";

/** BrandMark */
const BrandMark = ({
  textMode = "inline",
  sizeClassName = "h-12 w-12",
}: {
  textMode?: "inline" | "stack" | "none";
  sizeClassName?: string;
}) => {
  const isStack = textMode === "stack";

  return (
    <div
      className={[
        "flex gap-3",
        isStack ? "flex-col items-center text-center" : "items-center",
      ].join(" ")}
    >
      <div
        className={`${sizeClassName} rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-lg`}
      >
        <Leaf className="h-7 w-7 text-white" strokeWidth={2.5} />
      </div>

      {textMode !== "none" && (
        <div className={isStack ? "" : "leading-none"}>
          <div className="font-bold text-2xl text-slate-900">
            Green<span className="text-emerald-600">point</span>
          </div>
          {isStack && (
            <div className="mt-1 text-xs font-medium text-slate-600">
              Thu gom • Tái chế • Theo khu vực
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** RotatingPhrase */
const RotatingPhrase = ({
  phrases,
  intervalMs = 2600,
  className = "",
}: {
  phrases: string[];
  intervalMs?: number;
  className?: string;
}) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % phrases.length),
      intervalMs,
    );
    return () => window.clearInterval(t);
  }, [intervalMs, phrases.length]);

  return (
    <div
      className={["relative h-[1.6em] overflow-hidden", className].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="whitespace-nowrap"
        >
          {phrases[idx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/** RotatingStat */
const RotatingStat = ({
  items,
  intervalMs = 2600,
}: {
  items: { value: string; label: string; icon: React.ElementType }[];
  intervalMs?: number;
}) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % items.length),
      intervalMs,
    );
    return () => window.clearInterval(t);
  }, [intervalMs, items.length]);

  const Icon = items[idx].icon;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex items-center justify-center gap-3"
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" strokeWidth={2.3} />
        </span>
        <div className="text-left leading-tight">
          <div className="text-3xl font-bold tracking-tight text-emerald-700">
            {items[idx].value}
          </div>
          <div className="text-xs font-medium text-slate-600">
            {items[idx].label}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function FloatingIcon({
  className,
  icon,
  delay = 0,
}: {
  className: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className={[
        className,
        "float-icon grid h-12 w-12 place-items-center rounded-2xl",
        "bg-white border border-emerald-100 shadow-lg text-emerald-700",
        "ring-1 ring-emerald-100/80",
      ].join(" ")}
      style={{ ["--d" as any]: `${delay}s` }}
      whileHover={{
        scale: 1.08,
        y: -8,
        boxShadow: "0 20px 40px -18px rgba(16,185,129,0.45)",
      }}
    >
      {icon}
    </motion.div>
  );
}

function FeatureChip({
  icon: Icon,
  text,
  className,
}: {
  icon: React.ElementType;
  text: string;
  className: string;
}) {
  return (
    <div className={`absolute ${className} pointer-events-auto`}>
      <motion.div
        className="
          group relative overflow-hidden
          inline-flex items-center gap-2
          rounded-2xl border border-emerald-200/70 bg-white/92
          px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur
          transition-all duration-200
          hover:-translate-y-1 hover:shadow-md hover:border-emerald-300/80 hover:bg-white
          active:translate-y-0 active:shadow-sm
        "
        whileHover={{ scale: 1.03 }}
      >
        <span
          className="
            pointer-events-none absolute inset-0
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.16),transparent_55%)]
          "
        />
        <span
          className="
            grid h-8 w-8 place-items-center rounded-xl
            bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100
            transition-all duration-200
            group-hover:bg-emerald-100 group-hover:ring-emerald-200
          "
        >
          <Icon
            className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105"
            strokeWidth={2.3}
          />
        </span>
        <span className="transition-colors duration-200 group-hover:text-slate-900">
          {text}
        </span>
      </motion.div>
    </div>
  );
}

const AuthShowcase: React.FC = () => {
  const features = [
    { icon: MapPin, text: "Định vị GPS chính xác" },
    { icon: TrendingUp, text: "Theo dõi tiến độ real-time" },
    { icon: Award, text: "Tích điểm & đổi quà" },
  ];

  const stats = [
    { value: "12K+", label: "Người dùng", icon: Users },
    { value: "850+", label: "Tấn rác tái chế", icon: Recycle },
    { value: "98%", label: "Phân loại đúng", icon: Package },
  ];

  const circlePhrases = [
    "Theo dõi thu gom real-time",
    "Định vị GPS & tối ưu tuyến",
    "Tích điểm • đổi quà • cộng đồng",
    "Bảo mật dữ liệu & minh bạch",
  ];

  // particles CSS
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${8 + ((i * 11) % 84)}%`,
      top: `${10 + ((i * 13) % 80)}%`,
      size: 5 + ((i * 7) % 10),
      delay: (i * 0.25) % 2.5,
      duration: 4 + ((i * 11) % 8),
    }));
  }, []);

  // ✅ để căn giữa trên/dưới “đều” theo toàn màn hình (header vẫn chiếm layout)
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderH(el.getBoundingClientRect().height);

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      <div className="force-motion relative flex min-h-screen items-stretch overflow-hidden bg-emerald-50">
        <style>{`
          @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes spin-reverse { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
          @keyframes float-y {
            0%{ transform: translate3d(0,0,0) rotate(0deg); }
            50%{ transform: translate3d(0,-6px,0) rotate(2deg); }
            100%{ transform: translate3d(0,0,0) rotate(0deg); }
          }
          @keyframes particle-float {
            0%{ transform: translate3d(0,0,0); opacity:.25; }
            50%{ transform: translate3d(0,-10px,0); opacity:.7; }
            100%{ transform: translate3d(0,0,0); opacity:.25; }
          }

          @media (prefers-reduced-motion: reduce) {
            .force-motion .animate-spin-slow { animation: spin-slow 20s linear infinite !important; }
            .force-motion .animate-spin-reverse { animation: spin-reverse 28s linear infinite !important; }
            .force-motion .animate-spin-slow-star { animation: spin-slow 16s linear infinite !important; }
            .force-motion .float-icon { animation: float-y 3s ease-in-out infinite !important; }
            .force-motion .particle { animation: particle-float var(--dur) ease-in-out infinite !important; }
          }

          .animate-spin-slow{ animation: spin-slow 20s linear infinite; will-change: transform; }
          .animate-spin-reverse{ animation: spin-reverse 28s linear infinite; will-change: transform; }
          .animate-spin-slow-star{ animation: spin-slow 16s linear infinite; will-change: transform; }

          .float-icon { animation: float-y 3s ease-in-out infinite; animation-delay: var(--d, 0s); will-change: transform; }
          .particle { animation: particle-float var(--dur) ease-in-out infinite; animation-delay: var(--delay); will-change: transform, opacity; }
        `}</style>

        {/* pattern dots */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.16)_1px,transparent_0)] bg-[size:18px_18px]" />
        </div>

        {/* particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle absolute rounded-full bg-emerald-300/35"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                ["--dur" as any]: `${p.duration}s`,
                ["--delay" as any]: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/*  Layout: orbit bự hơn + căn giữa trên/dưới đều (header vẫn in-flow) */}
        <div className="relative w-full h-[100dvh] px-6 py-4 flex flex-col">
          {/* Header */}
          <div ref={headerRef} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMarks
                sizeClassName="h-16 w-16"
                textMode="inline"
                brandName="Greenpoint"
                accentSuffix="point"
                accentClassName="text-emerald-600"
              />
            </div>

            <div className="hidden xl:inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 backdrop-blur">
              <Sparkles className="h-5 w-5" />
              Nền tảng xanh & thông minh
            </div>
          </div>

          {/* Center area */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              //  BỰ HƠN (tăng/giảm 42rem tuỳ bạn)
              className="relative w-[min(32rem,92vw)]"
            >
              <div className="relative w-full aspect-square mx-auto overflow-visible">
                <div
                  className="
                    absolute inset-0 rounded-full
                    bg-white/90
                    border border-emerald-200/70
                    ring-1 ring-white/80
                    shadow-[0_28px_80px_-55px_rgba(2,6,23,0.14)]
                  "
                >
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.78)_62%,rgba(255,255,255,0.62)_100%)]" />

                  <div className="absolute inset-2.5 rounded-full border border-emerald-200/70" />
                  <div className="absolute inset-5.5 rounded-full border border-teal-200/45" />

                  <div className="absolute inset-8 rounded-full border-2 border-emerald-400/30 animate-spin-slow">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/35" />
                    <div className="absolute top-1/4 -left-2 w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-md shadow-emerald-500/25" />
                    <div className="absolute bottom-1/3 -right-1 w-3 h-3 bg-teal-500 rounded-full shadow-md shadow-teal-500/20" />
                  </div>

                  <div className="absolute inset-16 rounded-full border border-teal-400/25 animate-spin-reverse">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-teal-500 rounded-full shadow-md" />
                  </div>

                  {/* center */}
                  <div
                    className="
                      absolute inset-24 rounded-full
                      bg-white/92 backdrop-blur
                      border border-slate-200/80
                      ring-1 ring-emerald-100/90
                      shadow-[0_18px_50px_-30px_rgba(16,185,129,0.22)]
                      flex flex-col items-center justify-center p-8 text-center
                    "
                  >
                    <BrandMark textMode="stack" sizeClassName="h-16 w-16" />
                    <div className="mt-6">
                      <RotatingStat items={stats} intervalMs={2600} />
                    </div>
                    <div className="mt-4 w-20 h-px bg-emerald-200/90" />
                    <RotatingPhrase
                      phrases={circlePhrases}
                      intervalMs={2600}
                      className="mt-3 text-sm font-medium text-slate-700"
                    />
                  </div>

                  {/* floating icons */}
                  <FloatingIcon
                    className="absolute top-8 right-16 z-10"
                    icon={<Recycle className="h-5 w-5" strokeWidth={2.4} />}
                  />
                  <FloatingIcon
                    className="absolute bottom-14 left-12 z-10"
                    icon={<Truck className="h-5 w-5" strokeWidth={2.4} />}
                    delay={0.7}
                  />
                  <FloatingIcon
                    className="absolute top-14 left-10 z-10"
                    icon={<MapPin className="h-5 w-5" strokeWidth={2.4} />}
                    delay={1.2}
                  />
                  <FloatingIcon
                    className="absolute bottom-12 right-14 z-10"
                    icon={<Smartphone className="h-5 w-5" strokeWidth={2.4} />}
                    delay={1.6}
                  />

                  {/* badge */}
                  <div className="absolute inset-0 animate-spin-slow-star">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/75 rounded-full border border-emerald-300/55 flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </div>
                  </div>
                </div>

                {/* feature pills */}
                <div className="absolute inset-0 hidden xl:block pointer-events-none">
                  {[
                    {
                      icon: features[0].icon,
                      text: features[0].text,
                      pos: "left-[-32%] top-[24%]",
                    },
                    {
                      icon: features[1].icon,
                      text: features[1].text,
                      pos: "left-[-28%] top-[54%]",
                    },
                    {
                      icon: features[2].icon,
                      text: features[2].text,
                      pos: "right-[-26%] top-[62%]",
                    },
                  ].map((f) => (
                    <FeatureChip
                      key={f.text}
                      icon={f.icon}
                      text={f.text}
                      className={f.pos}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Spacer dưới = chiều cao header => cân đối trên/dưới */}
          <div aria-hidden className="shrink-0" style={{ height: headerH }} />
        </div>
      </div>
    </MotionConfig>
  );
};

export default AuthShowcase;
