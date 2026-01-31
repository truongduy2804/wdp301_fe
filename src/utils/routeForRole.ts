// src/utils/routeForRole.ts
import endPoint from "@/router/endPoint";

export type AppRole = "Customer" | "Owner" | "Admin";

/** Trả về path hạ cánh theo role (chấp nhận mọi kiểu chữ) */
export function routeForRole(role?: string): string {
  switch ((role ?? "").toLowerCase()) {
    case "owner":
      return "/layoutOwner/Dashboard";
    case "admin":
      return "/layoutAdmin/Dashboard";
    case "customer":
    default:
      // fallback cho role trống/khác chuẩn
      return endPoint.HOMEPAGE;
  }
}
