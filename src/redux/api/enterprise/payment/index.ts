import { baseApi } from "@/redux/api/baseApi";
import type { GetPaymentResponse } from "./types";
import { EnterpriseTransactionHistoryResponse } from "./types";

/** ===== API ===== */
export const enterprisePaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnterprisePayment: builder.query<GetPaymentResponse, string>({
      query: (referenceCode) => ({
        url: `enterprise/payment/${encodeURIComponent(referenceCode)}`,
        method: "GET",
      }),
      providesTags: ["EnterprisePayment"],
    }),

    getEnterpriseTransactionHistory: builder.query<
      EnterpriseTransactionHistoryResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `enterprise/transactions?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["EnterprisePayment"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEnterprisePaymentQuery,
  useLazyGetEnterprisePaymentQuery,
  useGetEnterpriseTransactionHistoryQuery,
  useLazyGetEnterpriseTransactionHistoryQuery,
} = enterprisePaymentApi;
