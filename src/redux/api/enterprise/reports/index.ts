import { baseApi } from "@/redux/api/baseApi";
import type {
  AcceptedEnterpriseReport,
  ApiEnvelope,
  EnterpriseReport,
  WaitingReportDetail,
} from "./types";

export const enterpriseReportsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getWaitingReports: b.query<ApiEnvelope<EnterpriseReport[]>, void>({
      query: () => ({ url: "enterprise/reports/waiting", method: "GET" }),
      providesTags: (res) =>
        res?.data
          ? [
              { type: "WaitingReports" as const, id: "LIST" },
              ...res.data.map((r) => ({
                type: "WaitingReports" as const,
                id: r.id,
              })),
            ]
          : [{ type: "WaitingReports" as const, id: "LIST" }],
    }),

    getWaitingReportDetail: b.query<ApiEnvelope<WaitingReportDetail>, number>({
      query: (id) => ({
        url: `enterprise/reports/waiting/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "WaitingReports", id }],
    }),

    acceptReport: b.mutation<ApiEnvelope<unknown>, number>({
      query: (reportId) => ({
        url: `enterprise/reports/${reportId}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "WaitingReports", id },
        { type: "WaitingReports", id: "LIST" },
        { type: "AcceptedReports", id: "LIST" },
      ],
    }),

    rejectReport: b.mutation<
      ApiEnvelope<unknown>,
      { id: number; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `enterprise/reports/${id}/reject`,
        method: "PATCH",
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "WaitingReports", id: arg.id },
        { type: "WaitingReports", id: "LIST" },
      ],
    }),

    getAcceptedReports: b.query<ApiEnvelope<AcceptedEnterpriseReport[]>, void>({
      query: () => ({
        url: "enterprise/reports/accepted",
        method: "GET",
      }),
      providesTags: (res) =>
        res?.data
          ? [
              { type: "AcceptedReports" as const, id: "LIST" },
              ...res.data.map((r) => ({
                type: "AcceptedReports" as const,
                id: r.id,
              })),
            ]
          : [{ type: "AcceptedReports" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWaitingReportsQuery,
  useLazyGetWaitingReportDetailQuery,
  useAcceptReportMutation,
  useRejectReportMutation,
  useGetAcceptedReportsQuery,
} = enterpriseReportsApi;
