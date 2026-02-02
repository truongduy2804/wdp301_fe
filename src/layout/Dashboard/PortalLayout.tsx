// layouts/PortalLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { normalizeRole, type Role } from "@/lib/role";
import type { Locale } from "@/lib/i18n";

import NotificationsSocketBootstrap from "./components/Header/Notification/SocketBootstrap";
import { selectUser } from "@/redux/feature/authSlice";

type User = {
  name?: string;
  avatar?: string;
};

type Session = {
  role?: string;
  user?: User;
};

type Props = {
  children?: React.ReactNode;
  session?: Session;
  locale?: Locale;
  role?: Role | string;
  allowGuest?: boolean;
};

export default function PortalLayout({
  children,
  session,
  locale = "vi",
  role,
  allowGuest = true,
}: Props) {
  // lấy user từ redux
  const authUser = useSelector(selectUser);
  const userId = authUser?.id;
  const resolvedRole = session?.role ?? role ?? authUser?.role;

  // Chưa có role
  if (!resolvedRole) {
    if (!allowGuest) return <div className="min-h-dvh bg-slate-50" />;
    return (
      <div className="min-h-dvh bg-slate-50">
        {/* mount socket nếu có userId */}
        <NotificationsSocketBootstrap userId={userId} />
        {children ?? <Outlet />}
      </div>
    );
  }

  const finalRole: Role = normalizeRole(resolvedRole as string);

  // ưu tiên hiển thị tên từ redux (fullname), fallback session.user.name
  const userName = authUser?.fullname ?? session?.user?.name;

  return (
    <div className="h-dvh w-full">
      {/* SOCKET: mount 1 lần ở layout */}
      <NotificationsSocketBootstrap userId={userId} />

      <div className="flex h-full">
        <Sidebar role={finalRole} />

        <section className="flex min-w-0 flex-1 flex-col">
          <Header role={finalRole} userName={userName} />

          <div className="overflow-y-auto">{children ?? <Outlet />}</div>
        </section>
      </div>
    </div>
  );
}
