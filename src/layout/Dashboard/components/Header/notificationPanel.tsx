import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkReadNotificationMutation,
} from "@/redux/api/enterprise/notifications";

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

  // ✅ badge count (tổng unread)
  const unreadQ = useGetNotificationsQuery({
    page: 1,
    limit: 1,
    isRead: false,
  });
  const unreadCount = unreadQ.data?.data?.pagination?.total ?? 0;

  // ✅ list: dùng lazy để load more
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
        const map = new Map<number, any>();
        [...prev, ...newItems].forEach((x) => map.set(x.id, x));
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
      // dropdown thì đóng lại cho “mượt”
      if (variant === "dropdown") onClose?.();
      // nếu muốn điều hướng theo meta/type thì xử lý ở đây
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-extrabold text-slate-900">
            Thông báo
          </h3>

          {/* {variant === "dropdown" ? (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                navigate(NOTI_ROUTE);
              }}
              className="text-[13px] font-extrabold text-emerald-700 hover:text-emerald-800"
            >
              Xem tất cả
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              {marking ? "Đang cập nhật..." : ""}
            </span>
          )} */}
        </div>

        {/* Filter kiểu Facebook (to hơn + không wrap) */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={[
              "px-3 py-1.5 rounded-full text-[12px] md:text-sm font-semibold transition whitespace-nowrap leading-none",
              filter === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Tất cả
          </button>

          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={[
              "px-3 py-1.5 rounded-full text-[12px] md:text-sm font-semibold transition whitespace-nowrap leading-none",
              filter === "UNREAD"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Chưa đọc
          </button>

          <button
            type="button"
            onClick={() => setFilter("READ")}
            className={[
              "px-3 py-1.5 rounded-full text-[12px] md:text-sm font-semibold transition whitespace-nowrap leading-none",
              filter === "READ"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Đã đọc
          </button>

          {unreadCount > 0 && (
            <span className="ml-auto text-sm font-semibold text-rose-600 whitespace-nowrap">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div
        className={[
          "overflow-y-auto custom-scrollbar",
          variant === "dropdown" ? "max-h-[50vh]" : "max-h-[calc(100vh-210px)]",
          "p-3", // inset để không dính sát viền
        ].join(" ")}
      >
        {list.isFetching && page === 1 ? (
          <div className="p-8 text-center text-slate-500">
            <LoadingSpinner color="blue" size="6" />
            <div className="mt-2 text-sm font-semibold">Đang tải...</div>
          </div>
        ) : list.isError ? (
          <div className="p-8 text-center text-rose-600 font-extrabold">
            Lỗi tải thông báo
          </div>
        ) : items.length ? (
          <div className="space-y-2">
            {items.map((n) => {
              const unread = !n.isRead;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onClickItem(n)}
                  className={[
                    "w-full text-left rounded-2xl p-3 transition",
                    "hover:bg-slate-50 active:scale-[0.99]",
                    unread ? "bg-emerald-50/60" : "bg-white",
                    "border border-slate-100",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {/* dot trái */}
                    <div
                      className={[
                        "w-2.5 h-2.5 rounded-full mt-2 shrink-0",
                        unread ? "bg-emerald-600" : "bg-slate-200",
                      ].join(" ")}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-extrabold text-[15px] text-slate-900 mb-1 line-clamp-1">
                          {n.title}
                        </p>
                      </div>

                      <p className="text-[13px] text-slate-600 line-clamp-2">
                        {n.content}
                      </p>

                      <p className="text-[12px] text-slate-400 mt-1 font-semibold">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* dot phải kiểu fb */}
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Load more (chỉ page) */}
            {variant === "page" && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!canLoadMore || list.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className={[
                    "w-full rounded-2xl px-4 py-3 text-[15px] font-extrabold transition",
                    canLoadMore
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  {list.isFetching
                    ? "Đang tải..."
                    : canLoadMore
                      ? "Tải thêm"
                      : "Hết thông báo"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-extrabold">
              {filter === "UNREAD"
                ? "Bạn đã đọc hết rồi"
                : filter === "READ"
                  ? "Chưa có thông báo đã đọc"
                  : "Chưa có thông báo"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
