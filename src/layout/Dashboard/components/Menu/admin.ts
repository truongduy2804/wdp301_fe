// components/portal/menu/admin.ts
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  MessageSquareWarning,
  Gift,
  History,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";
import endPoint from "@/router/endPoint";

export function adminMenu(root: string, locale: Locale = "vi"): MenuItem[] {
  const t = getMessages(locale).menuAdmin.items;

  const RAWS: RawItem[] = [
    [t.dashboard, LayoutDashboard, ""],
    [t.violations, Users, `/${endPoint.ADMIN_CHILD.VIOLATIONS}`],
    [
      t.complaintsDisputes,
      MessageSquareWarning,
      `/${endPoint.ADMIN_CHILD.COMPLAINTS}`,
    ],
    [t.systemMonitoring, ClipboardList, `/${endPoint.ADMIN_CHILD.MONITOR}`],
    [t.enterpriseMap, Users, `/${endPoint.ADMIN_CHILD.ENTERPRISE_MAP}`],
    [t.giftManagement, Gift, `/${endPoint.ADMIN_CHILD.GIFTS}`],
    [t.redemptionHistory, History, `/${endPoint.ADMIN_CHILD.REDEMPTIONS}`],
  ];

  return makeMenu(root, RAWS);
}
