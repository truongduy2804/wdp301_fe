// lib/dict/menu/menuEnterprise.ts
export const menuEnterprise = {
  vi: {
    items: {
      dashboard: "Bảng thống kê",
      pendingRequests: "Đơn chờ duyệt",
      acceptedRequests: "Đơn đã duyệt",
      requestHistory: "Lịch sử đơn đã hoàn thành",
      collectors: "Quản lý nhân sự thu gom",
      rewardRules: "Quy tắc điểm thưởng",
      settings: "Thông tin doanh nghiệp",
    },
  },
  en: {
    items: {
      dashboard: "Dashboard",
      pendingRequests: "pending Requests",
      acceptedRequests: "accepted Requests",
      requestHistory: "Completed History",
      collectors: "Collector Management",
      settings: "Enterprise Settings",
    },
  },
} as const;
