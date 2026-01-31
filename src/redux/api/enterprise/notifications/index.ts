import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  GetNotificationsParams,
  NotificationListData,
} from "./types";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      ApiResponse<NotificationListData>,
      GetNotificationsParams | void
    >({
      query: (params) => ({
        // baseApi của bạn đang dùng /api/v1 rồi thì để "notifications" là đúng
        url: "notifications",
        method: "GET",
        params: params ?? undefined,
      }),
      keepUnusedDataFor: 120,
      providesTags: (res) => {
        const items = res?.data?.data ?? [];
        return [
          { type: "Notifications" as const, id: "LIST" },
          ...items.map((n) => ({ type: "Notifications" as const, id: n.id })),
        ];
      },
    }),

    markReadNotification: build.mutation<ApiResponse<unknown>, number | string>(
      {
        query: (id) => ({
          url: `notifications/${id}/read`,
          method: "PATCH",
        }),
        invalidatesTags: (_res, _err, id) => [
          { type: "Notifications", id: "LIST" },
          { type: "Notifications", id },
        ],
      },
    ),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkReadNotificationMutation,
} = notificationsApi;
