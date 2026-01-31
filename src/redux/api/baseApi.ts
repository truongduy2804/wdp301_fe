// src/redux/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import type { RootState } from "@/redux/store/store";
import { logout, setTokens } from "@/redux/feature/authSlice";
import { tagTypes } from "./tagTypes";
import { readRefreshToken } from "@/utils/authStorage";

const PROD_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    "",
  ) || "http://localhost:8000/api/v1";

const API_BASE = PROD_BASE.replace(/\/+$/, "") + "/";

const normalizeArgs = (args: string | FetchArgs): string | FetchArgs => {
  if (typeof args === "string") return args.replace(/^\/+/, "");
  if (typeof args.url === "string")
    return { ...args, url: args.url.replace(/^\/+/, "") };
  return args;
};

const rawBase = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

type RawExtra = Parameters<typeof rawBase>[2];

function isHtml(data: unknown): data is string {
  return typeof data === "string" && /^\s*<!doctype html/i.test(data);
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  RawExtra,
  FetchBaseQueryMeta
> = async (args, api, extra) => {
  const normalized = normalizeArgs(args);

  // gọi bình thường
  let res = await rawBase(normalized, api, extra);

  // Nếu là 401 -> thử refresh token (trừ khi chính request đó là refresh)
  if ("error" in res && res.error?.status === 401) {
    const url = typeof normalized === "string" ? normalized : normalized.url;
    const isRefreshCall = (url ?? "").includes("auth/refresh-token");

    if (!isRefreshCall) {
      const state = api.getState() as RootState;
      const refreshToken = state.auth.refreshToken ?? readRefreshToken();

      if (refreshToken) {
        const refreshRes = await rawBase(
          {
            url: "auth/refresh-token",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extra,
        );

        if ("data" in refreshRes) {
          // cố gắng lấy token theo nhiều shape
          const env: any = refreshRes.data;
          const d = env?.data?.backendToken ?? env?.data;

          const accessToken = d?.accessToken;
          const newRefreshToken = d?.refreshToken;

          if (accessToken && newRefreshToken) {
            api.dispatch(
              setTokens({ accessToken, refreshToken: newRefreshToken }),
            );
            // retry request cũ
            res = await rawBase(normalizeArgs(args), api, extra);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } else {
        api.dispatch(logout());
      }
    }
  }

  // chuẩn hoá lỗi HTML / object message
  if ("error" in res) {
    const err = res.error;
    const data = (err as FetchBaseQueryError).data as unknown;

    if (isHtml(data)) {
      (err as FetchBaseQueryError).data = {
        message:
          "Server trả về HTML (có thể sai route/baseUrl hoặc server chặn OPTIONS/PUT/DELETE).",
        htmlSnippet: data.slice(0, 200),
      };
    } else if (data && typeof data === "object") {
      const d = data as any;
      const message =
        d.message ||
        d.Message ||
        (d.statusCode && d.status
          ? `${d.statusCode} ${d.status}`
          : "Request failed");

      (err as FetchBaseQueryError).data = {
        message,
        details: d.errors || undefined,
        statusCode: d.statusCode || undefined,
        status: d.status || undefined,
      };
    }
  }

  return res;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: () => ({}),
});
