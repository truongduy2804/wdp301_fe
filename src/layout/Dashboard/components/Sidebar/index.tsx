// components/portal/Sidebar.tsx (React Router)
import { Link, useLocation } from "react-router-dom";
import {
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { ChevronDown, MapPin, X, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import { createPortal } from "react-dom";
import BrandMark from "@/components/ui/BrandMark";
import { buildMenu } from "../Menu";
import type { Role } from "@/lib/role";
import { ROLES } from "@/lib/role";
import { DEFAULT_LOCALE } from "@/lib/i18n";

/* ===== Theme (GREEN / WHITE) ===== */
const UI = {
  activeBg: "bg-emerald-50 text-emerald-800 shadow-sm rounded-l-none",
  idleText: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  indicatorBar: "bg-linear-to-b from-emerald-400 via-emerald-500 to-teal-500",
  iconActive: "text-emerald-600 scale-110",
  iconIdle: "text-slate-400 group-hover:text-emerald-600 group-hover:scale-105",
  dotActive: "bg-emerald-600 scale-125",
  dotIdle: "bg-slate-300 group-hover:bg-emerald-500 group-hover:scale-110",
  groupOpen: "bg-emerald-50/60 text-emerald-700",
  groupActiveCollapsed:
    "bg-linear-to-r from-emerald-50 via-transparent to-emerald-50 text-emerald-800 shadow-sm",
  groupIdle: "text-slate-500 hover:text-emerald-700 hover:bg-slate-50/80",
  branchBtn:
    "border border-slate-200 bg-white text-slate-700 hover:bg-linear-to-r hover:from-emerald-50 hover:to-transparent hover:border-emerald-300 hover:shadow-sm",
  branchIcon: "text-emerald-600",
  toggleBtn:
    "bg-white border border-slate-200 text-slate-400 shadow-md hover:shadow-xl hover:text-emerald-700 hover:border-emerald-300 hover:scale-110 active:scale-95",
  footerTitle: "text-slate-600",
  footerSub: "text-slate-400",
};

/* ===== Types ===== */
type FlatItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};
type GroupItem = {
  group: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  items: FlatItem[];
};
type AnyItem = FlatItem | GroupItem;
const isGroup = (x: AnyItem): x is GroupItem =>
  Array.isArray((x as any)?.items);

/* ===== Helpers ===== */
const stripTrailing = (p: string) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
const isSamePath = (a: string, b: string) =>
  stripTrailing(a) === stripTrailing(b);

/** ✅ bỏ /vi|/en khỏi path (nếu lỡ còn) */
const stripLocalePrefix = (p?: string) => {
  const s = typeof p === "string" && p.length ? p : "/";
  return s.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
};

const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : `/${p}`);

/** Lấy locale từ cookie/localStorage (URL không còn /vi/en) */
function getLocaleNoPath(): "vi" | "en" {
  const fromStorage = (localStorage.getItem("locale") || "") as "vi" | "en";
  if (fromStorage === "vi" || fromStorage === "en") return fromStorage;

  const m = document.cookie.match(/(?:^|;\s*)locale=(vi|en)/);
  if (m?.[1] === "vi" || m?.[1] === "en") return m[1];

  // fallback i18n default
  return (DEFAULT_LOCALE as "vi" | "en") ?? "vi";
}

/** Resolve href thành absolute path sạch locale */
function resolveHref(rawHref: string, roleRootRaw: string) {
  const baseRoot = stripTrailing(stripLocalePrefix(roleRootRaw || "/"));
  let h = stripLocalePrefix(rawHref || "");

  // nếu empty => về root theo role
  if (!h || h === "/") return ensureLeadingSlash(baseRoot || "/");

  // nếu relative => join với baseRoot
  if (!h.startsWith("/")) {
    h = `${baseRoot}/${h}`.replace(/\/+/g, "/");
  }

  return ensureLeadingSlash(h);
}

/* ===== NavLink ===== */
function NavLink({
  href,
  label,
  Icon,
  active,
  depth = 0,
  collapsed,
}: {
  href: string;
  label: string;
  Icon?: LucideIcon;
  active: boolean;
  depth?: number;
  collapsed?: boolean;
}) {
  const basePadY = collapsed ? "py-2.5" : "py-2.5 lg:py-3";
  const baseText = "text-lg lg:text-[16px]";

  const core = (
    <Link
      to={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 ${basePadY} ${baseText} font-medium transition-all duration-300 ease-out
        ${active ? UI.activeBg : UI.idleText}`}
      style={{
        paddingLeft: collapsed ? 12 : 12 + depth * 18,
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      title={!collapsed ? undefined : label}
    >
      {/* Active indicator bar */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-full w-0.5 ${UI.indicatorBar} transition-all duration-300 ease-out ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-y-50"
        }`}
      />

      {Icon ? (
        <Icon
          size={18}
          className={`shrink-0 transition-all duration-300 ease-out ${
            active ? UI.iconActive : UI.iconIdle
          }`}
          strokeWidth={active ? 2.5 : 2}
        />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-300 ease-out ${
            active ? UI.dotActive : UI.dotIdle
          }`}
        />
      )}

      {!collapsed && (
        <span
          className={`truncate transition-all duration-300 ease-out ${
            active ? "font-semibold translate-x-0.5" : "font-medium"
          }`}
        >
          {label}
        </span>
      )}
    </Link>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right" arrow enterDelay={150}>
      <span className="block">{core}</span>
    </Tooltip>
  ) : (
    core
  );
}

/* ===== Flyout via Portal ===== */
function Flyout({
  open,
  anchorRect,
  title,
  Icon,
  items,
  makeHref,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean;
  anchorRect: DOMRect | null;
  title: string;
  Icon?: LucideIcon;
  items: FlatItem[];
  makeHref: (p: string) => string;
  isActive: (p: string) => boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, arrowTop: 12 });

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchorRect) return;

    const GAP_X = 6;
    const PAD = 12;

    const measure = () => {
      const flyH = panelRef.current?.offsetHeight ?? 0;
      const left = anchorRect.right + GAP_X;

      let top = anchorRect.top + anchorRect.height / 2 - flyH / 2;
      top = Math.max(PAD, Math.min(top, window.innerHeight - PAD - flyH));

      const anchorCenter = anchorRect.top + anchorRect.height / 2;
      let arrowTop = anchorCenter - top;
      arrowTop = Math.max(12, Math.min(arrowTop, Math.max(12, flyH - 12)));

      setPos({ top, left, arrowTop });
    };

    const raf = requestAnimationFrame(measure);
    const onResize = () => requestAnimationFrame(measure);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, anchorRect, items.length]);

  if (!mounted || !open || !anchorRect) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[1200] w-72 max-h-[80vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xl p-2 animate-in fade-in slide-in-from-left-2"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        className="pointer-events-none absolute -left-1.5
                   border-y-[6px] border-y-transparent border-r-[6px] border-r-white"
        style={{ top: pos.arrowTop }}
      />

      <div className="px-2 py-2 text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        {Icon ? <Icon size={14} className="text-slate-400" /> : null}
        {title}
      </div>

      <div className="space-y-0.5 mt-1">
        {items.map((it) => (
          <NavLink
            key={it.href}
            href={makeHref(it.href)}
            label={it.label}
            Icon={it.icon}
            active={isActive(it.href)}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}

/* ===== Group ===== */
function Group({
  title,
  Icon,
  children,
  defaultOpen,
  collapsed,
  hasActive = false,
  itemsForFlyout,
  onCollapsedHover,
  onCollapsedLeave,
}: {
  title: string;
  Icon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsed?: boolean;
  hasActive?: boolean;
  itemsForFlyout?: FlatItem[];
  onCollapsedHover?: (rect: DOMRect) => void;
  onCollapsedLeave?: () => void;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (collapsed) setOpen(false);
    else if (defaultOpen) setOpen(true);
  }, [collapsed, defaultOpen]);

  const accent = open || hasActive;

  return (
    <div className="mb-1">
      <button
        ref={btnRef}
        type="button"
        title={title}
        onClick={() => !collapsed && setOpen((v) => !v)}
        onMouseEnter={() => {
          if (collapsed && itemsForFlyout?.length && btnRef.current) {
            onCollapsedHover?.(btnRef.current.getBoundingClientRect());
          }
        }}
        onMouseLeave={() => {
          if (collapsed) onCollapsedLeave?.();
        }}
        className={`relative w-full flex items-center justify-between px-3 py-2.5 lg:py-3 rounded-r-lg 
          text-[11px] lg:text-[12px] font-semibold uppercase tracking-wider transition-all duration-300 ease-out group
          ${collapsed ? "justify-center" : ""}
          ${
            open && !collapsed
              ? UI.groupOpen
              : hasActive && collapsed
                ? UI.groupActiveCollapsed
                : UI.groupIdle
          }`}
      >
        {!collapsed ? (
          <span className="inline-flex items-center gap-2.5 transition-all duration-300 ease-out">
            {Icon && (
              <Icon
                size={16}
                strokeWidth={accent ? 2.5 : 2}
                className={`transition-all duration-300 ease-out ${
                  accent
                    ? "text-emerald-600 scale-110"
                    : "text-slate-400 group-hover:text-emerald-600 group-hover:scale-105"
                }`}
              />
            )}
            <span className={`${accent ? "text-emerald-700" : ""}`}>
              {title}
            </span>
          </span>
        ) : (
          Icon && (
            <span className="relative">
              <Icon
                size={18}
                strokeWidth={hasActive ? 2.5 : 2}
                className={`transition-all duration-300 ease-out ${
                  hasActive
                    ? "text-emerald-600 scale-110"
                    : "text-slate-400 group-hover:text-emerald-600 group-hover:scale-105"
                }`}
              />
            </span>
          )
        )}

        {!collapsed && (
          <span
            className={`transition-transform duration-500 ease-out ${
              open ? "rotate-180" : ""
            }`}
          >
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`${
                accent
                  ? "text-emerald-600"
                  : "text-slate-400 group-hover:text-emerald-600"
              }`}
            />
          </span>
        )}
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          open && !collapsed
            ? "grid-rows-[1fr] opacity-100 mt-1"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Main Sidebar ===== */
export default function Sidebar({
  role,
  version = "v1.0.0",
  branches,
  initialBranch,
}: {
  role: Role;
  version?: string;
  branches?: string[];
  initialBranch?: string;
}) {
  const { pathname } = useLocation();

  const roleRootRaw = ROLES[role] || "/";

  // ✅ URL không dùng locale nữa, nhưng vẫn có thể dùng locale để đổi label menu
  const locale = useMemo(() => getLocaleNoPath(), []);

  const items = useMemo(
    () => buildMenu(role, locale) as AnyItem[],
    [role, locale],
  );

  const normalizeForCompare = (p?: string) =>
    stripTrailing(stripLocalePrefix(p));

  const isActive = (href: string) => {
    const target = normalizeForCompare(resolveHref(href, roleRootRaw));
    const current = normalizeForCompare(pathname);

    const root = normalizeForCompare(roleRootRaw);
    if (target === root) return isSamePath(current, target);

    return isSamePath(current, target) || current.startsWith(target + "/");
  };

  // ✅ Link luôn sạch: /enterprise/... (không /vi /en)
  const makeHref = (p: string) => resolveHref(p, roleRootRaw);

  const [branch, setBranch] = useState(
    initialBranch || branches?.[0] || "Khu vực Quận 1",
  );
  const [branchOpen, setBranchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const [topScrolled, setTopScrolled] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setTopScrolled(el.scrollTop > 0);
        ticking = false;
      });
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Flyout state
  const [fly, setFly] = useState<{
    open: boolean;
    rect: DOMRect | null;
    title: string;
    icon?: LucideIcon;
    items: FlatItem[];
  }>({ open: false, rect: null, title: "", items: [] });

  const closeTimer = useRef<number | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(
      () => setFly((f) => ({ ...f, open: false })),
      120,
    );
  };

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener("portal:sidebar-open", open);
    return () => window.removeEventListener("portal:sidebar-open", open);
  }, []);

  const mobileWidth = collapsed ? "w-20" : "w-70"; // rộng hơn trên mobile
  const desktopWidth = collapsed ? "lg:w-19" : "lg:w-65"; // desktop giữ nguyên

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="relative h-16 flex items-center justify-start lg:justify-center px-4 pl-5 lg:pl-0">
        {/* Full logo */}
        <div
          className={`absolute inset-0 flex items-center justify-start lg:justify-center
    pl-5 sm:pl-0 pt-1 transition-all duration-500 ease-out ${
      collapsed
        ? "opacity-0 scale-90 pointer-events-none"
        : "opacity-100 scale-100 delay-100"
    }`}
        >
          <BrandMark
            textMode="inline"
            brandName="ECONET"
            accentSuffix="NET"
            accentClassName="text-emerald-600"
          />
        </div>

        {/* Icon-only */}
        <div
          className={`absolute inset-0 flex items-center justify-start lg:justify-center
    pl-6 sm:pl-0 transition-all duration-500 ease-out ${
      collapsed
        ? "opacity-100 scale-100 -translate-x-1.5 delay-100"
        : "opacity-0 scale-90 pointer-events-none"
    }`}
        >
          <BrandMark
            sizeClassName="h-10 w-10 lg:h-11 lg:w-11"
            textMode="none"
            showBadge={false}
          />
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-80 pointer-events-auto
         w-8 h-8 rounded-full items-center justify-center
         ${UI.toggleBtn}
         transition-all duration-300 ease-out`}
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={14}
            strokeWidth={2.5}
            className={`transition-all duration-500 ease-out ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Divider */}
        <hr
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-px m-0 
          border-0 border-t border-slate-200 
          transition-opacity duration-200 
          ${topScrolled ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Branch picker */}
      {branches?.length && !collapsed ? (
        <div className="px-3 py-3">
          <div className="relative">
            <button
              onClick={() => setBranchOpen((v) => !v)}
              className={`w-full inline-flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 lg:py-3 text-sm lg:text-[14px] hover:shadow-sm transition-all duration-300 ease-out group ${UI.branchBtn}`}
              type="button"
            >
              <span className="inline-flex items-center gap-2 min-w-0">
                <MapPin
                  size={16}
                  className={`${UI.branchIcon} shrink-0 group-hover:scale-110 transition-all duration-300 ease-out`}
                  strokeWidth={2.5}
                />
                <span className="truncate font-medium">{branch}</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 group-hover:text-emerald-600 shrink-0 transition-all duration-500 ease-out ${
                  branchOpen ? "rotate-180" : "rotate-0"
                }`}
                strokeWidth={2}
              />
            </button>

            {branchOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 animate-in fade-in duration-200"
                  onClick={() => setBranchOpen(false)}
                />
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {branches.map((b, idx) => (
                      <button
                        key={b}
                        onClick={() => {
                          setBranch(b);
                          setBranchOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm lg:text-[14px] font-medium transition-all duration-200 ease-out ${
                          b === branch
                            ? "bg-linear-to-r from-emerald-50 via-emerald-50/80 to-transparent text-emerald-800"
                            : "text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-transparent hover:text-slate-900"
                        } ${idx !== branches.length - 1 ? "border-b border-slate-100" : ""}`}
                        type="button"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out ${
                              b === branch
                                ? "bg-emerald-500 scale-125"
                                : "bg-transparent"
                            }`}
                          />
                          {b}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Menu */}
      <nav
        ref={navRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 custom-scrollbar"
        onScroll={(e) =>
          setTopScrolled((e.currentTarget as HTMLDivElement).scrollTop > 0)
        }
      >
        <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
          {items.map((it, idx) =>
            isGroup(it) ? (
              <Group
                key={`g-${idx}`}
                title={it.group}
                Icon={it.icon}
                defaultOpen={it.defaultOpen}
                collapsed={collapsed}
                hasActive={it.items.some((sub) => isActive(sub.href))}
                itemsForFlyout={it.items}
                onCollapsedHover={(rect) => {
                  cancelClose();
                  setFly({
                    open: true,
                    rect,
                    title: it.group,
                    icon: it.icon,
                    items: it.items,
                  });
                }}
                onCollapsedLeave={scheduleClose}
              >
                {it.items.map((sub) => (
                  <NavLink
                    key={sub.href}
                    href={makeHref(sub.href)}
                    label={sub.label}
                    Icon={sub.icon}
                    active={isActive(sub.href)}
                    depth={1}
                    collapsed={collapsed}
                  />
                ))}
              </Group>
            ) : (
              <Tooltip
                key={(it as FlatItem).href || `flat-${idx}`}
                title={(it as FlatItem).label}
                placement="right"
                arrow
                enterDelay={150}
                disableHoverListener={!collapsed}
              >
                <span className="block">
                  <NavLink
                    href={makeHref((it as FlatItem).href)}
                    label={(it as FlatItem).label}
                    Icon={(it as FlatItem).icon}
                    active={isActive((it as FlatItem).href)}
                    collapsed={collapsed}
                  />
                </span>
              </Tooltip>
            ),
          )}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-slate-200 transition-all duration-500 ${
          collapsed ? "px-2 py-3" : "px-4 py-3"
        }`}
      >
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className={`text-[12px] lg:text-[13px] font-semibold uppercase tracking-wide ${UI.footerTitle}`}
              >
                Hệ thống EcoNet
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Flyout */}
      <Flyout
        open={collapsed && fly.open}
        anchorRect={fly.rect}
        title={fly.title}
        Icon={fly.icon}
        items={fly.items}
        makeHref={makeHref}
        isActive={isActive}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      />
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-70 animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}

      <aside
        className={`bg-white
    h-screen shrink-0 flex flex-col shadow-xl transition-all duration-500 ease-out border-r border-slate-200
    ${mobileWidth} ${desktopWidth}
    fixed top-0 left-0 z-80
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:sticky lg:translate-x-0 lg:z-60
  `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 ease-out z-10"
          type="button"
          aria-label="Đóng menu"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {sidebarContent}
      </aside>

      <style>{`
        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-0.5rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-from-left-2 {
          from { transform: translateX(-8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; }
        .slide-in-from-top-2 { animation-name: slide-in-from-top-2; animation-duration: 0.25s; }
        .slide-in-from-left-2 { animation-name: slide-in-from-left-2; animation-duration: 0.22s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}
