// src/redux/api/auth/type.ts

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: unknown | null;
};

export type LoginBody = { email: string; password: string };

export type SignupBody = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type VerifyOtpBody = {
  email: string;
  otp: string;
};

export type ResetPasswordBody = {
  email: string;
  otp: string;
  newPassword: string;
};

/** Swagger login trả về: data.user + data.backendToken */
export type LoginResponseData = {
  user: {
    id: number;
    roleId: number;
    role: string;
    email: string;
    fullName: string;
    permissions: string[];
  };
  backendToken: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // nhìn giống epoch ms trong ảnh
  };
};

/** Normalized payload cho FE (để dùng redux dễ hơn) */
export type AuthLoginPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    fullname: string;
    email: string;
    role: string;
    permissions: string[];
  };
};

/** Refresh endpoint: BE có thể trả (1) backendToken, hoặc (2) trực tiếp token */
export type RefreshTokenResponseData =
  | { backendToken: LoginResponseData["backendToken"] }
  | LoginResponseData["backendToken"]
  | {
      accessToken?: string;
      refreshToken?: string;
      expiresIn?: number;
    };
