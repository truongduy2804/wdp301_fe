import { jwtDecode } from "jwt-decode";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type PersistedProfile = {
  id: number;
  fullname: string;
  email: string;
  role: string;
  avatar?: string;
  status?: UserStatus;
  permissions?: string[];
} | null;

const PROFILE_KEY = "auth_profile";
const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

const ALLOW_PERSIST =
  (import.meta.env.VITE_ALLOW_PERSIST_ACCESS_TOKEN ?? "true") === "true";

const MAX_TTL_MIN = Number(import.meta.env.VITE_PERSIST_TOKEN_MAX_MIN ?? 1440);

export function decodeExp(token: string): number | null {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/* ---------- PROFILE ---------- */
export function readProfile(): { user: PersistedProfile; remember: boolean } {
  try {
    const raw =
      sessionStorage.getItem(PROFILE_KEY) ?? localStorage.getItem(PROFILE_KEY);

    if (!raw) return { user: null, remember: false };

    const parsed = JSON.parse(raw) as {
      user: PersistedProfile;
      remember?: boolean;
    };

    return {
      user: parsed.user ?? null,
      remember: !!parsed.remember,
    };
  } catch {
    return { user: null, remember: false };
  }
}

export function writeProfile(user: PersistedProfile, remember: boolean) {
  const raw = JSON.stringify({ user, remember });

  try {
    if (remember) {
      localStorage.setItem(PROFILE_KEY, raw);
      sessionStorage.removeItem(PROFILE_KEY);
    } else {
      sessionStorage.setItem(PROFILE_KEY, raw);
      localStorage.removeItem(PROFILE_KEY);
    }
  } catch {}
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
  } catch {}
}

/* ---------- TOKENS ---------- */
export function persistTokens(
  accessToken: string | null,
  refreshToken: string | null,
  remember: boolean,
) {
  if (!ALLOW_PERSIST) return;

  try {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;

    if (accessToken) store.setItem(ACCESS_TOKEN_KEY, accessToken);
    else store.removeItem(ACCESS_TOKEN_KEY);

    if (refreshToken) store.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else store.removeItem(REFRESH_TOKEN_KEY);

    other.removeItem(ACCESS_TOKEN_KEY);
    other.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}

export function readAccessToken(): string | null {
  if (!ALLOW_PERSIST) return null;

  try {
    const raw =
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
      localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!raw) return null;

    const exp = decodeExp(raw);
    if (exp) {
      const msLeft = exp * 1000 - Date.now();
      const minsLeft = msLeft / 60000;

      if (minsLeft <= 0 || minsLeft > MAX_TTL_MIN) {
        clearTokens();
        return null;
      }
    }

    return raw;
  } catch {
    return null;
  }
}

export function readRefreshToken(): string | null {
  if (!ALLOW_PERSIST) return null;

  try {
    return (
      sessionStorage.getItem(REFRESH_TOKEN_KEY) ??
      localStorage.getItem(REFRESH_TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}
