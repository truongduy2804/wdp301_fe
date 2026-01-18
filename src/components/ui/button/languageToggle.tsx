// components/ui/button/LanguageToggle.tsx (React + React Router)
import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@mui/material";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { type Locale, pickLocaleFromPath, localizePath } from "@/lib/i18n";

export default function LanguageToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const pathname = location.pathname || "/";
  const search = location.search || "";

  const current = useMemo(
    () => (pickLocaleFromPath(pathname) ?? "vi") as Locale,
    [pathname],
  );

  const target: Locale = current === "vi" ? "en" : "vi";

  // Hiện toast sau khi đổi ngôn ngữ thật (giữ logic cũ)
  useEffect(() => {
    const lastLocale = localStorage.getItem("lastLocale");
    if (lastLocale && lastLocale !== current) {
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

    const nextPath = localizePath(pathname, target);
    const url = `${nextPath}${search}`;

    document.cookie = `locale=${target};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.setAttribute("lang", target);
    localStorage.setItem("lastLocale", current);

    navigate(url);

    // nếu muốn spinner chỉ chạy ngắn (vì react-router navigate rất nhanh)
    // bạn có thể auto reset:
    setTimeout(() => setLoading(false), 350);
  };

  const tooltipTitle =
    current === "vi"
      ? "Chuyển ngôn ngữ sang tiếng Anh"
      : "Switch to Vietnamese language";

  // Hiện cờ và chữ của NGÔN NGỮ SẮP CHUYỂN ĐẾN
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
        aria-label="Switch language"
        type="button"
      >
        {loading ? (
          <Loader2 className={`w-4 h-4 animate-spin ${loaderColor}`} />
        ) : (
          <>
            {/* React: dùng img thay next/image */}
            <img
              src={flagSrc}
              alt={target === "vi" ? "Vietnam Flag" : "UK Flag"}
              width={20}
              height={20}
              className="object-cover"
              loading="eager"
            />
            <span>{label}</span>
          </>
        )}
      </button>
    </Tooltip>
  );
}
