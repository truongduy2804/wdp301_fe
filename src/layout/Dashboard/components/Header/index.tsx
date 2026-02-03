import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Switch } from "antd";
import { toast } from "react-toastify";

import UserMenu from "./UserMenu";
import NotificationPanel from "./Notification/notificationPanel";

import { ACCESS_MAP, type Role } from "@/lib/role";

import {
  useGetOrderAcceptanceQuery,
  useSetOrderAcceptanceMutation,
} from "@/redux/api/enterprise/orderAcceptance";

import { useGetNotificationsQuery } from "@/redux/api/enterprise/notifications";

/* ================= Types ================= */
export type PortalRole = Role;

type Props = {
  role?: PortalRole;
  userName?: string;
  avatarUrl?: string;

  // giữ lại để không vỡ chỗ khác
  unreadCount?: number;
  notifications?: any[];
  onMenuToggle?: () => void;
  pageTitle?: string;

  showSearch?: boolean;
  onSearch?: (query: string) => void;

  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: (id: string) => void;
};

/* ================= Helpers ================= */
function stripLocalePrefix(pathname?: string): string {
  return (pathname ?? "/").replace(/^\/(vi|en)(?=\/|$)/, "");
}

function matchPrefix(path: string, prefix?: string): boolean {
  if (!prefix) return false;
  const p = prefix.replace(/\/+$/, "");
  return path === p || path.startsWith(p + "/");
}

function getRoleFromPathname(
  pathname: string,
  fallback?: PortalRole,
): PortalRole {
  const noLocale = stripLocalePrefix(pathname) || "/";

  for (const roleKey of Object.keys(ACCESS_MAP) as Role[]) {
    const prefixes = (ACCESS_MAP[roleKey] ?? []).filter(Boolean);
    for (const pref of prefixes) {
      if (matchPrefix(noLocale, pref)) return roleKey;
    }
  }
  return fallback ?? "CITIZEN";
}

/* ================= UI bits ================= */
function BouncyDots() {
  return (
    <span className="inline-flex items-end gap-1" aria-label="loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: "650ms" }}
        />
      ))}
    </span>
  );
}

/* ================= Component ================= */
export default function PortalHeader({
  role,
  userName,
  onMenuToggle,
  pageTitle,
}: Props) {
  const { pathname } = useLocation();

  const currentRole = useMemo(
    () => getRoleFromPathname(pathname, role),
    [pathname, role],
  );
  const isEnterprise = currentRole === "ENTERPRISE";

  const title = useMemo(() => {
    if (pageTitle) return pageTitle;
    if (isEnterprise) return "Bảng điều khiển doanh nghiệp";
    return userName ? `Chào, ${userName}!` : "Portal";
  }, [pageTitle, isEnterprise, userName]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showNotifications]);

  const handleMenuClick = () => {
    if (onMenuToggle) return onMenuToggle();
    window.dispatchEvent(new CustomEvent("portal:sidebar-open"));
  };

  /* ================= ENTERPRISE: Order Acceptance ================= */
  const {
    data: oaData,
    isFetching: oaFetching,
    isError: oaError,
    isUninitialized,
  } = useGetOrderAcceptanceQuery(undefined, {
    skip: !isEnterprise,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [setOrderAcceptance, { isLoading: oaSaving }] =
    useSetOrderAcceptanceMutation();

  const accepting = oaData?.data?.isAcceptingOrders ?? false;
  const busy = oaFetching || oaSaving;

  const hasServerValue = typeof oaData?.data?.isAcceptingOrders === "boolean";
  const disableSwitch =
    oaError || busy || (!hasServerValue && !isUninitialized);

  const onToggleAccepting = useCallback(
    async (checked: boolean) => {
      if (busy) return;

      try {
        await setOrderAcceptance({ isAcceptingOrders: checked }).unwrap();
        toast.success(
          checked ? "Đã bật trạng thái nhận đơn" : "Đã tắt trạng thái nhận đơn",
          { autoClose: 1200 },
        );
      } catch (e: any) {
        toast.error(e?.data?.message ?? "Cập nhật trạng thái thất bại", {
          autoClose: 1400,
        });
      }
    },
    [busy, setOrderAcceptance],
  );

  const StatusPill = (
    <span
      className={[
        "text-[11px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center justify-center min-w-[44px]",
        accepting ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {busy ? <BouncyDots /> : accepting ? "BẬT" : "TẮT"}
    </span>
  );

  /* ================= Notifications badge (API) ================= */
  const unreadQ = useGetNotificationsQuery({
    page: 1,
    limit: 1,
    isRead: false,
  });
  const derivedUnreadCount = Number(unreadQ.data?.data?.pagination?.total ?? 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 h-14 md:h-16 flex items-center gap-3 md:gap-4 lg:gap-6">
        <button
          onClick={handleMenuClick}
          className="lg:hidden shrink-0 p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="hidden xl:flex items-center gap-2 font-semibold text-lg text-slate-900 truncate">
            {title}
          </h1>
        </div>

        {/* ENTERPRISE: switch desktop */}
        {isEnterprise && (
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
            <Switch
              checked={accepting}
              loading={busy}
              disabled={disableSwitch}
              onChange={onToggleAccepting}
              style={{ backgroundColor: accepting ? "#059669" : "#cbd5e1" }}
            />
            <span className="text-sm font-semibold text-slate-900">
              Nhận đơn
            </span>
            {StatusPill}
          </div>
        )}

        {/* ENTERPRISE: switch mobile */}
        {isEnterprise && (
          <div className="md:hidden flex items-center gap-2">
            <Switch
              checked={accepting}
              loading={busy}
              disabled={disableSwitch}
              onChange={onToggleAccepting}
              style={{ backgroundColor: accepting ? "#059669" : "#cbd5e1" }}
            />
            {StatusPill}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative grid place-items-center w-9 h-9 md:w-10 md:h-10 rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {derivedUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] leading-[18px] rounded-full bg-rose-500 text-white font-bold grid place-items-center shadow-lg">
                  {derivedUnreadCount > 99 ? "99+" : derivedUnreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/0"
                  onClick={() => setShowNotifications(false)}
                />

                {/* ✅ FIX dính viền: mobile có padding, desktop bám phải */}
                <div
                  className="
                    fixed md:absolute z-50
                    top-14 md:top-16
                    left-3 right-3 md:left-auto md:right-0
                    md:w-96
                  "
                  role="dialog"
                  aria-label="Thông báo"
                >
                  <NotificationPanel
                    variant="dropdown"
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              </>
            )}
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
