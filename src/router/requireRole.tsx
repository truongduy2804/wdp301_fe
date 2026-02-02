// src/router/RequireRole.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import endPoint from "@/router/endPoint";
import { useAppSelector } from "@/redux/store/hooks";
import { selectUser } from "@/redux/feature/authSlice";
import type { Role } from "@/lib/role";

type Props = {
  allowed: Role[]; // các role được phép
  children?: React.ReactNode;
};

export default function RequireRole({ allowed, children }: Props) {
  const user = useAppSelector(selectUser);
  const location = useLocation();

  // Chưa login -> đưa về login (giữ "from" để sau login quay lại nếu bạn muốn dùng)
  if (!user) {
    return (
      <Navigate
        to={`${endPoint.AUTH}?view=login`}
        state={{ from: location }}
        replace
      />
    );
  }

  const role = String(user.role ?? "").toUpperCase() as Role;

  // Đã login nhưng không đúng role -> 403
  if (!allowed.includes(role)) {
    return <Navigate to={endPoint.FORBIDDEN} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
