// components/ui/button/LanguageToggle.tsx
import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@mui/material";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLocale, setLocale, type Locale } from "@/lib/i18n";

export default function LanguageToggle() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const current = useLocale();
  const target: Locale = current === "vi" ? "en" : "vi";

  useEffect(() => {
    const last = localStorage.getItem("lastLocale");
    if (last && last !== current) {
      toast.success(
        current === "vi"
          ? "Switched to Vietnamese Language"
          : "Đã chuyển ngôn ngữ sang Tiếng Anh",
        { duration: 3000 },
      );
      localStorage.removeItem("lastLocale");
    }
  }, [current]);

  const onSwitch = () => {
    if (loading) return;
    setLoading(true);

    localStorage.setItem("lastLocale", current);
    setLocale(target);

    // giữ cảm giác mượt
    setTimeout(() => setLoading(false), 250);
  };

  const tooltipTitle =
    current === "vi"
      ? "Chuyển ngôn ngữ sang tiếng Anh"
      : "Switch to Vietnamese language";

  const flagSrc = target === "vi" ? "/flags/vi.svg" : "/flags/en.svg";
  const label = target.toUpperCase();
  const hoverBorder =
    target === "vi" ? "hover:border-rose-300" : "hover:border-blue-300";
  const loaderColor = target === "vi" ? "text-red-500" : "text-blue-500";

  return (
    <Tooltip title={tooltipTitle} arrow>
      <button
        onClick={onSwitch}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-1.5
          h-9 px-3 rounded-lg border text-sm font-semibold
          border-slate-200 bg-white
          hover:shadow-sm ${hoverBorder}
          transition-all duration-200 ease-out mr-2
          ${loading ? "cursor-wait opacity-70" : ""}
        `}
        type="button"
      >
        {loading ? (
          <Loader2 className={`w-4 h-4 animate-spin ${loaderColor}`} />
        ) : (
          <>
            <img
              src={flagSrc}
              alt={label}
              width={20}
              height={20}
              className="object-cover"
            />
            <span>{label}</span>
          </>
        )}
      </button>
    </Tooltip>
  );
}
