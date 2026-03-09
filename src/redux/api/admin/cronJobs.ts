import { baseApi } from "@/redux/api/baseApi";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryApi,
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
} from "@reduxjs/toolkit/query";
import type { RootState } from "@/redux/store/store";

type CronResponse = {
  success: boolean;
  message: string;
  data: {
    processedCount?: number;
    errorCount?: number;
    duration?: number;
  };
};

const CRON_BASE = `${(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "")}/`;

const cronRawBase = fetchBaseQuery({
  baseUrl: CRON_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const callCron = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: {},
) => {
  const result = await cronRawBase(args, api, extraOptions);
  return result;
};

export const cronJobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    processPendingReports: build.mutation<CronResponse, void>({
      async queryFn(_arg, api, extraOptions) {
        const res = await callCron(
          {
            url: "cron/process-pending-reports",
            method: "POST",
          },
          api,
          extraOptions,
        );
        if (res.error) return { error: res.error as FetchBaseQueryError };
        return { data: res.data as CronResponse };
      },
    }),

    handleTimeoutAttempts: build.mutation<CronResponse, void>({
      async queryFn(_arg, api, extraOptions) {
        const res = await callCron(
          {
            url: "cron/handle-timeout-attempts",
            method: "POST",
          },
          api,
          extraOptions,
        );
        if (res.error) return { error: res.error as FetchBaseQueryError };
        return { data: res.data as CronResponse };
      },
    }),
  }),
});

export const {
  useProcessPendingReportsMutation,
  useHandleTimeoutAttemptsMutation,
} = cronJobsApi;
