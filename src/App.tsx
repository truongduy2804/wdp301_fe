// App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import {
  publicRoutes,
  authRoutes,
  portalRoutes,
  PortalRouteWrapper,
} from "@/router/portalRoutes";
import RequireAuth from "@/router/RequireAuth";
import ProfilePage from "@/pages/Account/Profile";
import ChangePasswordPage from "@/pages/Account/ChangePassword";
import NotFoundPage from "@/pages/System/notFound-404";
import ForbiddenPage from "@/pages/System/forbidden-403";

export default function App() {
  return (
    <Routes>
      {/* ===== System pages ===== */}
      <Route path={endPoint.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path={endPoint.NOT_FOUND} element={<NotFoundPage />} />

      {/* ===== Account pages (cần login) ===== */}
      <Route
        path={endPoint.PROFILE}
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={endPoint.CHANGE_PASSWORD}
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        }
      />

      {/* ===== Public ===== */}
      {publicRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element as any} />
      ))}

      {/* ===== Auth ===== */}
      {authRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element as any} />
      ))}

      {/* Redirect path-style -> query-style */}
      <Route
        path={`${endPoint.AUTH}/login`}
        element={<Navigate to={`${endPoint.AUTH}?view=login`} replace />}
      />
      <Route
        path={`${endPoint.AUTH}/register`}
        element={<Navigate to={`${endPoint.AUTH}?view=register`} replace />}
      />
      <Route
        path={`${endPoint.AUTH}/forgot-password`}
        element={<Navigate to={`${endPoint.AUTH}?view=forgot`} replace />}
      />

      {/* ===== Portals ===== */}
      {portalRoutes.map((p) => (
        <Route
          key={p.role}
          path={p.path}
          element={<PortalRouteWrapper role={p.role} />}
        >
          {p.children.map((c, idx) =>
            c.index ? (
              <Route
                key={`${p.role}-index-${idx}`}
                index
                element={c.element as any}
              />
            ) : (
              <Route
                key={`${p.role}-${c.path}-${idx}`}
                path={c.path}
                element={c.element as any}
              />
            ),
          )}

          {/* QUAN TRỌNG: sai path trong portal -> 404 */}
          <Route
            path="*"
            element={<Navigate to={endPoint.NOT_FOUND} replace />}
          />
        </Route>
      ))}

      {/* QUAN TRỌNG: Sai path toàn hệ thống -> 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
