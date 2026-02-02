import type { AppDispatch } from "@/redux/store/store";
import { notificationsApi } from "@/redux/api/enterprise/notifications";
import type {
  NotificationItem,
  GetNotificationsParams,
} from "@/redux/api/enterprise/notifications/types";

function ensurePagination(
  draft: any,
  fallback: { page: number; limit: number },
) {
  if (!draft?.data) return null;
  if (!draft.data.pagination) {
    draft.data.pagination = {
      page: fallback.page,
      limit: fallback.limit,
      total: 0,
      totalPages: 1,
    };
  }
  return draft.data.pagination;
}

/** patch list theo args */
function patchList(
  draft: any,
  args: GetNotificationsParams,
  noti: NotificationItem,
) {
  if (!draft?.data) return;

  // filter theo isRead của query
  if (args.isRead === true) return;
  if (args.isRead === false && noti.isRead) return;

  const list: NotificationItem[] = (draft.data.data ??= []);
  const exists = list.some((x) => String(x.id) === String(noti.id));
  if (exists) return;

  // insert lên đầu
  list.unshift(noti);

  // limit
  const limit = args.limit ?? draft.data.pagination?.limit ?? list.length;
  draft.data.data = list.slice(0, limit);

  // pagination: luôn ép total là number
  const p = ensurePagination(draft, { page: args.page ?? 1, limit });
  if (p) {
    p.page = args.page ?? p.page ?? 1;
    p.limit = limit;

    const before = p.total;
    p.total = Number(p.total ?? 0) + 1;

    const lim = Number(p.limit ?? 1);
    p.totalPages = Math.max(1, Math.ceil(p.total / lim));

    console.log("📌 [patchList] args=", args, {
      total_before: before,
      total_after: p.total,
      total_type: typeof p.total,
      limit: p.limit,
      totalPages: p.totalPages,
    });
  }
}

export const applyRealtimeNotification = (
  dispatch: AppDispatch | any,
  payload: NotificationItem,
) => {
  const noti: NotificationItem = {
    ...payload,
    id: Number(payload.id),
    isRead: payload.isRead ?? false,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };

  console.log("⚡ applyRealtimeNotification payload:", noti);

  const targets: GetNotificationsParams[] = [
    // badge unread ở PortalHeader
    { page: 1, limit: 1, isRead: false },

    // dropdown NotificationPanel
    { page: 1, limit: 8 },
    { page: 1, limit: 8, isRead: false },

    // page NotificationPanel
    { page: 1, limit: 20 },
    { page: 1, limit: 20, isRead: false },
  ];

  for (const args of targets) {
    dispatch(
      notificationsApi.util.updateQueryData(
        "getNotifications",
        args,
        (draft) => {
          patchList(draft, args, noti);
        },
      ),
    );
  }
};
