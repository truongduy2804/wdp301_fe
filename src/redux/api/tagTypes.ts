// src/redux/api/tagTypes.ts

/**
 * Toàn bộ các "tag type" được dùng trong hệ thống RTK Query.
 *
 * Dùng để quản lý cache, invalidation, và refetch tự động
 * giữa các module API khác nhau.
 */
export const tagTypes = [
  "Auth",
  "WaitingReports",
  "OrderAcceptance",
  "Collectors",
  "Notifications",
  "AccountProfile",
  "EnterpriseProfile",
  "EnterpriseSubscription",
  "EnterprisePayment",
  "EnterprisePlans",
  "AcceptedReports",
] as const;

//  Xuất kiểu để TypeScript autocomplete & kiểm tra chính xác
export type TagType = (typeof tagTypes)[number];
