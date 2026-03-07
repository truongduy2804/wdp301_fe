import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type BrandTextMode = "none" | "inline" | "stack";

type Props = {
  sizeClassName?: string;
  showBadge?: boolean;

  textMode?: BrandTextMode;
  brandName?: string;
  tagline?: string;
  textClassName?: string;
  accentSuffix?: string;
  accentClassName?: string;
};

const BrandMark: React.FC<Props> = ({
  sizeClassName = "h-16 w-16",
  showBadge = true,

  textMode = "none",
  brandName = "ECONET",
  tagline,
  textClassName = "text-3xl font-black leading-none text-slate-900",

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
    <div className="flex flex-col">
      <div className={textClassName}>
        {prefix}
        {endsWithAccent ? (
          <span className={accentClassName}>{accentSuffix}</span>
        ) : null}
      </div>

      {tagline ? (
        <div className="mt-1 text-xs font-medium tracking-wide text-slate-500">
          {tagline}
        </div>
      ) : null}
    </div>
  );

  const LogoIcon = (
    <motion.div
      className="relative shrink-0"
      whileHover={reduced ? undefined : { scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <img
        src="/image/logo.jpg"
        alt="ECONET Logo"
        className={`${sizeClassName} object-contain`}
      />
    </motion.div>
  );

  if (textMode === "none") return LogoIcon;

  if (textMode === "inline") {
    return (
      <div className="flex items-center gap-2">
        {LogoIcon}
        {LogoText}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-2">
      {LogoIcon}
      {LogoText}
    </div>
  );
};

export default BrandMark;
