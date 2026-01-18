// components/portal/userMenu.tsx (React Router)
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarUserImage from "@/components/ui/Avatar_User_Image";
import type { Role } from "@/lib/role";
import { ROLE_LABEL, ROLES } from "@/lib/role";

type Placement = "down" | "up";

interface UserMenuProps {
  placement?: Placement;
  className?: string;
  showNameOnMobile?: boolean;

  /** Chọn nhanh role mock nếu muốn ép (nếu không truyền sẽ tự đọc từ URL) */
  mockRole?: Role;

  /** override thông tin user mock */
  mockUser?: {
    fullname: string;
    email: string;
    avatarUrl?: string;
    role?: Role;
  };

  /** trang quay về sau logout (mock) */
  homeHref?: string;
}

/* ===== Helpers ===== */
const roleBadge = (role: Role) => {
  switch (role) {
    case "ADMIN":
      return { label: ROLE_LABEL.ADMIN, grad: "from-rose-500 to-red-600" };
    case "ENTERPRISE":
      return {
        label: ROLE_LABEL.ENTERPRISE,
        grad: "from-indigo-500 to-sky-600",
      };
    case "COLLECTOR":
      return {
        label: ROLE_LABEL.COLLECTOR,
        grad: "from-amber-500 to-orange-600",
      };
    default:
      return {
        label: ROLE_LABEL.CITIZEN,
        grad: "from-teal-500 to-emerald-600",
      };
  }
};

const shortenName = (fullName: string) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts.pop();
  const initials = parts.map((p) => p[0].toUpperCase() + ".").join(" ");
  return `${last} ${initials}`.trim();
};

/**
 * Lấy role theo URL:
 * - Hỗ trợ dạng: /vi/admin, /en/enterprise, /collector, /citizen ...
 */
function getRoleFromPathname(pathname: string, fallback?: Role): Role {
  const segs = (pathname || "/").split("/").filter(Boolean);
  const i = segs[0] === "vi" || segs[0] === "en" ? 1 : 0; // bỏ locale
  const segRole = segs[i];

  const map: Record<string, Role> = {
    admin: "ADMIN",
    enterprise: "ENTERPRISE",
    collector: "COLLECTOR",
    citizen: "CITIZEN",
  };

  if (segRole && map[segRole]) return map[segRole];
  return fallback ?? "CITIZEN";
}

/** Giữ nguyên prefix locale hiện tại cho mọi Link */
function getLocalePrefix(pathname: string) {
  const segs = (pathname || "/").split("/").filter(Boolean);
  const hasLocale = segs[0] === "vi" || segs[0] === "en";
  return hasLocale ? `/${segs[0]}` : "";
}

const DEFAULT_BY_ROLE: Record<
  Role,
  { fullname: string; email: string; role: Role; avatarUrl?: string }
> = {
  ADMIN: {
    fullname: "Nguyễn Minh Quân",
    email: "quan.admin@example.com",
    role: "ADMIN",
  },
  ENTERPRISE: {
    fullname: "Công ty Tái chế Xanh",
    email: "enterprise@example.com",
    role: "ENTERPRISE",
  },
  COLLECTOR: {
    fullname: "Trần Văn Thu Gom",
    email: "collector@example.com",
    role: "COLLECTOR",
  },
  CITIZEN: {
    fullname: "Võ Thảo My",
    email: "citizen@example.com",
    role: "CITIZEN",
  },
};

const UserMenu: React.FC<UserMenuProps> = ({
  placement = "down",
  className = "",
  showNameOnMobile = false,
  mockRole,
  mockUser,
  homeHref = "/",
}) => {
  const { pathname } = useLocation();
  const localePrefix = getLocalePrefix(pathname);
  const role = getRoleFromPathname(pathname, mockRole);

  // user mock (không dùng redux)
  const user = {
    ...(DEFAULT_BY_ROLE[role] ?? DEFAULT_BY_ROLE.CITIZEN),
    ...(mockUser ?? {}),
    role: (mockUser?.role ?? role) as Role,
  };

  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // NOTE: bạn đang dùng "/userlayout/profile" từ project cũ.
  // Nếu chưa có routes này, hãy đổi BASE thành "" hoặc "/citizen" tùy app.
  const BASE = `${localePrefix}/userlayout`;
  const portalHref = `${localePrefix}${ROLES[user.role]}`;

  const menuItems = [
    {
      icon: UserIcon,
      label: "Hồ sơ cá nhân",
      to: `${BASE}/profile`,
      color: "text-gray-700",
      hoverColor: "hover:bg-blue-50 hover:text-blue-600",
      iconBg: "group-hover:bg-blue-100",
    },
  ];

  // đóng khi click ngoài/ ESC
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !popRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // đóng khi đổi route
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setOpen(false);
    setIsLoggingOut(true);
    await new Promise((r) => setTimeout(r, 700));
    window.location.replace(homeHref);
  };

  const { label: roleText, grad } = roleBadge(user.role);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={btnRef}
        onClick={() => !isLoggingOut && setOpen((o) => !o)}
        className={`group relative flex items-center gap-2.5 rounded-full bg-white px-3 py-1.5 overflow-hidden transition-all duration-300
        ${isLoggingOut ? "cursor-wait opacity-90" : "hover:shadow-md"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={isLoggingOut}
        disabled={isLoggingOut}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#14b8a6,#10b981,#22c55e)_border-box]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-emerald-500/50
          group-hover:ring-transparent transition"
        />
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <AvatarUserImage
              name={user.fullname}
              size={36}
              ringClassName="ring-2 ring-white"
            />
            {!isLoggingOut && (
              <span className="absolute -bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            )}
            {isLoggingOut && (
              <span className="pointer-events-none absolute inset-[-3px] rounded-full border-2 border-transparent border-t-sky-500 animate-spin" />
            )}
            {!isLoggingOut && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  open ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }
                }
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-400" />
              </motion.div>
            )}
          </div>

          {/* Tên ngắn gọn */}
          <span
            className={`${
              showNameOnMobile ? "" : "hidden md:block"
            } text-[15px] font-medium max-w-[180px] truncate ${
              isLoggingOut ? "text-blue-500" : "text-gray-700"
            }`}
            title={user.fullname}
          >
            {isLoggingOut ? "Đang đăng xuất…" : shortenName(user.fullname)}
          </span>

          {!isLoggingOut && (
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && !isLoggingOut && (
          <>
            {placement === "down" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              />
            )}

            <motion.div
              ref={popRef}
              role="menu"
              initial={{
                opacity: 0,
                scale: 0.95,
                y: placement === "up" ? 10 : -10,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: placement === "up" ? 10 : -10,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              className={`absolute right-0 ${
                placement === "up" ? "bottom-full mb-3" : "mt-3"
              } w-[248px] rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden`}
            >
              {/* Header */}
              <div className="relative px-6 py-3 bg-linear-to-br from-sky-50 via-purple-50 to-pink-50 border-b border-gray-100">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="relative">
                  <p className="text-base font-semibold text-gray-900 mb-0.5">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-gray-600 truncate mb-2">
                    {user.email}
                  </p>
                  <motion.span
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    className={`inline-flex items-center gap-1.5 rounded-full bg-linear-to-r ${grad} text-white text-[10px] px-2 py-1 shadow-sm uppercase tracking-wide`}
                    title={ROLE_LABEL[user.role]}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {roleText}
                  </motion.span>
                </div>
              </div>

              {/* Items */}
              <nav className="py-1.5 px-2">
                {/* Link về đúng portal role */}
                <Link
                  to={portalHref}
                  className="group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 transition-colors duration-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <span>Vào portal</span>
                </Link>

                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 * idx,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <Link
                      to={item.to}
                      className={`group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${item.color} ${item.hoverColor}`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 ${item.iconBg} transition-colors duration-200`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="ml-auto"
                      >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mx-4 border-t border-gray-100" />

              {/* Logout (mock) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-2 py-1.5"
              >
                <motion.button
                  onClick={handleLogout}
                  initial="rest"
                  whileHover="hover"
                  className="group w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-50 group-hover:bg-red-100 transition-colors duration-200">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Đăng xuất</span>
                  <motion.div
                    className="ml-auto"
                    variants={{
                      rest: { x: 0, opacity: 0.7 },
                      hover: { x: 6, opacity: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default UserMenu;
