// components/portal/menu/index.ts
import type { Role } from "@/lib/role";
import { ROLES, normalizeRole } from "@/lib/role";
import type { MenuItem } from "./type";

import { adminMenu } from "./admin";
import { enterpriseMenu } from "./enterprise";
import { collectorMenu } from "./collector";
import { citizenMenu } from "./citizen";

import { DEFAULT_LOCALE, type Locale, localizePath } from "@/lib/i18n";

export function buildMenu(
  roleInput: Role | string,
  locale: Locale = DEFAULT_LOCALE,
): MenuItem[] {
  const role = normalizeRole(roleInput as string);

  // ✅ root KHÔNG prefix locale nữa
  let root = ROLES[role] ?? "/";
  root = localizePath(root, locale); // strip /vi|/en nếu còn link cũ

  switch (role) {
    case "ADMIN":
      return adminMenu(root, locale);
    case "ENTERPRISE":
      return enterpriseMenu(root, locale);
    case "COLLECTOR":
      return collectorMenu(root, locale);
    case "CITIZEN":
    default:
      return citizenMenu(root, locale);
  }
}
