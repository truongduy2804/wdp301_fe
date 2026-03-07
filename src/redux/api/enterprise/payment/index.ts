// src/redux/api/payment.ts
import { baseApi } from "@/redux/api/baseApi";
import type { GetPaymentResponse } from "./types";

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
  }),
  overrideExisting: false,
});

export const {
  useGetEnterprisePaymentQuery,
  useLazyGetEnterprisePaymentQuery,
} = enterprisePaymentApi;
