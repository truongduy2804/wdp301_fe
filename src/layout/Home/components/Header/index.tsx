// Header.tsx
import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Menu,
  X,
  Home,
  HelpCircle,
  Phone,
  MapPin,
  Recycle,
  Truck,
  Factory,
  Sparkles,
  UserPlus,
  User,
  Building2,
} from "lucide-react";

import endPoint from "@/router/endPoint";
import UserMenu from "@/layout/Dashboard/components/Header/UserMenu";

import type { MockUser, MockRole } from "@/lib/mockAuthApi";
import {
  mockFetchSession,
  mockLoginCitizen,
  mockUpgradeToEnterprise,
} from "@/lib/mockAuthApi";

/* ======================= Types ======================= */
interface HeaderProps {
  variant?: "site" | "auth";
}

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

/* ======================= Brand ======================= */
const Brand: React.FC = () => (
  <Link
    to={endPoint.HOMEPAGE}
    className="flex items-center gap-3 group select-none"
    aria-label="ECONET"
  >
    <div className="relative">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-lime-600 shadow-sm ring-1 ring-emerald-200/40">
        <Recycle className="h-5 w-5 text-white" />
      </div>
      <div className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow ring-1 ring-slate-200">
        <Sparkles className="h-3 w-3 text-emerald-600" />
      </div>
    </div>

    <div className="leading-tight">
      <div className="text-[17px] font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
        ECONET
      </div>
      <div className="hidden sm:block text-[11px] text-slate-600">
        Kết nối thu gom • tái chế • theo khu vực
      </div>
    </div>
  </Link>
);

/* ======================= Data ======================= */
const navItems: NavItem[] = [
  { label: "Trang chủ", to: endPoint.HOMEPAGE, icon: Home },
  { label: "Liên hệ", to: "/contact", icon: Phone },
];

const legalItems: NavItem[] = [
  { label: "Chính sách bảo mật", to: "/privacy", icon: Building2 },
  { label: "Điều khoản dịch vụ", to: "/terms", icon: Building2 },
];

/* ======================= Utils ======================= */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as any);
    };
  }, []);
  return reduced;
}

/* =================== Desktop SiteNav =================== */
const SiteNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReduced = usePrefersReducedMotion();

  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const openSoon = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setMoreOpen(true);
  };
  const closeSoon = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setMoreOpen(false), 120);
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!moreOpen) return;
      const t = e.target as Node;
      if (!moreWrapRef.current?.contains(t)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  const activeIndex = useMemo(() => {
    const path = location.pathname;
    const idx = navItems.findIndex((n) => {
      if (n.to === "/") return path === "/";
      return path === n.to || path.startsWith(n.to + "/");
    });
    return idx === -1 ? 0 : idx;
  }, [location.pathname]);

  const isLegalRoute = useMemo(() => {
    const path = location.pathname;
    return legalItems.some((l) => path === l.to || path.startsWith(l.to + "/"));
  }, [location.pathname]);

  const isKhacActive = isLegalRoute && !moreOpen;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(0);
  const h = useMotionValue(0);

  const measureRect = (el: HTMLElement | null) => {
    const wrap = containerRef.current;
    if (!el || !wrap) return { tx: 0, ty: 0, tw: 0, th: 0 };
    const a = el.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    return {
      tx: Math.round(a.left - b.left),
      ty: Math.round(a.top - b.top),
      tw: Math.round(a.width),
      th: Math.round(a.height),
    };
  };

  const measureByIndex = (index: number) =>
    measureRect(itemRefs.current[index]);
  const measureMoreBtn = () => measureRect(moreBtnRef.current);

  useLayoutEffect(() => {
    const { tx, ty, tw, th } = isKhacActive
      ? measureMoreBtn()
      : measureByIndex(activeIndex);
    x.set(tx);
    y.set(ty);
    w.set(tw);
    h.set(th);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pending, setPending] = useState<{ index: number; to: string } | null>(
    null,
  );
  const displayIndex = pending?.index ?? activeIndex;

  useEffect(() => {
    if (pending && activeIndex === pending.index) setPending(null);
  }, [activeIndex, pending]);

  useEffect(() => {
    const onResize = () => {
      const { tx, ty, tw, th } = isKhacActive
        ? measureMoreBtn()
        : measureByIndex(displayIndex);
      x.set(tx);
      y.set(ty);
      w.set(tw);
      h.set(th);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [displayIndex, isKhacActive, x, y, w, h]);

  useLayoutEffect(() => {
    if (pending) return;
    const { tx, ty, tw, th } = isKhacActive
      ? measureMoreBtn()
      : measureByIndex(activeIndex);
    x.set(tx);
    y.set(ty);
    w.set(tw);
    h.set(th);
  }, [activeIndex, pending, isKhacActive, x, y, w, h]);

  const animateTo = (
    rect: { tx: number; ty: number; tw: number; th: number },
    onDone?: () => void,
  ) => {
    const opt = prefersReduced
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 140, damping: 24, mass: 1.05 };
    const a1 = animate(x, rect.tx, opt as any);
    const a2 = animate(y, rect.ty, opt as any);
    const a3 = animate(w, rect.tw, opt as any);
    const a4 = animate(h, rect.th, opt as any);
    Promise.all([a1.finished, a2.finished, a3.finished, a4.finished]).then(() =>
      onDone?.(),
    );
  };

  const onItemClick = (e: React.MouseEvent, index: number, to: string) => {
    if (index === activeIndex) return;
    e.preventDefault();
    if (prefersReduced) return navigate(to);
    const rect = measureByIndex(index);
    setPending({ index, to });
    animateTo(rect, () => navigate(to));
  };

  return (
    <div
      ref={containerRef}
      className="hidden lg:flex items-center gap-1 relative rounded-2xl bg-white/90 ring-1 ring-slate-200 p-1 shadow-sm"
      style={{ isolation: "isolate" }}
    >
      <motion.span
        className={`absolute top-0 left-0 rounded-xl pointer-events-none overflow-hidden transition-opacity duration-150 ${isLegalRoute && moreOpen ? "opacity-0" : "opacity-100"
          }`}
        style={{ x, y, width: w, height: h }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-lime-500/10" />
        <div className="absolute inset-0 ring-1 ring-emerald-400/20 rounded-xl" />
      </motion.span>

      {navItems.map((item, i) => {
        const isActive = !isLegalRoute && i === activeIndex;
        const inner = (
          <div
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={[
              "relative group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[14px] transition-colors",
              isActive
                ? "text-emerald-800"
                : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50",
            ].join(" ")}
            onClick={(e) => onItemClick(e, i, item.to)}
          >
            <item.icon
              className={[
                "w-4 h-4 shrink-0 transition-transform",
                isActive
                  ? "scale-110 text-emerald-700"
                  : "group-hover:scale-110",
              ].join(" ")}
            />
            <span className={isActive ? "font-semibold" : "font-medium"}>
              {item.label}
            </span>
          </div>
        );
        return (
          <NavLink key={item.to} to={item.to} className="rounded-xl">
            {inner}
          </NavLink>
        );
      })}

      {/* Legal dropdown */}
      <div
        className="relative"
        ref={moreWrapRef}
        onMouseEnter={openSoon}
        onMouseLeave={closeSoon}
      >
        <button
          ref={moreBtnRef}
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-current={isKhacActive ? "page" : undefined}
          className={[
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[14px] transition-colors",
            isKhacActive
              ? "text-emerald-800"
              : isLegalRoute && moreOpen
                ? "text-slate-700"
                : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50",
          ].join(" ")}
        >
          <span className="font-medium">Pháp lý</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {moreOpen && (
            <motion.div
              onMouseEnter={openSoon}
              onMouseLeave={closeSoon}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden"
              role="menu"
            >
              <nav className="p-1 space-y-0.5">
                {legalItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                        isActive
                          ? "text-emerald-800 bg-emerald-50"
                          : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50",
                      ].join(" ")
                    }
                    onClick={() => setMoreOpen(false)}
                  >
                    <item.icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* =================== Mobile Nav =================== */
const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  user: MockUser | null;
  onUpgradeEnterprise: () => void;
}> = ({ isOpen, onClose, isLoggedIn, user, onUpgradeEnterprise }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isCitizen = user?.role === "CITIZEN";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 lg:hidden bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            className="fixed right-0 top-0 h-full w-[78vw] max-w-[360px] z-[60] bg-white shadow-2xl flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Brand />
              <button
                className="p-2 rounded-xl hover:bg-slate-100 transition"
                onClick={onClose}
                aria-label="Đóng"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto">
              <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-slate-500">
                Khám phá
              </div>

              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "block rounded-2xl",
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
                    ].join(" ")
                  }
                >
                  <div className="flex items-center gap-3 p-3 rounded-2xl font-semibold transition">
                    <item.icon className="w-5 h-5" />
                    <span className="text-[15px]">{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-slate-100 space-y-3">
              {/* ✅ ONLY show enterprise register when logged in */}
              {isLoggedIn && isCitizen && (
                <button
                  type="button"
                  onClick={() => {
                    onUpgradeEnterprise();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 transition"
                >
                  <Building2 className="w-4 h-4" />
                  Đăng ký doanh nghiệp (demo)
                </button>
              )}

              {/* ✅ after login -> show UserMenu (replace login/register) */}
              {isLoggedIn ? (
                <div className="flex justify-end">
                  <UserMenu
                    placement="up"
                    showNameOnMobile
                    homeHref={endPoint.HOMEPAGE}
                  />
                </div>
              ) : (
                <>
                  <Link
                    to={endPoint.REGISTER}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Đăng ký
                  </Link>

                  <Link
                    to={endPoint.LOGIN}
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 text-white font-semibold shadow-md hover:brightness-95 transition"
                  >
                    <User className="w-4 h-4" />
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* =================== Header Wrapper =================== */
const HeaderComponent: React.FC<HeaderProps> = ({ variant = "site" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  // ✅ session mock state
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const isLoggedIn = !!user;
  const role = (user?.role ?? "CITIZEN") as MockRole;

  // ✅ mock fetch session on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      setSessionLoading(true);
      const res = await mockFetchSession();
      if (!alive) return;
      setUser(res.user);
      setSessionLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 2);
    if (variant === "site") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches =
        "matches" in e ? e.matches : (e as MediaQueryList).matches;
      if (matches) setIsMobileNavOpen(false);
    };
    onChange(mq);
    if (mq.addEventListener) mq.addEventListener("change", onChange as any);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener)
        mq.removeEventListener("change", onChange as any);
      else mq.removeListener(onChange as any);
    };
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  // demo: click to login quickly (optional)
  const loginDemo = async () => {
    setSessionLoading(true);
    const res = await mockLoginCitizen();
    setUser(res.user);
    setSessionLoading(false);
  };

  const upgradeEnterpriseDemo = async () => {
    if (!user || upgradeLoading) return;
    setUpgradeLoading(true);
    try {
      const upgraded = await mockUpgradeToEnterprise();
      setUser(upgraded);
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (variant === "auth") {
    return (
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Brand />
          <Link
            to={endPoint.HOMEPAGE}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
        </div>
      </header>
    );
  }

  const isCitizen = role === "CITIZEN";

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : "bg-white/85 backdrop-blur-sm border-b border-slate-100",
        ].join(" ")}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <Brand />

          <div className="flex-1 flex justify-center">
            <SiteNav />
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-2">
            {sessionLoading ? (
              <div className="h-10 w-[180px] rounded-2xl bg-slate-100 animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {/* ✅ ONLY show enterprise register when logged in */}
                {isCitizen && (
                  <button
                    type="button"
                    onClick={upgradeEnterpriseDemo}
                    disabled={upgradeLoading}
                    className={[
                      "flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-semibold transition",
                      upgradeLoading
                        ? "border-slate-200 bg-slate-50 text-slate-400 cursor-wait"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                    ].join(" ")}
                  >
                    <Building2 className="w-4 h-4" />
                    {upgradeLoading ? "Đang xử lý..." : "Đăng ký doanh nghiệp"}
                  </button>
                )}

                {/* ✅ Replace login/register with your existing UserMenu */}
                <UserMenu homeHref={endPoint.HOMEPAGE} />
              </>
            ) : (
              <>
                <Link
                  to={endPoint.REGISTER}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Đăng ký
                </Link>

                <Link
                  to={endPoint.LOGIN}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 text-white text-sm font-semibold shadow-md hover:brightness-95 transition"
                >
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Link>

                {/* optional demo button */}
                <button
                  type="button"
                  onClick={loginDemo}
                  className="hidden lg:inline text-xs text-slate-400 hover:text-emerald-700 transition underline underline-offset-4"
                >
                  (Demo) login
                </button>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-2xl hover:bg-slate-100 transition"
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isLoggedIn={isLoggedIn}
        user={user}
        onUpgradeEnterprise={upgradeEnterpriseDemo}
      />
    </>
  );
};

const Header = memo(HeaderComponent);
export default Header;
