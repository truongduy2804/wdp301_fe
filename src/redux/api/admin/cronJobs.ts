// src/redux/api/enterprise/cronJobs.ts
import { baseApi } from "@/redux/api/baseApi";

export const cronJobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    processPendingReports: build.mutation<{ message?: string }, void>({
      query: () => ({
        url: "cron/process-pending-reports",
        method: "POST",
      }),
    }),

    handleTimeoutAttempts: build.mutation<{ message?: string }, void>({
      query: () => ({
        url: "cron/handle-timeout-attempts",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useProcessPendingReportsMutation,
  useHandleTimeoutAttemptsMutation,
} = cronJobsApi;
