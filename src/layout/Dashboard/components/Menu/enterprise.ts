// components/portal/menu/enterprise.ts
import {
  Inbox,
  Users,
  Truck,
  BadgePercent,
  BarChart3,
  Settings,
  History,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";
import endPoint from "@/router/endPoint";

export function enterpriseMenu(
  root: string,
  locale: Locale = "vi",
): MenuItem[] {
  const t = getMessages(locale).menuEnterprise.items;

  const RAWS: RawItem[] = [
    [t.dashboard, BarChart3, ""],

    [t.pendingRequests, Inbox, `/${endPoint.ENTERPRISE_CHILD.PENDING_REQUEST}`],
    [
      t.processingRequests,
      Truck,
      `/${endPoint.ENTERPRISE_CHILD.PROCESSING_REQUEST}`,
    ],
    [
      t.requestHistory,
      History,
      `/${endPoint.ENTERPRISE_CHILD.REQUEST_HISTORY}`,
    ],

    [t.collectors, Users, `/${endPoint.ENTERPRISE_CHILD.COLLECTORS}`],
    [t.rewardRules, BadgePercent, `/${endPoint.ENTERPRISE_CHILD.REWARD_RULES}`],
    [t.settings, Settings, `/${endPoint.ENTERPRISE_CHILD.SETTINGS}`],
  ];

  return makeMenu(root, RAWS);
}
