// src/redux/middlewares/auth401.ts
import type { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { logout } from "@/redux/feature/authSlice";

function getHttpStatus(payload: unknown, meta: unknown): number | undefined {
  if (payload && typeof payload === "object") {
    const p = payload as { status?: unknown; originalStatus?: unknown };
    if (typeof p.status === "number") return p.status;
    if (typeof p.originalStatus === "number") return p.originalStatus;
  }
  // RTKQ (fetchBaseQuery) có thể để trong meta
  const m = meta as any;
  const metaStatus = m?.baseQueryMeta?.response?.status;
  return typeof metaStatus === "number" ? metaStatus : undefined;
}

export const auth401: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action)) {
      const status = getHttpStatus(action.payload, (action as any).meta);
      if (status === 401) dispatch(logout());
    }
    return next(action);
  };
