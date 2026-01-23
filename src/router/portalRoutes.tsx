// router/portalRoutes.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import type { Role } from "@/lib/role";

// layouts
import PortalLayout from "@/layout/Dashboard/PortalLayout";
import MainLayout from "@/layout/Home/mainLayout";
import AuthLayout from "@/pages/Auth/Layout";

// Public
import Homepage from "@/pages/HomePage/Home/mainSection";

// Auth pages
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";

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
type PortalRoute = { path: string; role: Role; children: ChildRoute[] };

/** PUBLIC routes (MainLayout) */
export const publicRoutes: ChildRoute[] = [
  {
    path: endPoint.HOMEPAGE, // "/"
    element: <MainLayout />,
  },
];

/** AUTH routes (AuthLayout) */
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

/**  Helpers export để App dùng nested children */
export const PublicLayoutChildren = [
  { index: true, element: <Homepage /> },
  // nếu bạn có thêm public pages thì add ở đây:
  // { path: endPoint.ABOUT, element: <About /> },
];

export const AuthLayoutChildren = [
  { index: true, element: <Navigate to={endPoint.LOGIN} replace /> },

  //  Quan trọng: đây là PATH RELATIVE (không có /auth)
  // => endPoint.LOGIN nên là "/auth/login" nhưng ở đây phải là "login"
  { path: "login", element: <Login /> },
  { path: "register", element: <Register toggleView={() => {}} /> },
  { path: "forgot-password", element: <ForgotPassword /> },
];
