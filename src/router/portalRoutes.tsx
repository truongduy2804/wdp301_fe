import React from "react";
import endPoint from "@/router/endPoint";
import type { Role } from "@/lib/role";

// layouts
import PortalLayout from "@/layout/PortalLayout";

// Auth
import LoginPage from "@/pages/Login/LoginPage";

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

type ChildRoute = { index?: boolean; path?: string; element: React.ReactNode };
type PortalRoute = {
  path: string;
  role: Role;
  children: ChildRoute[];
};

export const authRoutes: ChildRoute[] = [
  { path: endPoint.HOMEPAGE, element: <LoginPage /> },
  { path: endPoint.AUTH, element: <LoginPage /> },
];

export const portalRoutes: PortalRoute[] = [
  {
    path: endPoint.ADMIN,
    role: "ADMIN",
    children: [
      { index: true, element: <AdminDashboard /> },
      // { path: endPoint.ADMIN_CHILD.USERS, element: <AdminUsers /> },
    ],
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
      // { path: endPoint.ENTERPRISE_CHILD.REPORTS, element: <EnterpriseReports /> },
    ],
  },

  {
    path: endPoint.COLLECTOR,
    role: "COLLECTOR",
    children: [
      { index: true, element: <CollectorDashboard /> },
      // { path: endPoint.COLLECTOR_CHILD.JOBS, element: <CollectorJobs /> },
    ],
  },

  {
    path: endPoint.CITIZEN,
    role: "CITIZEN",
    children: [
      { index: true, element: <CitizenDashboard /> },
      // { path: endPoint.CITIZEN_CHILD.REPORT, element: <CitizenReport /> },
    ],
  },
];

export function PortalRouteWrapper({ role }: { role: Role }) {
  return <PortalLayout role={role} />;
}
