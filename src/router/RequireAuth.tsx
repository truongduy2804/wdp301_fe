import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import endPoint from "@/router/endPoint";
import { useAppSelector } from "@/redux/store/hooks";

function getLocalePrefix(pathname: string) {
  const segs = (pathname || "/").split("/").filter(Boolean);
  const hasLocale = segs[0] === "vi" || segs[0] === "en";
  return hasLocale ? `/${segs[0]}` : "";
}

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const localePrefix = getLocalePrefix(location.pathname);

  // lấy token theo nhiều khả năng
  const tokenFromRedux = useAppSelector(
    (s: any) =>
      s.auth?.token ??
      s.auth?.accessToken ??
      s.auth?.data?.token ??
      s.auth?.data?.accessToken,
  );

  const token =
    tokenFromRedux ??
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken");

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return (
      <Navigate
        to={`${localePrefix}${endPoint.AUTH}?view=login&next=${next}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
