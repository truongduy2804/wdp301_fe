// lib/dict/menu/menuAdmin.ts
export const menuAdmin = {
  vi: {
    items: {
      dashboard: "Tổng quan",
      userManagement: "Tài khoản & phân quyền",
      systemMonitoring: "Giám sát hệ thống",
      complaintsDisputes: "Khiếu nại / Tranh chấp",
      enterpriseMap: "Bản đồ doanh nghiệp",
      giftManagement: "Quản lý quà tặng",
      redemptionHistory: "Lịch sử đổi quà",
    },
  },
  en: {
    items: {
      dashboard: "Overview",
      userManagement: "Accounts & Permissions",
      systemMonitoring: "System Monitoring",
      complaintsDisputes: "Complaints / Disputes",
      enterpriseMap: "Enterprise Map",
      giftManagement: "Gift Management",
      redemptionHistory: "Redemption History",
    },
  },
} as const;
