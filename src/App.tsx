import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/Login/LoginPage";
// Path url
import endPoint from "@/router/endPoint";
// layouts
import PortalLayout from "@/layout/PortalLayout";
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
{
  /*-----------------------------------------------------------
   */
}
import CollectorDashboard from "@/pages/Collector";
import CitizenDashboard from "@/pages/Citizen";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path={endPoint.HOMEPAGE} element={<LoginPage />} />
      <Route path={endPoint.AUTH} element={<LoginPage />} />

      {/* Portals */}
      <Route path={endPoint.ADMIN} element={<PortalLayout role="ADMIN" />}>
        <Route index element={<AdminDashboard />} />
        {/* ví dụ thêm route con */}
        {/* <Route path="users" element={<AdminUsers />} /> */}
      </Route>

      <Route
        path={endPoint.ENTERPRISE}
        element={<PortalLayout role="ENTERPRISE" />}
      >
        <Route index element={<EnterpriseDashboard />} />

        <Route
          path={endPoint.ENTERPRISE_REQUESTS}
          element={<EnterpriseRequest />}
        />
        <Route
          path={endPoint.ENTERPRISE_DISPATCH}
          element={<EnterpriseDispatch />}
        />
        <Route
          path={endPoint.ENTERPRISE_COLLECTORS}
          element={<EnterpriseCollectors />}
        />
        <Route
          path={endPoint.ENTERPRISE_ASSIGNMENTS}
          element={<EnterpriseAssignments />}
        />
        <Route
          path={endPoint.ENTERPRISE_REWARD_RULES}
          element={<EnterpriseRewardRules />}
        />
        <Route
          path={endPoint.ENTERPRISE_SETTINGS}
          element={<EnterpriseSettings />}
        />
      </Route>

      <Route
        path={endPoint.COLLECTOR}
        element={<PortalLayout role="COLLECTOR" />}
      >
        <Route index element={<CollectorDashboard />} />
        {/* <Route path="jobs" element={<CollectorJobs />} /> */}
      </Route>

      <Route path={endPoint.CITIZEN} element={<PortalLayout role="CITIZEN" />}>
        <Route index element={<CitizenDashboard />} />
        {/* <Route path="report" element={<CitizenReport />} /> */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={endPoint.AUTH} replace />} />
    </Routes>
  );
}
