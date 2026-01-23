// App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import {
  publicRoutes,
  authRoutes,
  portalRoutes,
  PortalRouteWrapper,
  PublicLayoutChildren,
  AuthLayoutChildren,
} from "@/router/portalRoutes";

type LayoutChild =
  | { index: true; element: React.ReactNode }
  | { path: string; element: React.ReactNode };

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      {publicRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element as any}>
          {(PublicLayoutChildren as LayoutChild[]).map((c, idx) =>
            "index" in c ? (
              <Route
                key={`public-index-${idx}`}
                index
                element={c.element as any}
              />
            ) : (
              <Route
                key={`public-${c.path}-${idx}`}
                path={c.path}
                element={c.element as any}
              />
            ),
          )}
        </Route>
      ))}

      {/* ================= AUTH ================= */}
      {authRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element as any}>
          {(AuthLayoutChildren as LayoutChild[]).map((c, idx) =>
            "index" in c ? (
              <Route
                key={`auth-index-${idx}`}
                index
                element={c.element as any}
              />
            ) : (
              <Route
                key={`auth-${c.path}-${idx}`}
                path={c.path}
                element={c.element as any}
              />
            ),
          )}
        </Route>
      ))}

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
      <Route path="*" element={<Navigate to={endPoint.HOMEPAGE} replace />} />
    </Routes>
  );
}
