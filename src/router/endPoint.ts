const endPoint = {
  // ===== Auth =====
  HOMEPAGE: "/",
  AUTH: "/auth",
  LOGIN: "/auth?view=login",
  REGISTER: "/auth?view=register",
  FORGOTPASSWORD: "/auth?view=forgotpass",

  // ===== Waste Platform Portals =====
  ADMIN: "/admin",
  COLLECTOR: "/collector",
  CITIZEN: "/citizen",

  // ===== Enterprise Routes =====
  ENTERPRISE: "/enterprise",
  ENTERPRISE_REQUESTS: "/enterprise/requests",
  ENTERPRISE_DISPATCH: "/enterprise/dispatch",
  ENTERPRISE_COLLECTORS: "/enterprise/collectors",
  ENTERPRISE_ASSIGNMENTS: "/enterprise/assignments",
  ENTERPRISE_REWARD_RULES: "/enterprise/reward-rules",
  ENTERPRISE_REPORTS: "/enterprise/reports",
  ENTERPRISE_SETTINGS: "/enterprise/settings",

  // ===== Collector Routes =====
  COLLECTOR_DASHBOARD: "/collector",
  COLLECTOR_JOBS: "/collector/jobs",
  COLLECTOR_HISTORY: "/collector/history",
  COLLECTOR_PROFILE: "/collector/profile",

  // ===== Citizen Routes =====
  CITIZEN_DASHBOARD: "/citizen",
  CITIZEN_REPORT: "/citizen/report",
  CITIZEN_REQUEST: "/citizen/request",
  CITIZEN_HISTORY: "/citizen/history",

  // ===== Admin Routes =====
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ENTERPRISES: "/admin/enterprises",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
};

export default endPoint;
