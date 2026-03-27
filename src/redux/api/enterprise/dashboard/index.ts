// src/redux/api/enterpriseDashboardApi.ts
import { baseApi } from "../../baseApi";
import {
  DashboardSummary,
  DashboardDateRange,
  DashboardOrder,
  DashboardRankingItem,
  DashboardRankingSortBy,
  DashboardStatsInterval,
  DashboardStatsItem,
  ApiResponse,
} from "./type";

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const enterpriseDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnterpriseDashboardSummary: builder.query<
      DashboardSummary,
      DashboardDateRange | void
    >({
      query: (params) => ({
        url: "enterprise/dashboard/summary",
        method: "GET",
        params: cleanParams(params ?? {}),
      }),
      transformResponse: (response: ApiResponse<DashboardSummary>) =>
        response.data,
      providesTags: [{ type: "EnterpriseDashboard", id: "SUMMARY" }],
    }),

    getEnterpriseDashboardRanking: builder.query<
      DashboardRankingItem[],
      | (DashboardDateRange & {
          sortBy?: DashboardRankingSortBy;
          order?: DashboardOrder;
        })
      | void
    >({
      query: (params) => ({
        url: "enterprise/dashboard/ranking",
        method: "GET",
        params: cleanParams({
          sortBy: "weight",
          order: "desc",
          ...(params ?? {}),
        }),
      }),
      transformResponse: (response: ApiResponse<DashboardRankingItem[]>) =>
        response.data,
      providesTags: [{ type: "EnterpriseDashboard", id: "RANKING" }],
    }),

    getEnterpriseDashboardStats: builder.query<
      DashboardStatsItem[],
      | (DashboardDateRange & {
          interval?: DashboardStatsInterval;
        })
      | void
    >({
      query: (params) => ({
        url: "enterprise/dashboard/stats",
        method: "GET",
        params: cleanParams({
          interval: "day",
          ...(params ?? {}),
        }),
      }),
      transformResponse: (response: ApiResponse<DashboardStatsItem[]>) =>
        response.data,
      providesTags: [{ type: "EnterpriseDashboard", id: "STATS" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetEnterpriseDashboardSummaryQuery,
  useGetEnterpriseDashboardRankingQuery,
  useGetEnterpriseDashboardStatsQuery,
} = enterpriseDashboardApi;
