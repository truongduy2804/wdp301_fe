// components/portal/menu/collector.ts
import {
  LayoutDashboard,
  ClipboardList,
  Route,
  CheckCircle2,
  History,
  MessageSquareWarning,
  Settings,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type"; 
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";

export function collectorMenu(
  root: string,
  locale: Locale = "vi",
): MenuItem[] {
  const t = getMessages(locale).menuCollector.items;

  const RAWS: RawItem[] = [
    [t.dashboard, LayoutDashboard, ""],
    [t.assignedJobs, ClipboardList, "/jobs"],
    [t.onTheWay, Route, "/on-the-way"],
    [t.completed, CheckCircle2, "/completed"],
    [t.history, History, "/history"],
    [t.issues, MessageSquareWarning, "/issues"],
    [t.settings, Settings, "/settings"],
  ];

  return makeMenu(root, RAWS);
}
