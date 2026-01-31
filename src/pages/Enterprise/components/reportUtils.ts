import dayjs from "dayjs";
import type { EnterpriseReport } from "@/redux/api/enterprise/reports/types";

export const DEFAULT_TTL_MIN = 10;

export function getExpiredAtISO(r: EnterpriseReport): string | null {
  return (r.expiredAt ?? (r as any).expireAt ?? null) as string | null;
}

export function getSentAtISO(r: EnterpriseReport): string | null {
  return (r.sentAt ?? null) as string | null;
}

/** expiryMs: ưu tiên expiredAt/expireAt, nếu thiếu thì sentAt + 10p */
export function getExpiryMs(r: EnterpriseReport): number | null {
  const expIso = getExpiredAtISO(r);
  if (expIso) return dayjs(expIso).valueOf();

  const sentIso = getSentAtISO(r);
  if (sentIso) return dayjs(sentIso).valueOf() + DEFAULT_TTL_MIN * 60_000;

  return null;
}

/** ttlMs: expireAt - sendAt (thường ~10p). Nếu thiếu thì default 10p */
export function getTtlMs(r: EnterpriseReport): number {
  const expIso = getExpiredAtISO(r);
  const sentIso = getSentAtISO(r);
  if (expIso && sentIso) {
    const ttl = dayjs(expIso).valueOf() - dayjs(sentIso).valueOf();
    return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_MIN * 60_000;
  }
  return DEFAULT_TTL_MIN * 60_000;
}

/** remaining = expiry - now */
export function getRemainingMs(
  r: EnterpriseReport,
  nowMs: number,
): number | null {
  const expiry = getExpiryMs(r);
  if (expiry == null) return null;
  return expiry - nowMs;
}

export function isExpired(r: EnterpriseReport, nowMs: number) {
  const ms = getRemainingMs(r, nowMs);
  return ms != null && ms <= 0;
}

export function formatCountdown(msLeft: number) {
  const clamped = Math.max(0, msLeft);
  const totalSec = Math.floor(clamped / 1000);

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function statusColor(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "PENDING") return "gold";
  if (s.includes("ACCEPT")) return "green";
  if (s.includes("REJECT") || s.includes("CANCEL")) return "red";
  return "default";
}
