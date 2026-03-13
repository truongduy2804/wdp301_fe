// components/portal/menu/enterprise.ts
import {
  Inbox,
  Users,
  CheckCircle2,
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
    [t.collectors, Users, `/${endPoint.ENTERPRISE_CHILD.COLLECTORS}`],
    [
      t.pendingRequests,
      Inbox,
      `/${endPoint.ENTERPRISE_CHILD.PENDING_REQUESTS}`,
    ],
    [
      t.acceptedRequests,
      History,
      `/${endPoint.ENTERPRISE_CHILD.ACCEPTED_REQUESTS}`,
    ],
    [
      t.requestHistory,
      CheckCircle2,
      `/${endPoint.ENTERPRISE_CHILD.REQUEST_HISTORY}`,
    ],
    [t.settings, Settings, `/${endPoint.ENTERPRISE_CHILD.SETTINGS}`],
  ];

  return makeMenu(root, RAWS);
}
