// src/components/AuthTokenWatcher.tsx
import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
  selectAccessToken,
  selectRefreshToken,
  logout,
  setTokens,
} from "@/redux/feature/authSlice";
import { authApi } from "@/redux/api/auth/authApi";

export default function AuthTokenWatcher() {
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);
  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!accessToken || !refreshToken) return;

    let exp: number | undefined;
    try {
      exp = jwtDecode<{ exp?: number }>(accessToken)?.exp;
    } catch {
      return;
    }
    if (!exp) return;

    // refresh trước 30s
    const msLeft = exp * 1000 - Date.now() - 30_000;
    if (msLeft <= 0) return;

    timerRef.current = window.setTimeout(async () => {
      try {
        // ✅ mutation initiate KHÔNG nhận forceRefetch
        const res = await dispatch(
          authApi.endpoints.refreshToken.initiate({ refreshToken }),
        ).unwrap();

        const d = res.data;
        dispatch(
          setTokens({
            accessToken: d.accessToken,
            refreshToken: d.refreshToken,
          }),
        );
      } catch {
        dispatch(logout());
      }
    }, msLeft);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [accessToken, refreshToken, dispatch]);

  return null;
}
