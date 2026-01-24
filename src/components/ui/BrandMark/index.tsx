import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Recycle, Sparkles } from "lucide-react";

type BrandTextMode = "none" | "inline" | "stack";

type Props = {
  sizeClassName?: string; // vd: "h-14 w-14"
  showBadge?: boolean;

  // ✅ brand text options
  textMode?: BrandTextMode; // none | inline (nằm ngang) | stack (nằm dưới)
  brandName?: string; // default ECONET
  tagline?: string; // optional, chỉ dùng khi stack
  textClassName?: string; // custom style cho chữ
};

const BrandMark: React.FC<Props> = ({
  sizeClassName = "h-14 w-14",
  showBadge = true,

  textMode = "none",
  brandName = "ECONET",
  tagline,
  textClassName,
}) => {
  const reduced = useReducedMotion();

  const LogoIcon = (
    <div className="relative">
      <motion.div
        className={`grid ${sizeClassName} place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-lg`}
        whileHover={reduced ? undefined : { scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Recycle className="h-6 w-6 text-white" strokeWidth={2.5} />
      </motion.div>

      {showBadge && (
        <motion.div
          className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow-md ring-2 ring-emerald-100"
          animate={
            reduced ? undefined : { scale: [1, 1.15, 1], rotate: [0, 180, 360] }
          }
          transition={
            reduced
              ? undefined
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Sparkles className="h-3 w-3 text-emerald-600" />
        </motion.div>
      )}
    </div>
  );

  if (textMode === "none") {
    return LogoIcon;
  }

  if (textMode === "inline") {
    return (
      <div className="flex items-center gap-3">
        {LogoIcon}
        <div
          className={
            textClassName ??
            "text-xl font-black text-slate-800 tracking-tight leading-none"
          }
        >
          {brandName}
        </div>
      </div>
    );
  }

  // textMode === "stack"
  return (
    <div className="flex flex-col items-center text-center gap-2">
      {LogoIcon}
      <div>
        <div
          className={
            textClassName ??
            "text-xl font-black text-slate-800 tracking-tight leading-none"
          }
        >
          {brandName}
        </div>
        {tagline ? (
          <div className="mt-1 text-xs font-medium text-slate-500">
            {tagline}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BrandMark;
