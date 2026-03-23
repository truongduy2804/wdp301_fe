// lib/dict/menu/menuEnterprise.ts
export const menuEnterprise = {
  vi: {
    items: {
      dashboard: "Bảng thống kê",
      pendingRequests: "Đơn chờ phản hồi",
      acceptedRequests: "Đơn đang xử lý",
      requestHistory: "Lịch sử đơn đã hoàn thành",
      cancelledRequests: "Đơn đã hủy",
      collectors: "Quản lý nhân sự thu gom",
      rewardRules: "Quy tắc điểm thưởng",
      settings: "Thông tin doanh nghiệp",
    },
  },
  en: {
    items: {
      dashboard: "Dashboard",
      pendingRequests: "Pending Requests",
      acceptedRequests: "Orders In Progress",
      requestHistory: "Completed History",
      cancelledRequests: "Cancelled Orders",
      collectors: "Collector Management",
      rewardRules: "Reward Rules",
      settings: "Enterprise Settings",
    },
  },
} as const;
