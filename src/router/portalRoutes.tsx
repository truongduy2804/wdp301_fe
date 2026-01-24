// router/portalRoutes.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import type { Role } from "@/lib/role";

// layouts
import PortalLayout from "@/layout/Dashboard/PortalLayout";
import AuthLayout from "@/pages/Auth/Layout";

// Admin Pages
import AdminDashboard from "@/pages/Admin";

// Enterprise Pages
import EnterpriseDashboard from "@/pages/Enterprise/Statistics";
import EnterpriseRequest from "@/pages/Enterprise/Request";
import EnterpriseDispatch from "@/pages/Enterprise/Dispatch";
import EnterpriseCollectors from "@/pages/Enterprise/Collector";
import EnterpriseAssignments from "@/pages/Enterprise/Assignment";
import EnterpriseRewardRules from "@/pages/Enterprise/RewardRules";
import EnterpriseSettings from "@/pages/Enterprise/Settings";

// Collector Pages
import CollectorDashboard from "@/pages/Collector";

// Citizen Pages
import CitizenDashboard from "@/pages/Citizen";

type ChildRoute = { path: string; element: React.ReactNode };
type PortalChildRoute = {
  index?: boolean;
  path?: string;
  element: React.ReactNode;
};
type PortalRoute = { path: string; role: Role; children: PortalChildRoute[] };

/**
 * TEMP: Đóng HOME
 * "/" -> "/auth?view=login"
 */
export const publicRoutes: ChildRoute[] = [
  {
    path: endPoint.HOMEPAGE, // "/"
    element: <Navigate to={`${endPoint.AUTH}?view=login`} replace />,
  },
];

/**
 * AUTH root
 * "/auth" -> render AuthLayout (bên trong đọc query view)
 */
export const authRoutes: ChildRoute[] = [
  {
    path: endPoint.AUTH, // "/auth"
    element: <AuthLayout />,
  },
];

export const portalRoutes: PortalRoute[] = [
  {
    path: endPoint.ADMIN,
    role: "ADMIN",
    children: [{ index: true, element: <AdminDashboard /> }],
  },
  {
    path: endPoint.ENTERPRISE,
    role: "ENTERPRISE",
    children: [
      { index: true, element: <EnterpriseDashboard /> },
      {
        path: endPoint.ENTERPRISE_CHILD.REQUESTS,
        element: <EnterpriseRequest />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.DISPATCH,
        element: <EnterpriseDispatch />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.COLLECTORS,
        element: <EnterpriseCollectors />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.ASSIGNMENTS,
        element: <EnterpriseAssignments />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.REWARD_RULES,
        element: <EnterpriseRewardRules />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.SETTINGS,
        element: <EnterpriseSettings />,
      },
    ],
  },
  {
    path: endPoint.COLLECTOR,
    role: "COLLECTOR",
    children: [{ index: true, element: <CollectorDashboard /> }],
  },
  {
    path: endPoint.CITIZEN,
    role: "CITIZEN",
    children: [{ index: true, element: <CitizenDashboard /> }],
  },
];

export function PortalRouteWrapper({ role }: { role: Role }) {
  return <PortalLayout role={role} />;
}
