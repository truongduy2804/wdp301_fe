// src/utils/jwt.ts
import { jwtDecode } from "jwt-decode";

type JwtClaims = {
  sub?: string | number;
  userId?: string | number;
  nameid?: string | number; // một số BE để id ở claim này
};

export function getUserIdFromToken(token?: string | null): number | null {
  if (!token) return null;
  try {
    const { sub, userId, nameid } = jwtDecode<JwtClaims>(token);
    const raw = (userId ?? sub ?? nameid) as string | number | undefined;
    if (raw == null) return null;
    const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
