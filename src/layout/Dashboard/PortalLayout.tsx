// layouts/PortalLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { normalizeRole, type Role } from "@/lib/role";
import type { Locale } from "@/lib/i18n";

type User = {
  name?: string;
  avatar?: string;
};

type Session = {
  role?: string;
  user?: User;
};

type Props = {
  // dùng được cả 2 kiểu: nested route (Outlet) hoặc wrap children
  children?: React.ReactNode;
  // truyền từ AuthProvider/Redux
  session?: Session;
  // locale nếu bạn cần
  locale?: Locale;
  // thêm role để dùng như <PortalLayout role="ADMIN" />
  role?: Role | string;
  // optional: cho phép render khi chưa login
  allowGuest?: boolean;
};

export default function PortalLayout({
  children,
  session,
  locale = "vi",
  role,
  allowGuest = true,
}: Props) {
  const resolvedRole = session?.role ?? role;

  // Chưa có role
  if (!resolvedRole) {
    if (!allowGuest) return <div className="min-h-dvh bg-slate-50" />;
    return (
      <div className="min-h-dvh bg-slate-50">{children ?? <Outlet />}</div>
    );
  }

  const finalRole: Role = normalizeRole(resolvedRole as string);
  const user = session?.user;

  return (
    <div className="h-dvh w-full">
      <div className="flex h-full">
        <Sidebar role={finalRole} />

        <section className="flex min-w-0 flex-1 flex-col">
          <Header role={finalRole} userName={user?.name} />

          <div className=" overflow-y-auto">{children ?? <Outlet />}</div>
        </section>
      </div>
    </div>
  );
}
