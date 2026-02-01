import type { AppDispatch } from "@/redux/store/store";
import { notificationsApi } from "@/redux/api/enterprise/notifications";
import type {
  NotificationItem,
  GetNotificationsParams,
} from "@/redux/api/enterprise/notifications/types";

/** patch list theo args */
function patchList(
  draft: any,
  args: GetNotificationsParams,
  noti: NotificationItem,
) {
  if (!draft?.data) return;

  // filter theo isRead của query
  if (args.isRead === true) return; // list READ không insert noti mới (thường isRead=false)
  if (args.isRead === false && noti.isRead) return;

  const list: NotificationItem[] = draft.data.data ?? [];
  const exists = list.some((x) => String(x.id) === String(noti.id));
  if (exists) return;

  // insert lên đầu
  list.unshift(noti);

  // giữ đúng limit (để dropdown không phình)
  const limit = args.limit ?? draft.data.pagination?.limit ?? list.length;
  draft.data.data = list.slice(0, limit);

  // update pagination total/totalPages cho cache này
  const p = draft.data.pagination;
  if (p && typeof p.total === "number") {
    p.total += 1;
    const lim = p.limit || limit || 1;
    p.totalPages = Math.max(1, Math.ceil(p.total / lim));
  }
}

/**
 * Gọi khi nhận socket notification mới
 * - update cache: ALL + UNREAD + badge query (limit=1,isRead=false)
 */
export const applyRealtimeNotification = (
  dispatch: AppDispatch | any,
  payload: NotificationItem,
) => {
  // chuẩn hoá tối thiểu
  const noti: NotificationItem = {
    ...payload,
    isRead: payload.isRead ?? false,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };

  const targets: GetNotificationsParams[] = [
    // badge unread ở PortalHeader
    { page: 1, limit: 1, isRead: false },

    // dropdown NotificationPanel
    { page: 1, limit: 8 }, // ALL
    { page: 1, limit: 8, isRead: false }, // UNREAD

    // page NotificationPanel
    { page: 1, limit: 20 }, // ALL
    { page: 1, limit: 20, isRead: false }, // UNREAD
  ];

  for (const args of targets) {
    dispatch(
      notificationsApi.util.updateQueryData("getNotifications", args, (draft) =>
        patchList(draft, args, noti),
      ),
    );
  }
};
