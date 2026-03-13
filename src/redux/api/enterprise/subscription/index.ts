import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiEnvelope,
  EnterpriseSubscriptionData,
  RenewSubscriptionRequest,
  RenewSubscriptionResponse,
} from "./types";

export const enterpriseSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /enterprise/subscription */
    getEnterpriseSubscription: builder.query<
      ApiEnvelope<EnterpriseSubscriptionData>,
      void
    >({
      query: () => ({
        url: "enterprise/subscription",
        method: "GET",
      }),
      providesTags: ["EnterpriseSubscription"],
    }),

    /** POST /enterprise/subscription/renew */
    renewEnterpriseSubscription: builder.mutation<
      RenewSubscriptionResponse,
      RenewSubscriptionRequest
    >({
      query: (body) => ({
        url: "enterprise/subscription/renew",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EnterpriseSubscription"], //  renew xong tự refetch gói hiện tại
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEnterpriseSubscriptionQuery,
  useLazyGetEnterpriseSubscriptionQuery,
  useRenewEnterpriseSubscriptionMutation,
} = enterpriseSubscriptionApi;
