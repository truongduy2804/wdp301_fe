// lib/dict/menu/menuEnterprise.ts
export const menuEnterprise = {
  vi: {
    items: {
      dashboard: "Bảng thống kê",
      pendingRequests: "Chờ duyệt đơn",
      processingRequests: "Đang xử lý",
      requestHistory: "Lịch sử đơn",
      collectors: "Quản lý nhân sự thu gom",
      rewardRules: "Quy tắc điểm thưởng",
      settings: "Cài đặt doanh nghiệp",
    },
  },
  en: {
    items: {
      dashboard: "Dashboard",
      pendingRequests: "Pending Approval",
      processingRequests: "Processing",
      requestHistory: "Completed History",
      collectors: "Collector Management",
      rewardRules: "Reward Rules",
      settings: "Enterprise Settings",
    },
  },
} as const;
