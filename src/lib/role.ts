// @/lib/role
import endPoint from "@/router/endPoint";

export type Role = "ADMIN" | "ENTERPRISE" | "COLLECTOR" | "CITIZEN";

/** Map role -> base portal path */
export const ROLES: Record<Role, string> = {
  ADMIN: endPoint.ADMIN,
  ENTERPRISE: endPoint.ENTERPRISE,
  COLLECTOR: endPoint.COLLECTOR,
  CITIZEN: endPoint.CITIZEN,
};

export const ALL_ROLES = Object.keys(ROLES) as Role[];

/** Các prefix path được phép cho từng role */
export const ACCESS_MAP: Record<Role, string[]> = {
  ADMIN: [endPoint.ADMIN],
  ENTERPRISE: [endPoint.ENTERPRISE],
  COLLECTOR: [endPoint.COLLECTOR],
  CITIZEN: [endPoint.CITIZEN],
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Quản trị hệ thống",
  ENTERPRISE: "Doanh nghiệp tái chế",
  COLLECTOR: "Nhân viên thu gom",
  CITIZEN: "Người dân",
};

/** Chuẩn hoá chuỗi role từ nhiều biến thể sang union Role */
export function normalizeRole(input?: string): Role {
  const v = (input || "").toUpperCase().trim();

  if (["ADMIN", "ADMINISTRATOR", "SYSADMIN", "SYSTEM_ADMIN"].includes(v))
    return "ADMIN";

  if (
    [
      "ENTERPRISE",
      "RECYCLING_ENTERPRISE",
      "RECYCLER",
      "BUSINESS",
      "COMPANY",
      "PARTNER",
    ].includes(v)
  )
    return "ENTERPRISE";

  if (["COLLECTOR", "PICKUP", "DRIVER", "WORKER", "SHIPPER"].includes(v))
    return "COLLECTOR";

  if (["CITIZEN", "RESIDENT", "USER", "HOUSEHOLD", "CUSTOMER"].includes(v))
    return "CITIZEN";

  // default fallback
  return "CITIZEN";
}
