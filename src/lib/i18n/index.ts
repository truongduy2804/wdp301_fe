// src/lib/i18n.ts
import { useEffect, useState } from "react";

export type Locale = "vi" | "en";
export const DEFAULT_LOCALE: Locale = "vi";

const LOCALE_KEY = "locale";
const LOCALE_EVENT = "app:locale";

/** Parse cookie locale (fallback only) */
function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)locale=(vi|en)(?:;|$)/);
  return (m?.[1] as Locale) ?? null;
}

/** Init locale to VI by default (and sync html/cookie) */
function initDefaultLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    window.localStorage.setItem(LOCALE_KEY, DEFAULT_LOCALE);
  } catch {
    // ignore
  }

  try {
    document.cookie = `locale=${DEFAULT_LOCALE};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.setAttribute("lang", DEFAULT_LOCALE);
  } catch {
    // ignore
  }

  return DEFAULT_LOCALE;
}

/**
 * ✅ Source of truth: localStorage
 * - Nếu localStorage có -> dùng
 * - Nếu chưa có -> KHỞI TẠO = vi (đúng ý bạn)
 * - Cookie chỉ để fallback “nhẹ”, nhưng vẫn ưu tiên vi nếu storage chưa có
 */
export function getLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const ls = window.localStorage.getItem(LOCALE_KEY);
  if (ls === "vi" || ls === "en") return ls;

  // Nếu chưa có storage -> init luôn VI (để khỏi bị cookie en kéo)
  return initDefaultLocale();
}

export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
  window.localStorage.setItem(LOCALE_KEY, locale);
  document.documentElement.setAttribute("lang", locale);

  window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
}

export function useLocale() {
  const [locale, set] = useState<Locale>(() => getLocale());

  useEffect(() => {
    const on = (e: Event) => {
      const v = (e as CustomEvent).detail;
      if (v === "vi" || v === "en") set(v);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCALE_KEY && (e.newValue === "vi" || e.newValue === "en")) {
        set(e.newValue);
      }
    };

    window.addEventListener(LOCALE_EVENT, on);
    window.addEventListener("storage", onStorage);

    // đảm bảo html lang đúng ngay cả khi locale init lại
    document.documentElement.setAttribute("lang", locale);

    return () => {
      window.removeEventListener(LOCALE_EVENT, on);
      window.removeEventListener("storage", onStorage);
    };
  }, [locale]);

  return locale;
}

/**
 * ✅ tạm thời bỏ /vi /en khỏi URL => locale lấy từ storage/cookie
 * (giờ getLocale() auto init vi nếu thiếu)
 */
export function pickLocaleFromPath(_pathname?: string): Locale {
  return getLocale();
}

/**
 * ✅ không prefix nữa, nhưng strip nếu lỡ có link cũ /vi|/en
 */
export function localizePath(pathname?: string, _locale?: Locale): string {
  const p = typeof pathname === "string" && pathname.length ? pathname : "/";
  const normalized = p.startsWith("/") ? p : `/${p}`;
  return normalized.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
}
