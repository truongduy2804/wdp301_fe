// router/portalRoutes.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";
import type { Role } from "@/lib/role";
import RequireRole from "@/router/requireRole";

// layouts
import PortalLayout from "@/layout/Dashboard/PortalLayout";
import AuthLayout from "@/pages/Auth/Layout";

// Admin Pages
import AdminOverviewPage from "@/pages/Admin/AdminOverviewPage";
import AdminStatistics from "@/pages/Admin/Statistics";
import AdminViolations from "@/pages/Admin/Violations";
import AdminSystemMonitor from "@/pages/Admin/SystemMonitor";
import AdminComplaints from "@/pages/Admin/Complaints";
import AdminEnterprisesMap from "@/pages/Admin/EnterprisesMap";
import AdminGifts from "@/pages/Admin/Gifts";
import AdminRedemptions from "@/pages/Admin/Redemptions";
import AdminUserManagement from "@/pages/Admin/UserManagement";
import AdminEnterprisesManagement from "@/pages/Admin/EnterprisesManagement";
import AdminSubscriptionPlans from "@/pages/Admin/SubscriptionPlans";
import AdminPaymentsRevenue from "@/pages/Admin/Payments";

// Enterprise Pages
import EnterpriseDashboard from "@/pages/Enterprise/Statistics";
import EnterpriseRequestPending from "@/pages/Enterprise/PendingRequests";
import EnterpriseRequestAccepted from "@/pages/Enterprise/AcceptedRequests";
import EnterpriseRequestHistory from "@/pages/Enterprise/RequestHistory";
import EnterpriseCancelledRequests from "@/pages/Enterprise/CancelledRequests";
import EnterpriseCollectors from "@/pages/Enterprise/Collectors";
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
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: endPoint.ADMIN_CHILD.USERS, element: <AdminUserManagement /> },
      { path: endPoint.ADMIN_CHILD.MONITOR, element: <AdminSystemMonitor /> },
      { path: endPoint.ADMIN_CHILD.VIOLATIONS, element: <AdminViolations /> },
      { path: endPoint.ADMIN_CHILD.COMPLAINTS, element: <AdminComplaints /> },
      {
        path: endPoint.ADMIN_CHILD.ENTERPRISE_MAP,
        element: <AdminEnterprisesMap />,
      },
      { path: endPoint.ADMIN_CHILD.GIFTS, element: <AdminGifts /> },
      { path: endPoint.ADMIN_CHILD.REDEMPTIONS, element: <AdminRedemptions /> },
      {
        path: endPoint.ADMIN_CHILD.ENTERPRISES,
        element: <AdminEnterprisesManagement />,
      },
      {
        path: endPoint.ADMIN_CHILD.SUBSCRIPTION_PLANS,
        element: <AdminSubscriptionPlans />,
      },
      {
        path: endPoint.ADMIN_CHILD.PAYMENTS,
        element: <AdminPaymentsRevenue />,
      },
    ],
  },
  {
    path: endPoint.ENTERPRISE,
    role: "ENTERPRISE",
    children: [
      { index: true, element: <EnterpriseDashboard /> },
      {
        path: endPoint.ENTERPRISE_CHILD.COLLECTORS,
        element: <EnterpriseCollectors />,
      },

      {
        path: endPoint.ENTERPRISE_CHILD.PENDING_REQUESTS,
        element: <EnterpriseRequestPending />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.ACCEPTED_REQUESTS,
        element: <EnterpriseRequestAccepted />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.REQUEST_HISTORY,
        element: <EnterpriseRequestHistory />,
      },
      {
        path: endPoint.ENTERPRISE_CHILD.CANCELLED_REQUESTS,
        element: <EnterpriseCancelledRequests />,
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
  return (
    <RequireRole allowed={[role]}>
      <PortalLayout role={role} />
    </RequireRole>
  );
}
