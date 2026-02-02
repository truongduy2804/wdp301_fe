import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Inbox,
  ChevronRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loadingSpinner";
// TODO: Uncomment when notifications API is created
// import {
//   useGetNotificationsQuery,
//   useLazyGetNotificationsQuery,
//   useMarkReadNotificationMutation,
// } from "@/redux/api/enterprise/notifications";

// Stub hooks until notifications API exists
const useGetNotificationsQuery = (args: any) => ({
  data: { data: { pagination: { total: 0 }, data: [] } },
  isFetching: false,
  isError: false,
});

const useLazyGetNotificationsQuery = () => [
  (args: any, force?: boolean) => { },
  {
    data: { data: { pagination: { totalPages: 1 }, data: [] } },
    isFetching: false,
    isError: false,
  },
];

const useMarkReadNotificationMutation = () => [
  (id: number) => ({ unwrap: async () => { } }),
  { isLoading: false },
];


type Variant = "dropdown" | "page";
type Filter = "ALL" | "UNREAD" | "READ";

const NOTI_ROUTE = "/enterprise/notifications";

function formatTimeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

/** Lấy type/cate an toàn */
function pickType(n: any) {
  const raw =
    n?.eventCode ?? n?.type ?? n?.category ?? n?.meta?.type ?? "SYSTEM";
  const value =
    raw && typeof raw === "object"
      ? (raw.code ?? raw.type ?? raw.name ?? "SYSTEM")
      : raw;
  return String(value).toUpperCase();
}

/**
 * Order/Đơn: theme BLUE
 * System: theme EMERALD
 * Bạn chỉnh rule isOrder ở đây theo backend thực tế
 */
function getNotiVisual(n: any) {
  const type = pickType(n);

  const isOrder =
    type === "REPORT_STATUS_CHANGED" ||
    type === "REPORT_ASSIGNED" ||
    type.startsWith("REPORT_") ||
    type.includes("ORDER") ||
    type.includes("ASSIGN");

  if (isOrder) {
    return {
      Icon: Package,
      rowUnread: "bg-blue-50/30",
      rowHover: "hover:bg-blue-50/50",
      wrapUnread: "bg-blue-100 ring-2 ring-blue-200",
      iconUnread: "text-blue-600",
      dotUnread: "bg-blue-600",
      barUnread: "bg-blue-600",
      readText: "text-blue-600",
    };
  }

  return {
    Icon: ShieldCheck,
    rowUnread: "bg-emerald-50/30",
    rowHover: "hover:bg-emerald-50/50",
    wrapUnread: "bg-emerald-100 ring-2 ring-emerald-200",
    iconUnread: "text-emerald-600",
    dotUnread: "bg-emerald-600",
    barUnread: "bg-emerald-600",
    readText: "text-emerald-600",
  };
}

export default function NotificationPanel({
  variant,
  onClose,
}: {
  variant: Variant;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const limit = variant === "dropdown" ? 8 : 20;

  // badge count (tổng unread)
  const unreadQ = useGetNotificationsQuery({
    page: 1,
    limit: 1,
    isRead: false,
  });
  const unreadCount = Number(unreadQ.data?.data?.pagination?.total ?? 0);

  console.log(
    "🔎 [NotificationPanel] unread total raw:",
    unreadQ.data?.data?.pagination?.total,
    "type:",
    typeof unreadQ.data?.data?.pagination?.total,
    "derived:",
    unreadCount,
  );

  // list: dùng lazy để load more
  const [trigger, list] = useLazyGetNotificationsQuery();
  const [items, setItems] = useState<any[]>([]);

  const args = useMemo(() => {
    const isRead =
      filter === "UNREAD" ? false : filter === "READ" ? true : undefined;
    return { page, limit, isRead };
  }, [page, limit, filter]);

  useEffect(() => {
    // reset khi đổi filter
    setPage(1);
    setItems([]);
  }, [filter]);

  useEffect(() => {
    trigger(args, true);
  }, [trigger, args]);

  useEffect(() => {
    const newItems = list.data?.data?.data ?? [];
    if (page === 1) setItems(newItems);
    else {
      setItems((prev) => {
        const map = new Map<string, any>();
        [...prev, ...newItems].forEach((x) => map.set(String(x.id), x));
        return Array.from(map.values());
      });
    }
  }, [list.data, page]);

  const totalPages = list.data?.data?.pagination?.totalPages ?? 1;
  const canLoadMore = variant === "page" && page < totalPages;

  const [markRead, { isLoading: marking }] = useMarkReadNotificationMutation();

  const onClickItem = async (n: any) => {
    try {
      if (!n.isRead) {
        await markRead(n.id).unwrap();
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
        );
      }
    } catch {
      // không chặn UX
    } finally {
      if (variant === "dropdown") onClose?.();
      // nếu muốn điều hướng theo type/meta:
      // navigate(...);
    }
  };

  const tabBase =
    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap " +
    "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 " +
    "[-webkit-tap-highlight-color:transparent]";

  return (
    <div
      className={[
        "flex flex-col bg-white",
        variant === "dropdown"
          ? "w-full max-w-md shadow-2xl rounded-xl overflow-hidden"
          : "w-full max-w-3xl mx-auto",
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-emerald-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thông báo</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white mt-0.5">
                  {unreadCount} thông báo mới
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && filter !== "UNREAD" && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
              {unreadCount} Chưa đọc
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter("ALL")}
            className={[
              tabBase,
              filter === "ALL"
                ? "bg-emerald-600/90 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
            ].join(" ")}
          >
            <Inbox className="w-4 h-4" />
            Tất cả
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={[
              tabBase,
              filter === "UNREAD"
                ? "bg-emerald-600/90 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
            ].join(" ")}
          >
            <Bell className="w-4 h-4" />
            Chưa đọc
          </button>
          <button
            onClick={() => setFilter("READ")}
            className={[
              tabBase,
              filter === "READ"
                ? "bg-emerald-600/90 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
            ].join(" ")}
          >
            <CheckCheck className="w-4 h-4" />
            Đã đọc
          </button>
        </div>
      </div>

      {/* List */}
      <div
        className={[
          "bg-white overflow-y-auto custom-scrollbar border border-slate-200",
          variant === "dropdown" ? "max-h-[400px]" : "min-h-[60vh]",
        ].join(" ")}
      >
        {list.isFetching && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <LoadingSpinner size="8" />
            <p className="text-sm text-slate-500 mt-3">Đang tải thông báo...</p>
          </div>
        ) : list.isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-3 bg-red-100 rounded-full mb-3">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Lỗi tải thông báo
            </p>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử lại sau</p>
          </div>
        ) : items.length ? (
          <div className="divide-y divide-slate-100">
            {items.map((n) => {
              const unread = !n.isRead;
              const v = getNotiVisual(n);
              const Icon = v.Icon;

              return (
                <button
                  key={n.id}
                  onClick={() => onClickItem(n)}
                  className={[
                    "w-full text-left px-5 py-4 transition-all group relative",
                    "active:scale-[0.99]",
                    v.rowHover,
                    unread ? v.rowUnread : "bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  {/* Unread indicator bar */}
                  {unread && (
                    <div
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full",
                        v.barUnread,
                      ].join(" ")}
                    />
                  )}

                  <div className="flex gap-3">
                    {/* Avatar/Icon */}
                    <div
                      className={[
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        unread ? v.wrapUnread : "bg-slate-100",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "w-5 h-5",
                          unread ? v.iconUnread : "text-slate-400",
                        ].join(" ")}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={[
                            "text-sm leading-snug line-clamp-1",
                            unread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700",
                          ].join(" ")}
                        >
                          {n.title}
                        </h3>

                        {unread && (
                          <div
                            className={[
                              "flex-shrink-0 w-2 h-2 rounded-full mt-1",
                              v.dotUnread,
                            ].join(" ")}
                          />
                        )}
                      </div>

                      <p
                        className={[
                          "text-sm leading-relaxed line-clamp-2 mb-2",
                          unread ? "text-slate-700" : "text-slate-500",
                        ].join(" ")}
                      >
                        {n.content}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {formatTimeAgo(n.createdAt)}
                        </span>

                        {!unread && (
                          <div
                            className={[
                              "flex items-center gap-1",
                              v.readText,
                            ].join(" ")}
                          >
                            <Check className="w-3 h-3" />
                            <span className="text-xs font-medium">Đã đọc</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </button>
              );
            })}

            {/* Load more (chỉ page) */}
            {variant === "page" && (
              <div className="px-5 py-4 bg-slate-50">
                <button
                  disabled={!canLoadMore || list.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className={[
                    "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                    canLoadMore && !list.isFetching
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-xl"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  {list.isFetching ? (
                    <>
                      <LoadingSpinner color="white" size="4" inline />
                      Đang tải...
                    </>
                  ) : canLoadMore ? (
                    <>
                      <ChevronRight className="w-4 h-4 rotate-90" />
                      Tải thêm thông báo
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Đã hiển thị tất cả
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-slate-100 rounded-2xl mb-4">
              {filter === "UNREAD" ? (
                <CheckCheck className="w-8 h-8 text-emerald-600" />
              ) : filter === "READ" ? (
                <Inbox className="w-8 h-8 text-slate-400" />
              ) : (
                <Bell className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">
              {filter === "UNREAD"
                ? "Tuyệt vời! Bạn đã đọc hết rồi"
                : filter === "READ"
                  ? "Chưa có thông báo đã đọc"
                  : "Chưa có thông báo nào"}
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              {filter === "UNREAD"
                ? "Không có thông báo mới nào cần xem"
                : filter === "READ"
                  ? "Các thông báo đã đọc sẽ hiển thị ở đây"
                  : "Thông báo của bạn sẽ xuất hiện tại đây"}
            </p>
          </div>
        )}
      </div>

      {/* Footer status (optional) */}
      {marking && (
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <LoadingSpinner size="4" inline />
            <span>Đang cập nhật...</span>
          </div>
        </div>
      )}
    </div>
  );
}
