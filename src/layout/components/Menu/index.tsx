// components/portal/menu/index.ts
import type { Role } from "@/lib/role";
import { ROLES, normalizeRole } from "@/lib/role";
import type { MenuItem } from "./type";

import { adminMenu } from "./admin";
import { enterpriseMenu } from "./enterprise";
import { collectorMenu } from "./collector";
import { citizenMenu } from "./citizen.ts";

import { DEFAULT_LOCALE, pickLocaleFromPath, type Locale } from "@/lib/i18n";

export type { MenuItem } from "./type";

export function buildMenu(
  roleInput: Role | string,
  locale: Locale = DEFAULT_LOCALE,
): MenuItem[] {
  const role = normalizeRole(roleInput as string);
  let root = ROLES[role];

  const needsPrefix =
    !root.startsWith(`/${locale}/`) && !root.startsWith(`/${locale}`);
  if (needsPrefix) {
    const cleaned = root.startsWith("/") ? root.slice(1) : root;
    root = `/${locale}/${cleaned}`.replace(/\/+$/, "");
  }

  switch (role) {
    case "ADMIN":
      return adminMenu(root, locale);

    case "ENTERPRISE":
      return enterpriseMenu(root, locale);

    case "COLLECTOR":
      return collectorMenu(root, locale);

    case "CITIZEN":
      return citizenMenu(root, locale);

    default:
      return citizenMenu(root, locale);
  }
}

export function buildMenuFromPath(
  roleInput: Role | string,
  pathname?: string,
): MenuItem[] {
  const loc = pathname
    ? (pickLocaleFromPath(pathname) ?? DEFAULT_LOCALE)
    : DEFAULT_LOCALE;

  return buildMenu(roleInput, loc);
}
