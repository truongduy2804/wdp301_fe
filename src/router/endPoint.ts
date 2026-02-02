const endPoint = {
  // ===== Public =====
  HOMEPAGE: "/",
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",

  // ===== Auth =====

  AUTH: "/auth",
  LOGIN: "/auth?view=login",
  REGISTER: "/auth?view=register",
  FORGOTPASSWORD: "/auth?view=forgotpass",

  // ===== Root Portals =====
  ADMIN: "/admin",
  ENTERPRISE: "/enterprise",
  COLLECTOR: "/collector",
  CITIZEN: "/citizen",

  // ===== Enterprise (relative children) =====
  ENTERPRISE_CHILD: {
    PENDING_REQUEST: "pending-requests",
    PROCESSING_REQUEST: "processing-requests",
    REQUEST_HISTORY: "request-history",
    COLLECTORS: "collectors",
    REWARD_RULES: "reward-rules",
    SETTINGS: "settings",
  },

  // ===== Collector (relative children) =====
  COLLECTOR_CHILD: {
    JOBS: "jobs",
    HISTORY: "history",
    PROFILE: "profile",
  },

  // ===== Citizen (relative children) =====
  CITIZEN_CHILD: {
    REPORT: "report",
    REQUEST: "request",
    HISTORY: "history",
  },

  // ===== Admin (relative children) =====
  ADMIN_CHILD: {
    MONITOR: "monitor", // giám sát hệ thống
    ACCOUNTS: "accounts", // quản lý tài khoản + phân quyền
    COMPLAINTS: "complaints", // tranh chấp / khiếu nại
    ENTERPRISE_MAP: "enterprise-map", // bản đồ doanh nghiệp
  },
} as const;

export default endPoint;
