import { baseApi } from "@/redux/api/baseApi"; // <-- dùng baseApi bạn đang có

type OrderAcceptanceRes = {
  data: {
    isAcceptingOrders: boolean;
  };
};

type SetOrderAcceptanceArg = {
  isAcceptingOrders: boolean;
};

export const orderAcceptanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //  GET: cache lâu để không gọi lại khi đổi route qua lại
    getOrderAcceptance: build.query<OrderAcceptanceRes, void>({
      query: () => ({
        url: "enterprise/order-acceptance",
        method: "GET",
      }),
      keepUnusedDataFor: 300, // 5 phút (tuỳ bạn tăng)
    }),

    //  PATCH: optimistic update vào cache getOrderAcceptance
    setOrderAcceptance: build.mutation<
      OrderAcceptanceRes,
      SetOrderAcceptanceArg
    >({
      query: (body) => ({
        url: "enterprise/order-acceptance",
        method: "PATCH",
        body,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // ✅ Optimistic: update cache ngay lập tức
        const patch = dispatch(
          orderAcceptanceApi.util.updateQueryData(
            "getOrderAcceptance",
            undefined,
            (draft) => {
              if (!draft.data)
                draft.data = { isAcceptingOrders: arg.isAcceptingOrders };
              else draft.data.isAcceptingOrders = arg.isAcceptingOrders;
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          // rollback nếu PATCH fail
          patch.undo();
        }
      },
    }),
  }),
});

export const { useGetOrderAcceptanceQuery, useSetOrderAcceptanceMutation } =
  orderAcceptanceApi;
