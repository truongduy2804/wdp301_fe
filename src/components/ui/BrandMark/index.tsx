import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

type BrandTextMode = "none" | "inline" | "stack";

type Props = {
  sizeClassName?: string;
  showBadge?: boolean;

  textMode?: BrandTextMode;
  brandName?: string;
  tagline?: string;
  textClassName?: string;
  accentSuffix?: string; // vd: "NET"
  accentClassName?: string; // vd: "text-emerald-600"
};

const BrandMark: React.FC<Props> = ({
  sizeClassName = "h-12 w-12",
  showBadge = true,

  textMode = "none",
  brandName = "ECONET",
  tagline,
  textClassName,

  accentSuffix = "NET",
  accentClassName = "text-emerald-600",
}) => {
  const reduced = useReducedMotion();

  const endsWithAccent =
    accentSuffix &&
    brandName?.toUpperCase().endsWith(accentSuffix.toUpperCase());

  const prefix = endsWithAccent
    ? brandName.slice(0, brandName.length - accentSuffix.length)
    : brandName;

  const LogoText = (
    <div
      className={
        textClassName ??
        "text-2xl font-black text-slate-900 tracking-tight leading-none"
      }
    >
      {prefix}
      {endsWithAccent ? (
        <span className={accentClassName}>{accentSuffix}</span>
      ) : null}
    </div>
  );

  const LogoIcon = (
    <div className="relative">
      <motion.div
        className={`grid ${sizeClassName} place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600`}
        whileHover={reduced ? undefined : { scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Leaf className="h-6 w-6 text-white" strokeWidth={2} />
      </motion.div>{" "}
    </div>
  );

  if (textMode === "none") return LogoIcon;

  if (textMode === "inline") {
    return (
      <div className="flex items-center gap-3">
        {LogoIcon}
        {LogoText}
      </div>
    );
  }

  // stack
  return (
    <div className="flex flex-col items-center text-center gap-2">
      {LogoIcon}
      <div>
        {LogoText}
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
