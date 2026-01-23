// components/portal/menu/enterprise.ts
import {
  LayoutDashboard,
  Inbox,
  MapPinned,
  Users,
  Truck,
  BadgePercent,
  BarChart3,
  Settings,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";

export function enterpriseMenu(
  root: string,
  locale: Locale = "vi",
): MenuItem[] {
  const t = getMessages(locale).menuEnterprise.items;

  const RAWS: RawItem[] = [
    [t.dashboard, BarChart3, ""],
    [t.requestsInbox, Inbox, "/requests"], // nhận/duyệt yêu cầu
    [t.mapDispatch, MapPinned, "/dispatch"], // điều phối theo bản đồ/khu vực
    [t.collectors, Users, "/collectors"], // quản lý collector thuộc DN
    [t.assignments, Truck, "/assignments"], // phân công / theo dõi tiến độ
    [t.rewardRules, BadgePercent, "/reward-rules"], // cấu hình điểm thưởng

    [t.settings, Settings, "/settings"],
  ];

  return makeMenu(root, RAWS);
}
