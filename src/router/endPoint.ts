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

  // Account (relative children) - dùng chung cho mọi role
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  SUBSCRIPTION: "/subscription",

  // ===== Enterprise (relative children) =====
  ENTERPRISE_CHILD: {
    PENDING_REQUESTS: "pending-requests",
    ACCEPTED_REQUESTS: "accepted-requests",
    REQUEST_HISTORY: "request-history",
    CANCELLED_REQUESTS: "cancelled-requests",
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
    MONITOR: "monitor",
    VIOLATIONS: "violations",
    COMPLAINTS: "complaints",
    ENTERPRISE_MAP: "enterprise-map",
    GIFTS: "gifts",
    REDEMPTIONS: "redemptions",
    SUBSCRIPTION_PLANS: "subscription-plans",
    USERS: "users",
    ENTERPRISES: "enterprises",
  },
} as const;

export default endPoint;
