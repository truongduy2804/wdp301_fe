import { Routes, Route, Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import {
  authRoutes,
  portalRoutes,
  PortalRouteWrapper,
} from "@/router/portalRoutes";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      {authRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}

      {/* Portals */}
      {portalRoutes.map((p) => (
        <Route
          key={p.role}
          path={p.path}
          element={<PortalRouteWrapper role={p.role} />}
        >
          {p.children.map((c, idx) =>
            c.index ? (
              <Route key={`${p.role}-index`} index element={c.element as any} />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to={endPoint.AUTH} replace />} />
    </Routes>
  );
}
