// src/redux/feature/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  readProfile,
  writeProfile,
  clearProfile,
  persistTokens,
  readAccessToken,
  readRefreshToken,
  clearTokens,
} from "@/utils/authStorage";
import type { RootState } from "@/redux/store/store";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type User = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  avatar?: string;
  status?: UserStatus;
  permissions?: string[];
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  remember: boolean;
};

const { user, remember } = readProfile();
const initialAccessToken = readAccessToken();
const initialRefreshToken = readRefreshToken();

const initialState: AuthState = {
  accessToken: initialAccessToken ?? null,
  refreshToken: initialRefreshToken ?? null,
  user: user as User | null,
  remember,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (
      s,
      a: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: User;
        remember?: boolean;
      }>,
    ) => {
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
      s.user = a.payload.user;

      if (typeof a.payload.remember === "boolean") {
        s.remember = a.payload.remember;
      }

      writeProfile(s.user, s.remember);
      persistTokens(s.accessToken, s.refreshToken, s.remember);
    },

    setTokens: (
      s,
      a: PayloadAction<{
        accessToken: string | null;
        refreshToken: string | null;
      }>,
    ) => {
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
      persistTokens(s.accessToken, s.refreshToken, s.remember);
    },

    setUserProfile: (
      s,
      a: PayloadAction<{ user: User | null; remember?: boolean }>,
    ) => {
      s.user = a.payload.user;
      if (typeof a.payload.remember === "boolean") {
        s.remember = a.payload.remember;
      }

      writeProfile(s.user, s.remember);
      persistTokens(s.accessToken, s.refreshToken, s.remember);
    },

    logout: (s) => {
      s.accessToken = null;
      s.refreshToken = null;
      s.user = null;
      s.remember = false;
      clearProfile();
      clearTokens();
    },
  },
});

export const { setLoggedIn, setTokens, setUserProfile, logout } =
  authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (st: { auth: AuthState }) => st.auth;
export const selectAccessToken = (st: RootState) => st.auth.accessToken;
export const selectRefreshToken = (st: RootState) => st.auth.refreshToken;
export const selectUser = (st: RootState) => st.auth.user;
export const selectRemember = (st: RootState) => st.auth.remember;
