// src/redux/api/auth/authApi.ts
import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiEnvelope,
  AuthLoginPayload,
  LoginBody,
  LoginResponseData,
  SignupBody,
  RefreshTokenBody,
  RefreshTokenResponseData,
  ForgotPasswordBody,
  VerifyOtpBody,
  ResetPasswordBody,
} from "./type";

function normalizeLogin(
  resp: ApiEnvelope<LoginResponseData>,
): ApiEnvelope<AuthLoginPayload> {
  return {
    ...resp,
    data: {
      accessToken: resp.data.backendToken.accessToken,
      refreshToken: resp.data.backendToken.refreshToken,
      expiresIn: resp.data.backendToken.expiresIn,
      user: {
        id: resp.data.user.id,
        fullname: resp.data.user.fullName,
        email: resp.data.user.email,
        role: resp.data.user.role,
        avatar: resp.data.user.avatar,
        status: resp.data.user.status,
        permissions: resp.data.user.permissions ?? [],
      },
    },
  };
}

function normalizeRefresh(
  resp: ApiEnvelope<RefreshTokenResponseData>,
): ApiEnvelope<{
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}> {
  const d = resp.data as any;

  const tokenObj = d?.backendToken ?? d; // support cả 2 dạng

  const accessToken = tokenObj?.accessToken;
  const refreshToken = tokenObj?.refreshToken;
  const expiresIn = tokenObj?.expiresIn;

  if (!accessToken || !refreshToken) {
    // fallback trả nguyên resp để dễ debug
    throw new Error(
      "Refresh token response không có accessToken/refreshToken.",
    );
  }

  return { ...resp, data: { accessToken, refreshToken, expiresIn } };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation<ApiEnvelope<AuthLoginPayload>, LoginBody>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      transformResponse: (resp: ApiEnvelope<LoginResponseData>) =>
        normalizeLogin(resp),
    }),

    signup: b.mutation<ApiEnvelope<unknown>, SignupBody>({
      query: (body) => ({ url: "auth/signup", method: "POST", body }),
    }),

    refreshToken: b.mutation<
      ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
        expiresIn?: number;
      }>,
      RefreshTokenBody
    >({
      query: (body) => ({ url: "auth/refresh-token", method: "POST", body }),
      transformResponse: (resp: ApiEnvelope<RefreshTokenResponseData>) =>
        normalizeRefresh(resp),
    }),

    forgotPassword: b.mutation<ApiEnvelope<unknown>, ForgotPasswordBody>({
      query: (body) => ({ url: "auth/forgot-password", method: "POST", body }),
    }),

    verifyOtp: b.mutation<ApiEnvelope<unknown>, VerifyOtpBody>({
      query: (body) => ({ url: "auth/verify-otp", method: "POST", body }),
    }),

    resetPassword: b.mutation<ApiEnvelope<unknown>, ResetPasswordBody>({
      query: (body) => ({ url: "auth/reset-password", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApi;
