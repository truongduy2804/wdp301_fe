export type ApiResponse<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  error?: any;
  data: T;
};

export type NotificationType =
  | "REPORT_ASSIGNED"
  | "REPORT_UPDATED"
  | "SYSTEM"
  | string;

export type NotificationItem = {
  id: number;
  userId?: number;
  type?: NotificationType;
  title: string;
  content: string;
  meta?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};

export type NotificationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type NotificationListData = {
  data: NotificationItem[];
  pagination: NotificationPagination;
};

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  /** true = đã đọc, false = chưa đọc, undefined = tất cả */
  isRead?: boolean;
};
