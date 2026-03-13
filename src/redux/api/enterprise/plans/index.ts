// src/redux/api/enterpriseSubscriptionApi.ts
import { baseApi } from "@/redux/api/baseApi";
import type { ApiEnvelope, EnterprisePlan } from "./types";
export type GetEnterprisePlansResponse = ApiEnvelope<EnterprisePlan[]>;

/** Nếu file bạn đã có injectEndpoints rồi thì chỉ cần thêm endpoint này vào endpoints(builder) */
export const enterpriseSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnterprisePlans: builder.query<GetEnterprisePlansResponse, void>({
      query: () => ({
        url: "enterprise/plans",
        method: "GET",
      }),
      providesTags: ["EnterprisePlans"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEnterprisePlansQuery, useLazyGetEnterprisePlansQuery } =
  enterpriseSubscriptionApi;
