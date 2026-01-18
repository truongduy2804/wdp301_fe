// components/portal/menu/admin.ts
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Settings,
  MessageSquareWarning,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";

export function adminMenu(root: string, locale: Locale = "vi"): MenuItem[] {
  const t = getMessages(locale).menuAdmin.items;

  const RAWS: RawItem[] = [
    [t.dashboard, LayoutDashboard, ""],
    [t.userManagement, Users, "/users"],
    [t.rolesPermissions, ShieldCheck, "/roles"],
    [t.systemMonitoring, ClipboardList, "/monitoring"],
    [t.reportsAnalytics, BarChart3, "/reports"],
    [t.complaintsDisputes, MessageSquareWarning, "/complaints"],
    [t.settings, Settings, "/settings"],
  ];

  return makeMenu(root, RAWS);
}
