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

export default function App() {
  return (
    <Routes>
      {/* ================= PROFILE ACCOUNT ================= */}
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
      {/* ================= PUBLIC (TEMP: redirect HOME) ================= */}
      {publicRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element as any} />
      ))}

      {/* ================= AUTH (query-based) ================= */}
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

      {/* ================= PORTALS ================= */}
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
        </Route>
      ))}

      {/* ================= FALLBACK ================= */}
      <Route
        path="*"
        element={<Navigate to={`${endPoint.AUTH}?view=login`} replace />}
      />
    </Routes>
  );
}
