// src/components/Admin/EnterprisesMap/AdminMapGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import endPoint from "@/router/endPoint";

interface AdminMapGuardProps {
    children: React.ReactNode;
}

const AdminMapGuard: React.FC<AdminMapGuardProps> = ({ children }) => {
    // We'll check the roleId and role from localStorage as implemented in the mock login
    const role = localStorage.getItem("mock_role") || sessionStorage.getItem("mock_role");
    const roleId = localStorage.getItem("mock_role_id") || sessionStorage.getItem("mock_role_id");

    const token = localStorage.getItem("econet_access_token") || sessionStorage.getItem("econet_access_token");

    console.log("AdminMapGuard Check:", { role, roleId, hasToken: !!token });

    // The user specifically asked for role id = 4 (Admin)
    const isAuthorized = (role === "ADMIN" || roleId === "4") && !!token;

    if (!isAuthorized) {
        console.warn("Unauthorized access to Admin Map. Redirecting to home/login.");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminMapGuard;
