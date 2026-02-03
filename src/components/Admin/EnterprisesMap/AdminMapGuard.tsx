// src/components/Admin/EnterprisesMap/AdminMapGuard.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import endPoint from "@/router/endPoint";
import { selectAccessToken, selectUser } from "@/redux/feature/authSlice";

type Props = {
  children: React.ReactNode;
};

export default function AdminMapGuard({ children }: Props) {
  const token = useSelector(selectAccessToken);
  const user = useSelector(selectUser);
  const location = useLocation();

  const hasToken = !!token;
  const isAdmin = user?.role === "ADMIN";

  // Chưa login => về login (giữ state để quay lại)
  if (!hasToken || !user) {
    return (
      <Navigate
        to={endPoint.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Có login nhưng không phải ADMIN => 403
  if (!isAdmin) {
    return <Navigate to={endPoint.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}
