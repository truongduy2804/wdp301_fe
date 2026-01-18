// components/portal/menu/citizen.ts
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardCheck,
  Recycle,
  Trophy,
  History,
  MessageSquareWarning,
  Settings,
} from "lucide-react";
import { makeMenu, type RawItem } from "./utils";
import type { MenuItem } from "./type";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/dict";

export function citizenMenu(root: string, locale: Locale = "vi"): MenuItem[] {
  const t = getMessages(locale).menuCitizen.items;

  const RAWS: RawItem[] = [
    [t.dashboard, LayoutDashboard, ""],
    [t.newReport, PlusCircle, "/report"], // tạo báo cáo rác (ảnh + GPS + mô tả)
    [t.myReports, ClipboardCheck, "/my-reports"], // theo dõi trạng thái (Pending/Accepted/Assigned/Collected)
    [t.sortingGuide, Recycle, "/sorting-guide"], // hướng dẫn phân loại
    [t.rewards, Trophy, "/rewards"], // điểm thưởng + leaderboard theo khu vực
    [t.history, History, "/history"], // lịch sử báo cáo/điểm
    [t.complaints, MessageSquareWarning, "/complaints"], // phản hồi/khiếu nại
    [t.settings, Settings, "/settings"],
  ];

  return makeMenu(root, RAWS);
}
